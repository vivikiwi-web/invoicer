const { pool } = require("../src/config/db");
const { runMigrations } = require("../src/config/runMigrations");

(async () => {
	try {
		await runMigrations(pool);
		console.log("Migrations applied.");
	} catch (err) {
		console.error("Migration failed:", (err as Error).message);
		process.exitCode = 1;
	} finally {
		await pool.end();
	}
})();
