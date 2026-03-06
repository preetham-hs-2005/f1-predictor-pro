import { Router, Request, Response } from "express";
import { Prediction } from "../models/Prediction.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// POST /api/predictions/submit
router.post("/submit", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const {
      raceWeekendId,
      type = "race",
      predictedP1,
      predictedP2,
      predictedP3,
      predictedPole,
      unexpectedStatement,
    } = req.body;

    if (!raceWeekendId || !predictedP1 || !predictedP2 || !predictedP3 || !predictedPole) {
      return res.status(400).json({
        success: false,
        error: "Missing required prediction fields",
      });
    }

    // Check if prediction already exists
    const existing = await Prediction.findByUserAndRace(
      req.user.userId,
      raceWeekendId,
      type
    );

    let prediction;
    if (existing) {
      // Update existing prediction
      prediction = await Prediction.update(existing._id!, {
        predictedP1,
        predictedP2,
        predictedP3,
        predictedPole,
        unexpectedStatement: unexpectedStatement || "",
      });
    } else {
      // Create new prediction
      prediction = await Prediction.create({
        userId: req.user.userId,
        raceWeekendId,
        type,
        predictedP1,
        predictedP2,
        predictedP3,
        predictedPole,
        unexpectedStatement: unexpectedStatement || "",
      });
    }

    if (!prediction) {
      return res.status(500).json({
        success: false,
        error: "Failed to save prediction",
      });
    }

    res.status(201).json({
      success: true,
      data: Prediction.formatResponse(prediction),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit prediction";
    console.error("Prediction submit error:", message);
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/predictions/user
router.get("/user", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const predictions = await Prediction.findByUser(req.user.userId);

    res.json({
      success: true,
      data: predictions.map(p => Prediction.formatResponse(p)),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch predictions";
    console.error("Fetch predictions error:", message);
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/predictions/:raceWeekendId
router.get("/:raceWeekendId", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const { raceWeekendId } = req.params;
    const type = (req.query.type as "sprint" | "race") || "race";

    const prediction = await Prediction.findByUserAndRace(
      req.user.userId,
      raceWeekendId,
      type
    );

    if (!prediction) {
      return res.status(404).json({
        success: false,
        error: "Prediction not found",
      });
    }

    res.json({
      success: true,
      data: Prediction.formatResponse(prediction),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch prediction";
    console.error("Fetch prediction error:", message);
    res.status(500).json({ success: false, error: message });
  }
});

// PUT /api/predictions/:raceWeekendId
router.put("/:raceWeekendId", authMiddleware, async (req: Request, res: Response) => {
  try {
    console.log("PUT /api/predictions/:raceWeekendId called");
    
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const { raceWeekendId } = req.params;
    const type = (req.query.type as "sprint" | "race") || "race";
    const {
      predictedP1,
      predictedP2,
      predictedP3,
      predictedPole,
      unexpectedStatement,
    } = req.body;

    console.log("Update request:", { raceWeekendId, type, predictedP1, predictedPole, unexpectedStatement });

    const existing = await Prediction.findByUserAndRace(
      req.user.userId,
      raceWeekendId,
      type
    );

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Prediction not found",
      });
    }

    const updatesObj = {
      ...(predictedP1 !== undefined && { predictedP1 }),
      ...(predictedP2 !== undefined && { predictedP2 }),
      ...(predictedP3 !== undefined && { predictedP3 }),
      ...(predictedPole !== undefined && { predictedPole }),
      ...(unexpectedStatement !== undefined && { unexpectedStatement }),
    };

    console.log("Updates object:", updatesObj);

    const prediction = await Prediction.update(existing._id!, updatesObj);

    if (!prediction) {
      return res.status(500).json({
        success: false,
        error: "Failed to update prediction",
      });
    }

    res.json({
      success: true,
      data: Prediction.formatResponse(prediction),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update prediction";
    console.error("Update prediction error:", message);
    res.status(500).json({ success: false, error: message });
  }
});

// DELETE /api/predictions/:raceWeekendId
router.delete("/:raceWeekendId", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const { raceWeekendId } = req.params;
    const type = (req.query.type as "sprint" | "race") || "race";

    const deleted = await Prediction.delete(
      req.user.userId,
      raceWeekendId,
      type
    );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Prediction not found",
      });
    }

    res.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete prediction";
    console.error("Delete prediction error:", message);
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
