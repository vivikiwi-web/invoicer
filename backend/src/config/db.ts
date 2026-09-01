const { Pool } = require("pg");
const env = require("./env");
const { runMigrations } = require("./runMigrations");

const pool = new Pool({
	connectionString: env.databaseUrl,
	ssl: {
		rejectUnauthorized: env.sslRejectUnauthorized,
	},
	max: 10,
	idleTimeoutMillis: 30_000,
	connectionTimeoutMillis: 10_000,
});

pool.on("error", (err) => {
	console.error("PostgreSQL pool error:", err);
});

async function query(text, params) {
	return pool.query(text, params);
}

async function queryOne(text, params) {
	const { rows } = await query(text, params);
	return rows[0] || null;
}

async function withTransaction(fn) {
	const client = await pool.connect();
	try {
		await client.query("BEGIN");
		const result = await fn(client);
		await client.query("COMMIT");
		return result;
	} catch (error) {
		await client.query("ROLLBACK");
		throw error;
	} finally {
		client.release();
	}
}

async function connectDB() {
	const { rows } = await pool.query("SELECT current_database() as db");
	await runMigrations(pool);
	console.log(`Postgres connected to ${rows[0].db} database`);
}

module.exports = {
	pool,
	query,
	queryOne,
	withTransaction,
	connectDB,
};