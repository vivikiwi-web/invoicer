const { query } = require("../config/db");

async function record({
	userId,
	feature,
	model,
	success,
	fallbackUsed = false,
	inputTokens = null,
	outputTokens = null,
}) {
	try {
		await query(
			`INSERT INTO ai_usage_events
				(user_id, feature, model, success, fallback_used, input_tokens, output_tokens)
			VALUES ($1,$2,$3,$4,$5,$6,$7)`,
			[userId, feature, model, success, fallbackUsed, inputTokens, outputTokens],
		);
	} catch (err) {
		console.error("Failed to record AI usage", err);
	}
}

module.exports = { record };
