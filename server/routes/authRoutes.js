// routes/authRoutes.js
import express from 'express';
import { authController } from '../controllers/authController.js';
import { db } from '../config/db.js';

const router = express.Router();
const controller = authController(db);

router.post('/api/signup', controller.signup);
router.post('/api/login', controller.login);

export default router;
