const env = require("../config/env");
const { verifyToken } = require("../utils/jwt");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");

async function requireAuth(req, res, next) {
	try {
		const token = req.cookies?.[env.cookieName];
		if (!token) throw ApiError.unauthorized();

		const payload = verifyToken(token);
		const user = await User.findById(payload.sub);
		if (!user) throw ApiError.unauthorized("Session no longer valid");
		if ((payload.tv ?? 1) !== (user.token_version ?? 1)) {
			throw ApiError.unauthorized("Session no longer valid");
		}

		req.user = user;
		next();
	} catch (err: unknown) {
		const name = err && typeof err === "object" && "name" in err ? String(err.name) : "";
		if (name === "JsonWebTokenError" || name === "TokenExpiredError") {
			return next(ApiError.unauthorized("Invalid or expired session"));
		}
		next(err);
	}
}

module.exports = { requireAuth };
