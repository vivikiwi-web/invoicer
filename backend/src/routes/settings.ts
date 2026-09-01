const express = require("express");
const { z } = require("zod");

const asyncHandler = require("../utils/asyncHandler");
const { requireAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const Settings = require("../models/Settings");

const router = express.Router();
router.use(requireAuth);

const settingsSchema = z.object({
	company_name: z.string().trim().max(120).optional(),
	logo_url: z
		.string()
		.trim()
		.max(80_000)
		.refine((v) => v === "" || v.startsWith("data:image/"), {
			message: "Logo must be an image data URL",
		})
		.optional(),
	address: z.string().trim().max(400).optional(),
	email: z.string().trim().max(160).optional(),
	phone: z.string().trim().max(40).optional(),
	currency: z.string().trim().max(8).optional(),
	tax_rate: z.coerce.number().min(0).max(100).optional(),
	invoice_prefix: z.string().trim().max(12).optional(),
	accent_color: z.string().trim().max(32).optional(),
});

type SettingsInput = import("zod").infer<typeof settingsSchema>;

router.get(
	"/",
	asyncHandler(async (req, res) => {
		const settings = await Settings.ensure(req.user.id);
		res.json({ settings });
	}),
);

router.patch(
	"/",
	validate(settingsSchema),
	asyncHandler(async (req, res) => {
		const settings = await Settings.update(req.user.id, req.body as SettingsInput);
		res.json({ settings });
	}),
);

module.exports = router;
