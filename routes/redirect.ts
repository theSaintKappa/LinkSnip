import express from 'express';
const router = express.Router();
import { snipRepository } from '../redis.js';

router.get('/:id', async (req, res) => {
    try {
        const linkSnip = await snipRepository.search().where('snipId').equals(req.params.id).return.first();

        if (!linkSnip) return res.status(404).send('Not Found');

        if (typeof req.query.raw !== 'undefined' && req.query.raw !== 'false') return res.status(200).send(linkSnip.toJSON());

        res.status(301).redirect(linkSnip.toJSON().redirectUrl);
    } catch (err) {
        console.error(err);
        return res.status(400).send('Bad Request');
    }
});

router.get('/', async (req, res) => {
    try {
        res.status(301).redirect('https://app.snip.gay');
    } catch (err) {
        console.error(err);
        return res.status(400).send('Bad Request');
    }
});

export default router;
