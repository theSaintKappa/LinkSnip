import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

// import { snipRepository } from './redis.js';
// await snipRepository.createIndex();

import snipRedirect from './routes/redirect.js';
import snipNew from './routes/new.js';
import snipNewCustom from './routes/newCustom.js';

app.use('/', snipRedirect);
app.use('/api/new', snipNew);
app.use('/api/newCustom', snipNewCustom);

app.listen(process.env.PORT || 5000, () => console.log('Server is running'));
