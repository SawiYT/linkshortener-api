import { Request, Response } from 'express';
import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

export interface Controller {
	(req: Request, res: Response): void | Promise<void> | Response<any, Record<string, any>> | any;
}

export class Link {
	creator: string;
	uuid: string;
	url: string;

	constructor(creator: string, uuid: string, url: string) {
		this.creator = creator;
		this.uuid = uuid;
		this.url = url;
	}
}

export const links = new Map<any, Link>(); 

export const db = mysql.createConnection({
	host: process.env.host,
	user: process.env.user,
	password: '',
	database: process.env.database,
});

// settings.ts lub plik, w którym wywołujesz funkcję
export const loadBase = () => {
	db.query(`
	  CREATE TABLE IF NOT EXISTS login (
		id INT AUTO_INCREMENT PRIMARY KEY,
		username VARCHAR(255) NOT NULL UNIQUE,
		password VARCHAR(255) NOT NULL
	  )
	`);

	db.query(`
	  CREATE TABLE IF NOT EXISTS links (
		id INT AUTO_INCREMENT PRIMARY KEY,
		creator VARCHAR(100) NOT NULL,
		uuid VARCHAR(100) NOT NULL,
    	url VARCHAR(250) NOT NULL
	  )
	`);
};
