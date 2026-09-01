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
