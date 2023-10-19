import { Router } from 'express';
import TokenController from '../controllers/TokenController';

const router = new Router();

/* CREATE */
router.post('/login', TokenController.store);

export default router;
