const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { z } = require("zod");
const { validate } = require("./validate");

function reqWithQueryGetter(query: Record<string, string>) {
	const proto = {};
	Object.defineProperty(proto, "query", {
		configurable: true,
		enumerable: true,
		get() {
			return query;
		},
	});
	return Object.create(proto);
}

function run(mw, req) {
	return new Promise<void>((resolve, reject) => {
		mw(req, {}, (err?: unknown) => (err ? reject(err) : resolve()));
	});
}

describe("validate", () => {
	it("replaces Express 5 getter-only req.query with parsed data", async () => {
		const mw = validate(
			z.object({ status: z.enum(["all", "draft"]).optional() }),
			"query",
		);
		const req = reqWithQueryGetter({ status: "all" });
		await run(mw, req);
		assert.deepEqual(req.query, { status: "all" });
	});

	it("still assigns parsed body", async () => {
		const mw = validate(z.object({ name: z.string() }));
		const req = { body: { name: "Ada" } };
		await run(mw, req);
		assert.equal(req.body.name, "Ada");
	});
});
