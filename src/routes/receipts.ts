import express = require("express");
import { Request, Response } from "express";
import db from "../db/db";

const router = express.Router();

router.post("/process", (req: Request, res: Response) => {
  try {
    const id = db.process(req.body);
    return res.json({ id })
  } catch(e) {
    res.status(400);
    return res.json({ error: e.message });
  }
});

router.get("/:id/points", (req: Request, res: Response) => {
  const id: string = req.params.id;

  try {
    return res.json({ points: db.points(id) });
  } catch(e) {
    res.status(400);
    return { error: e.message };
  }
});

export default router;
