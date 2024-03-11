import crypto from "crypto";
import express from "express";
import { snipRepository } from "../snipSchema.js";
const router = express.Router();

const CHARACTERS: string = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

const randomKey = (length: number) => {
    const randomBytes = crypto.randomBytes(length);

    return Array.from(randomBytes, (byte) => CHARACTERS[byte % CHARACTERS.length]).join("");
};

router.post("/", async (req, res) => {
    try {
        if (!req.body.url) return res.status(400).json({ code: 400, message: "Invalid request body" });

        if (!/[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(req.body.url) || /(?:https?:\/\/)?link\.saintkappa\.dev\/?.*/.test(req.body.url)) return res.status(400).json({ code: 400, message: "Invalid URL" });

        const url: string = !/^https?:\/\//i.test(req.body.url) ? `https://${req.body.url}` : req.body.url;

        const snipExists = await snipRepository.search().where("redirectUrl").equals(url).return.first();
        if (snipExists) return res.status(200).json({ ...snipExists, alreadyExisted: true });

        const snipId = randomKey(3);
        const newSnip = await snipRepository.save({ snipId, snipUrl: `${process.env.APP_URL}/${snipId}`, redirectUrl: url, createdAt: new Date() });
        res.status(200).send({ ...newSnip, alreadyExisted: false });
    } catch (err) {
        console.error(err);
        return res.status(400).json({ code: 400, message: "Bad request" });
    }
});

export default router;
