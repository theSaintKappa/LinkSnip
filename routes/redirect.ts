import express from 'express';
const router = express.Router();
import { snipRepository } from '../redis.js';

router.get('/:id', async (req, res) => {
    try {
        const linkSnip = await snipRepository.search().where('snipId').equals(req.params.id).return.first();

        if (!linkSnip) return res.status(301).redirect(`https://app.snip.gay/notfound`);

        res.setHeader('Cache-Control', 'public, max-age=86400');

        if (typeof req.query.json !== 'undefined' && req.query.json !== 'false') return res.status(200).send(linkSnip);

        //@ts-ignore
        res.status(301).redirect(linkSnip.redirectUrl);
    } catch (err) {
        console.error(err);
        return res.status(400).json({ code: 400, message: 'Bad request' });
    }
});

router.get('/', async (req, res) => res.status(301).redirect('https://app.snip.gay'));

export default router;
