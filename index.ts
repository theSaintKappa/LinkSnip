import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

import { snipRepository } from './redis.js';
await snipRepository.createIndex();

import snipNew from './routes/new.js';
import snipRedirect from './routes/redirect.js';

app.use('/', snipRedirect);
app.use('/api/new', snipNew);

app.listen(process.env.PORT || 5000, () => console.log('Server is running'));
