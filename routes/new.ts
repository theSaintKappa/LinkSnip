import express from 'express';
const router = express.Router();
import { snipRepository } from '../redis.js';

const randomKey = (n) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    for (let i = 0; i < n; i++) {
        key += chars[Math.floor(Math.random() * chars.length)];
    }
    return key;
};

router.post('/', async (req, res) => {
    try {
        if (!/[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(req.body.url) || /(?:https?:\/\/)?snip\.gay\/?.*/.test(req.body.url)) return res.status(400).json({ code: 400, message: 'Invalid URL' });
        const url = !/^https?:\/\//i.test(req.body.url) ? `https://${req.body.url}` : req.body.url;
        const snipId: string = randomKey(3);

        const snipExists = await snipRepository.search().where('redirectUrl').equals(url).return.first();
        if (snipExists) return res.status(200).json({ ...snipExists.toJSON(), alreadyExisted: true });

        const newSnip = await snipRepository.createAndSave({ snipId, snipUrl: `https://snip.gay/${snipId}`, redirectUrl: url, createdAt: new Date() });
        res.status(200).send({ ...newSnip.toJSON(), alreadyExisted: false });
    } catch (err) {
        console.error(err);
        return res.status(400).send('Bad Request');
    }
});

export default router;
