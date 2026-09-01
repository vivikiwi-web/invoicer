const jwt = require("jsonwebtoken");
const env = require("../config/env");

const UNIT_MS = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };

function parseExpiresToMs(value) {
	if (typeof value === "number" && Number.isFinite(value)) {
		return value * 1000;
	}
	const match = String(value || "").trim().match(/^(\d+)([smhd])$/i);
	if (!match) return 7 * 24 * 60 * 60 * 1000;
	return Number(match[1]) * UNIT_MS[match[2].toLowerCase()];
}

const cookieMaxAge = parseExpiresToMs(env.jwtExpiresIn);

function signToken(payload) {
	return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

function verifyToken(token) {
	return jwt.verify(token, env.jwtSecret);
}

const cookieOptions = {
	httpOnly: true,
	secure: env.isProd || env.cookieSameSite === "none",
	sameSite: env.cookieSameSite,
	maxAge: cookieMaxAge,
	path: "/",
};

module.exports = { signToken, verifyToken, cookieOptions, parseExpiresToMs };
