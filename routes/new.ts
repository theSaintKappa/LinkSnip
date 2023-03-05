import express from 'express';
const router = express.Router();
import crypto from 'crypto';
import { snipRepository } from '../redis.js';

const CHARACTERS: string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

const randomKey = (length: number) => {
    const randomBytes = crypto.randomBytes(length);

    return Array.from(randomBytes, (byte) => CHARACTERS[byte % CHARACTERS.length]).join('');
};

router.post('/', async (req, res) => {
    try {
        if (!/[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(req.body.url) || /(?:https?:\/\/)?snip\.gay\/?.*/.test(req.body.url)) return res.status(400).json({ code: 400, message: 'Invalid URL' });
        const url = !/^https?:\/\//i.test(req.body.url) ? `https://${req.body.url}` : req.body.url;
        const snipId = randomKey(3);

        const snipExists = await snipRepository.search().where('redirectUrl').equals(url).return.first();
        if (snipExists) return res.status(200).json({ ...snipExists.toJSON(), alreadyExisted: true });

        const newSnip = await snipRepository.createAndSave({ snipId, snipUrl: `${process.env.APP_URL}/${snipId}`, redirectUrl: url, createdAt: new Date() });
        res.status(200).send({ ...newSnip.toJSON(), alreadyExisted: false });
    } catch (err) {
        console.error(err);
        return res.status(400).send('Bad Request');
    }
});

export default router;
