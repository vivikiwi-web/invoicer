class ApiError extends Error {
	statusCode: number;
	details?: unknown;
	isOperational: boolean;

	constructor(statusCode: number, message: string, details?: unknown) {
		super(message);
		this.statusCode = statusCode;
		this.details = details;
		this.isOperational = true;
		Error.captureStackTrace(this, this.constructor);
	}

	static badRequest(message: string, details?: unknown) {
		return new ApiError(400, message, details);
	}

	static unauthorized(message = "Unauthorized") {
		return new ApiError(401, message);
	}

	static forbidden(message = "Forbidden") {
		return new ApiError(403, message);
	}

	static notFound(message = "Not found") {
		return new ApiError(404, message);
	}

	static conflict(message: string, details?: unknown) {
		return new ApiError(409, message, details);
	}

	static tooMany(message = "Too many requests") {
		return new ApiError(429, message);
	}

	static internal(message = "Internal server error") {
		return new ApiError(500, message);
	}

	static serviceUnavailable(message = "Service unavailable") {
		return new ApiError(503, message);
	}
}

module.exports = ApiError;
