import { RequestHandler, Router } from 'express';
import { register, login, getUserData, logout } from '../controllers/loginController';
import { link, shortId } from '../controllers/linkController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/userData', getUserData);
router.post('/logout', logout);

//link
router.post('/url', link);
router.get('/:uuid', shortId);

export default router;
