const { SCHEMA_SQL } = require("./schema");

const MIGRATIONS = [
	{
		id: "001_initial",
		sql: SCHEMA_SQL,
	},
	{
		id: "002_token_version_and_status_check",
		sql: `
ALTER TABLE users
	ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 1;

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'invoices_status_check'
	) THEN
		ALTER TABLE invoices
			ADD CONSTRAINT invoices_status_check
			CHECK (status IN ('draft', 'sent', 'paid'));
	END IF;
END $$;
`,
	},
	{
		id: "003_locale_eur_document_language_ai_usage",
		sql: `
ALTER TABLE users
	ADD COLUMN IF NOT EXISTS locale TEXT NOT NULL DEFAULT 'lt';

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'users_locale_check'
	) THEN
		ALTER TABLE users
			ADD CONSTRAINT users_locale_check
			CHECK (locale IN ('lt', 'en'));
	END IF;
END $$;

ALTER TABLE company_settings
	ALTER COLUMN currency SET DEFAULT 'EUR';

ALTER TABLE invoices
	ALTER COLUMN currency SET DEFAULT 'EUR';

ALTER TABLE expenses
	ALTER COLUMN currency SET DEFAULT 'EUR';

ALTER TABLE company_settings
	ADD COLUMN IF NOT EXISTS default_document_language TEXT NOT NULL DEFAULT 'lt';

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'company_settings_default_document_language_check'
	) THEN
		ALTER TABLE company_settings
			ADD CONSTRAINT company_settings_default_document_language_check
			CHECK (default_document_language IN ('lt', 'en'));
	END IF;
END $$;

ALTER TABLE clients
	ADD COLUMN IF NOT EXISTS document_language TEXT;

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'clients_document_language_check'
	) THEN
		ALTER TABLE clients
			ADD CONSTRAINT clients_document_language_check
			CHECK (document_language IS NULL OR document_language IN ('lt', 'en'));
	END IF;
END $$;

ALTER TABLE invoices
	ADD COLUMN IF NOT EXISTS document_language TEXT;

UPDATE invoices
SET document_language = 'en'
WHERE document_language IS NULL;

ALTER TABLE invoices
	ALTER COLUMN document_language SET DEFAULT 'lt';

ALTER TABLE invoices
	ALTER COLUMN document_language SET NOT NULL;

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'invoices_document_language_check'
	) THEN
		ALTER TABLE invoices
			ADD CONSTRAINT invoices_document_language_check
			CHECK (document_language IN ('lt', 'en'));
	END IF;
END $$;

CREATE TABLE IF NOT EXISTS ai_usage_events (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	feature TEXT NOT NULL,
	model TEXT NOT NULL,
	success BOOLEAN NOT NULL,
	fallback_used BOOLEAN NOT NULL DEFAULT false,
	input_tokens INTEGER,
	output_tokens INTEGER,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_user_created ON ai_usage_events(user_id, created_at DESC);
`,
	},
];

async function runMigrations(pool) {
	await pool.query(`
		CREATE TABLE IF NOT EXISTS schema_migrations (
			id TEXT PRIMARY KEY,
			applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
		)
	`);

	const { rows } = await pool.query(`SELECT id FROM schema_migrations`);
	const applied = new Set(rows.map((r) => r.id));

	for (const migration of MIGRATIONS) {
		if (applied.has(migration.id)) continue;
		await pool.query("BEGIN");
		try {
			await pool.query(migration.sql);
			await pool.query(`INSERT INTO schema_migrations (id) VALUES ($1)`, [
				migration.id,
			]);
			await pool.query("COMMIT");
			console.log(`Applied migration ${migration.id}`);
		} catch (err) {
			await pool.query("ROLLBACK");
			throw err;
		}
	}
}

module.exports = { runMigrations, MIGRATIONS };
