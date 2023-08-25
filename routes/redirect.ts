import express from 'express';
import path from 'path';
import { snipRepository } from '../snipSchema.js';
const router = express.Router();

router.get('/:id', async (req, res) => {
    try {
        const linkSnip = await snipRepository.search().where('snipId').equals(req.params.id).return.first();

        if (!linkSnip) return res.status(200).sendFile(path.resolve() + '/public/dist/notFound/index.html');

        res.setHeader('Cache-Control', 'public, max-age=86400');

        if (typeof req.query.json !== 'undefined' && req.query.json !== 'false') return res.status(200).send(linkSnip);

        res.status(301).redirect(linkSnip.redirectUrl.toString());
    } catch (err) {
        console.error(err);
        return res.status(400).json({ code: 400, message: 'Bad request' });
    }
});

router.get('/', async (req, res) => res.status(200).sendFile('index.html'));

export default router;
