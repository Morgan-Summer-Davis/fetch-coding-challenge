import { Router } from 'express';
import Receipts from './receipts';

const router = Router();
router.use('/receipts', Receipts);

export default router;
