const ApiError = require("../utils/ApiError");

/** Express 5 exposes `req.query` as a prototype getter with no setter. */
function assignValidated(req, source, data) {
	try {
		req[source] = data;
		if (req[source] === data) return;
	} catch {
		// getter-only property (req.query)
	}
	Object.defineProperty(req, source, {
		configurable: true,
		enumerable: true,
		writable: true,
		value: data,
	});
}

const validate =
	(schema, source = "body") =>
	(req, res, next) => {
		const result = schema.safeParse(req[source]);
		if (!result.success) {
			return next(
				ApiError.badRequest("Validation failed", result.error.issues),
			);
		}
		assignValidated(req, source, result.data);
		next();
	};

module.exports = { validate };
