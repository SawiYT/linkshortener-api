import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api';
import session from 'express-session';
import { loadBase } from './utils/settings';
import { loadLinksFromDatabase } from './controllers/linkController';
dotenv.config();

const app = express();
export const PORT = process.env.PORT || 3000;

loadBase();
loadLinksFromDatabase();

app.use(express.json());
app.use(
	cors({
		origin: ['http://localhost:5173', 'http://localhost:5173', 'http://localhost:62377'],
		credentials: true,
	})
);

console.log('Link Shortener Api v1.0.0');
console.log('© Copyright 2025 SawiYT.');

app.use(
	session({
		secret: process.env.SESSION_SECRET || 'supersecretkey',
		resave: false,
		saveUninitialized: false,
		cookie: {
			maxAge: 1000 * 60 * 60 * 24,
			httpOnly: true,
		},
	})
);

app.use('/', apiRouter);

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
