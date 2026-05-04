import { Router, Request, Response } from "express";
import { getF1RaceAnalysisFallback, getF1Standings } from "../services/formula1Service.js";

const router = Router();

router.get("/standings", async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await getF1Standings() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch Formula 1 standings";
    console.error("Formula 1 standings error:", message);
    res.status(502).json({ success: false, error: message });
  }
});

router.get("/races/:raceId/analysis", async (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await getF1RaceAnalysisFallback(req.params.raceId) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch Formula 1 race analysis";
    console.error("Formula 1 race analysis error:", message);
    res.status(502).json({ success: false, error: message });
  }
});

export default router;
