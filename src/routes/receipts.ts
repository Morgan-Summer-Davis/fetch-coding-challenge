import express = require("express");
import { Request, Response } from "express";

const router = express.Router();

router.post("/process", (req: Request, res: Response) => {
  return res.json({ id: crypto.randomUUID() })
});

router.get("/:id/points", (req: Request, res: Response) => {
  const id: string = req.params.id;

  return res.json({ id });
});

export default router;
