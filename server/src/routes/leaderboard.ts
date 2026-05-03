import { Router, Request, Response } from "express";
import { Leaderboard } from "../models/Leaderboard.js";
import { Results } from "../models/Results.js";
import { Championship } from "../models/Championship.js";
import { authMiddleware, requireAdmin } from "../middleware/auth.js";

const router = Router();

// GET /api/leaderboard - Get full leaderboard standings
router.get("/", async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const leaderboard = await Leaderboard.getLeaderboard(limit);

    res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch leaderboard";
    console.error("Leaderboard error:", message);
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/leaderboard/me - Get user's leaderboard position (requires auth)
router.get("/me", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
    }

    const position = await Leaderboard.getUserPosition(req.user.userId);

    res.json({
      success: true,
      data: position,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch user position";
    console.error("User position error:", message);
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/leaderboard/results - Submit race results (admin only for now)
router.post("/results", authMiddleware, requireAdmin, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
    }

    const { raceWeekendId, type, p1, p2, p3, pole } = req.body;

    if (!raceWeekendId || !type || !p1 || !p2 || !p3 || !pole) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: raceWeekendId, type, p1, p2, p3, pole",
      });
    }

    if (!["sprint", "race"].includes(type)) {
      return res.status(400).json({
        success: false,
        error: "Type must be 'sprint' or 'race'",
      });
    }

    const result = await Results.create({
      raceWeekendId,
      type,
      p1,
      p2,
      p3,
      pole,
    });

    res.status(201).json({
      success: true,
      data: Results.formatResponse(result),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit race results";
    console.error("Race results error:", message);
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/leaderboard/results/:raceWeekendId - Get race results
router.get("/results/:raceWeekendId", async (req: Request, res: Response) => {
  try {
    const { raceWeekendId } = req.params;

    const results = await Results.findByRace(raceWeekendId);
    console.log(`[RESULTS API] Fetching for ${raceWeekendId}: Found ${results.length} results. Docs:`, JSON.stringify(results));

    res.json({
      success: true,
      data: results.map((r) => Results.formatResponse(r)),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch race results";
    console.error("Race results error:", message);
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/leaderboard/championship/drivers - Get F1 driver standings
router.get("/championship/drivers", async (req: Request, res: Response) => {
  try {
    const standings = await Championship.getDriverStandings();
    res.json({
      success: true,
      data: standings,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch driver standings";
    console.error("Driver standings error:", message);
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/leaderboard/championship/constructors - Get F1 constructor standings
router.get("/championship/constructors", async (req: Request, res: Response) => {
  try {
    const standings = await Championship.getConstructorStandings();
    res.json({
      success: true,
      data: standings,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch constructor standings";
    console.error("Constructor standings error:", message);
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
