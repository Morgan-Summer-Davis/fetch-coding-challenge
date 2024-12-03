import express = require('express');
import { Request, Response } from 'express';
import db from '../db/db';

const router = express.Router();

router.post('/process', (req: Request, res: Response) => {
  try {
    const id = db.process(req.body);
    return res.json({ id })
  } catch(e) {
    let message = e instanceof Error ? e.message : e;
    res.status(400);
    return res.json({ error: message });
  }
});

router.get('/:id/points', (req: Request, res: Response) => {
  const id: string = req.params.id;

  try {
    return res.json({ points: db.getPoints(id) });
  } catch(e) {
    let message = e instanceof Error ? e.message : e;
    res.status(404);
    return res.json({ error: message });
  }
});

export default router;
