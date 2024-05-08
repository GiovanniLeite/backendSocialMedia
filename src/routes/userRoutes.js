import express from 'express';

import UserController from '../controllers/UserController';
import loginRequired from '../middleware/loginRequired';

const router = express.Router();

/* CREATE */
router.post('/register', UserController.store);

/* READ */
router.get('/:id', loginRequired, UserController.show);
router.get('/:id/friends', loginRequired, UserController.listUserFriends);

/* UPDATE */
router.patch('/update', loginRequired, UserController.update); // update atributes
router.patch(
  '/update-friend/:friendId',
  loginRequired,
  UserController.toggleFriend,
); // toggle friends

export default router;
