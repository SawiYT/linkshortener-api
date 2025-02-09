import { Request, Response } from 'express';
import { Controller, db, links } from '../utils/settings';
import { v4 as uuidv4 } from 'uuid';
import { PORT } from '..';

class Link {
	creator: string;
	uuid: string;
	url: string;

	constructor(creator: string, uuid: string, url: string) {
		this.creator = creator;
		this.uuid = uuid;
		this.url = url;
	}
}

export function loadLinksFromDatabase() {
	db.query('SELECT * FROM links', (err, results: any) => {
		if (err) {
			console.error('Error loading links from database:', err);
			return;
		}
		results.forEach((row: any) => {
			const { creator, uuid, url } = row;
			const link = new Link(creator, uuid, url);
			links.set(uuid, link);
		});
		console.log('Links loaded into memory.');
	});
}

async function insertLinkToDatabase(link: Link) {
	db.query('INSERT INTO links (creator, uuid, url) VALUES (?, ?, ?)', [link.creator, link.uuid, link.url], err => {
		if (err) {
			console.error('Error inserting link into database:', err);
		}
	});
}

export const link: Controller = (req: Request, res: Response) => {
	const sessionUser = req.session.user;
	const { url } = req.body;

	let username = 'guest';

	const existingLink = Array.from(links.values()).find(link => link.url === url);

	if (existingLink) {
		console.log(links);
		return res.status(200).json({
			success: true,
			uuid: `http://localhost:${PORT}/` + existingLink.uuid,
			url: existingLink.url,
		});
	}

	if (sessionUser) {
		username = sessionUser.username;
	}

	const newLink = createLink(username, url);

	res.status(201).json({
		success: true,
		uuid: `http://localhost:${PORT}/` + newLink.uuid,
		url: newLink.url,
	});
};

const createLink = (username: string, url: string) => {
	const uuid = uuidv4().slice(0, 6);
	const newLink = new Link(username, uuid, url);

	links.set(uuid, newLink);

	insertLinkToDatabase(newLink);

	return {
		uuid: uuid,
		url: newLink.url,
	};
};


export const shortId: Controller = (req: Request, res: Response) => {
	const { uuid } = req.params;
	const link = links.get(uuid);

	if (!link) {
		return res.status(404).json({ success: false, message: 'Link not found' });
	}

	res.redirect(link.url);
};

module.exports = { link, shortId, loadLinksFromDatabase };
