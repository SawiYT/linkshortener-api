import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { Controller, db, links, } from '../utils/settings';

declare module 'express-session' {
	interface SessionData {
		user?: { id: number; username: string };
	}
}

export const register = async (req: Request, res: Response) => {
	const { username, password } = req.body;

	db.query('SELECT username FROM login WHERE username = ?', [username], async (err: any, results: any[]) => {
		if (err) {
			return res.status(500).json({
				success: false,
				message: 'Database error',
			});
		}
		if (results.length > 0) {
			return res.status(400).json({
				success: false,
				message: 'Username already exists',
			});
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		db.query('INSERT INTO login (username, password) VALUES (?, ?)', [username, hashedPassword], err => {
			if (err) {
				return res.status(500).json({ success: false, message: 'Database error' });
			}
			return res.status(201).json({ success: true, message: 'User registered' });
		});
	});
};

export const login = (req: Request, res: Response) => {
	const { username, password } = req.body;

	db.query('SELECT * FROM login WHERE username = ?', [username], async (err: any, results: any[]) => {
		if (err) {
			return res.status(500).json({ error: 'Database error' });
		}
		if (results.length === 0) {
			return res.status(400).json({
				success: false,
				message: 'Invalid username or password',
			});
		}

		const user = results[0];
		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) {
			return res.status(400).json({
				success: false,
				message: 'Invalid username or password',
			});
		}

		req.session.user = { id: user.id, username: user.username };

		return res.status(200).json({
			success: true,
			message: 'Logged in successfully',
		});
	});
};

export const getUserData: Controller = (req: Request, res: Response) => {
	const sessionUser = req.session.user;

	if (!sessionUser) {
		return res.status(401).json({
			success: false,
			message: 'Unauthorized',
		});
	}

	const userLinks = Array.from(links.values()).filter(
		(link) => link.creator === sessionUser.username
	  );


		return res.status(200).json({
			success: true,
			user: sessionUser,
			links: userLinks,
		});
};

export const logout = (req: Request, res: Response) => {
	req.session.destroy((err: any) => {
		if (err) {
			return res.status(500).json({
				success: false,
				message: 'Could not log out',
			});
		}
		res.status(200).json({
			success: true,
			message: 'Logged out successfully.',
		});
	});
};
