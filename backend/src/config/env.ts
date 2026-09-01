const dotenv = require("dotenv");
const path = require("path");

dotenv.config({
	path: path.resolve(__dirname, "../../.env"),
});

const required = ["DATABASE_URL", "JWT_SECRET"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
	console.error(
		`Missing required environment variables: ${missing.join(", ")}`,
	);
	process.exit(1);
}

const isProd = process.env.NODE_ENV === "production";
const jwtSecret = process.env.JWT_SECRET || "";
if (jwtSecret.length < 32) {
	const message = "JWT_SECRET must be at least 32 characters";
	if (isProd) {
		console.error(message);
		process.exit(1);
	}
	console.warn(`${message}. Using a short secret is not safe outside local development.`);
}
const cookieSameSite = (process.env.COOKIE_SAMESITE || "lax").toLowerCase();

module.exports = {
	nodeEnv: process.env.NODE_ENV || "development",
	port: Number(process.env.PORT) || 8000,
	databaseUrl: process.env.DATABASE_URL,
	sslRejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false",
	jwtSecret,
	jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
	cookieName: process.env.COOKIE_NAME || "aimb_token",
	cookieSameSite: cookieSameSite === "none" ? "none" : "lax",
	clientOrigin: (process.env.CLIENT_ORIGIN || "http://localhost:5173")
		.split(",")
		.map((origin) => origin.trim())
		.filter(Boolean),
	geminiApiKey: process.env.GEMINI_API_KEY || "",
	geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
	geminiModelCheap: process.env.GEMINI_MODEL_CHEAP || "gemini-2.5-flash-lite",
	geminiModelStandard:
		process.env.GEMINI_MODEL_STANDARD ||
		process.env.GEMINI_MODEL ||
		"gemini-2.5-flash",
	isProd,
};
