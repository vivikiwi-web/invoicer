const bcrypt = require("bcrypt");
const { query, queryOne } = require("../config/db");

const PUBLIC_COLS = "id, email, name, locale, token_version, created_at, updated_at";

function hashPassword(plain) {
	return bcrypt.hash(plain, 12);
}

function comparePassword(plain, hash) {
	return bcrypt.compare(plain, hash);
}

async function findByEmail(email) {
	return queryOne(`SELECT * FROM users WHERE email = $1`, [email]);
}

async function findById(id) {
	return queryOne(`SELECT ${PUBLIC_COLS} FROM users WHERE id = $1`, [id]);
}

async function findByIdWithHash(id) {
	return queryOne(`SELECT * FROM users WHERE id = $1`, [id]);
}

async function create({ name, email, passwordHash, locale = "lt" }) {
	return queryOne(
		`INSERT INTO users (name, email, password_hash, locale)
		VALUES ($1, $2, $3, $4)
		RETURNING ${PUBLIC_COLS}`,
		[name, email, passwordHash, locale === "en" ? "en" : "lt"],
	);
}

async function updateName(id, name) {
	return updateProfile(id, { name });
}

async function updateProfile(id, { name, locale }: { name?: string; locale?: string } = {}) {
	const sets: string[] = [];
	const values: unknown[] = [id];
	if (name !== undefined) {
		values.push(name);
		sets.push(`name = $${values.length}`);
	}
	if (locale !== undefined) {
		values.push(locale === "en" ? "en" : "lt");
		sets.push(`locale = $${values.length}`);
	}
	if (!sets.length) return findById(id);
	return queryOne(
		`UPDATE users SET ${sets.join(", ")}, updated_at = now()
		WHERE id = $1 RETURNING ${PUBLIC_COLS}`,
		values,
	);
}

async function updatePassword(id, passwordHash) {
	return queryOne(
		`UPDATE users
		SET password_hash = $2, token_version = token_version + 1, updated_at = now()
		WHERE id = $1 RETURNING ${PUBLIC_COLS}`,
		[id, passwordHash],
	);
}

function toPublicUser(row) {
	if (!row) return row;
	return {
		id: row.id,
		email: row.email,
		name: row.name,
		locale: row.locale === "en" ? "en" : "lt",
		created_at: row.created_at,
		updated_at: row.updated_at,
	};
}

module.exports = {
	PUBLIC_COLS,
	hashPassword,
	comparePassword,
	findByEmail,
	findById,
	findByIdWithHash,
	create,
	updateName,
	updateProfile,
	updatePassword,
	toPublicUser,
};
