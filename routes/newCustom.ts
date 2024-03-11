import express from "express";
import { snipRepository } from "../snipSchema.js";
const router = express.Router();

router.post("/", async (req, res) => {
	try {
		if (!req.body.url || !req.body.key)
			return res
				.status(400)
				.json({ code: 400, message: "Invalid request body" });

		if (
			!/[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(
				req.body.url,
			) ||
			/(?:https?:\/\/)?link\.saintkappa\.dev\/?.*/.test(req.body.url)
		)
			return res.status(400).json({ code: 400, message: "Invalid URL" });

		if (!/[a-zA-Z]/.test(req.body.key))
			return res
				.status(400)
				.json({
					code: 400,
					message: "Key must be a string of letters /[a-zA-Z]/",
				});

		if (req.body.key.length < 3)
			return res
				.status(400)
				.json({ code: 400, message: "Key must be at least 3 characters long" });
		if (req.body.key.length > 16)
			return res
				.status(400)
				.json({ code: 400, message: "Key must be at most 16 characters long" });

		const keyExists = await snipRepository
			.search()
			.where("snipId")
			.equals(req.body.key)
			.return.count();
		if (keyExists)
			return res
				.status(200)
				.json({ code: 400, message: "Snip with this key already exists" });

		const url = !/^https?:\/\//i.test(req.body.url)
			? `https://${req.body.url}`
			: req.body.url;

		const newSnip = await snipRepository.save({
			snipId: req.body.key,
			snipUrl: `${process.env.APP_URL}/${req.body.key}`,
			redirectUrl: url,
			createdAt: new Date(),
		});
		res.status(200).send({ ...newSnip });
	} catch (err) {
		console.error(err);
		return res.status(400).json({ code: 400, message: "Bad request" });
	}
});

export default router;
