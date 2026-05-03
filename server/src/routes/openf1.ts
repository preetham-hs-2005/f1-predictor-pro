import { Router, Request, Response } from "express";
import {
  getCarData,
  getLaps,
  getPositions,
  getSessionByType,
  getSessions,
} from "../services/openf1Service.js";

const router = Router();

function ok(res: Response, data: unknown) {
  return res.json({ success: true, data: Array.isArray(data) ? data : data || null });
}

function fail(res: Response, error: unknown) {
  const message = error instanceof Error ? error.message : "OpenF1 request failed";
  console.error("OpenF1 route error:", message);
  return res.status(502).json({ success: false, error: message });
}

router.get("/sessions", async (req: Request, res: Response) => {
  try {
    const year = req.query.year ? Number(req.query.year) : undefined;
    const country = typeof req.query.country === "string" ? req.query.country : undefined;
    const type = typeof req.query.type === "string" ? req.query.type : undefined;
    const sessions = await getSessions(year, country);

    if (type) {
      return ok(res, getSessionByType(sessions, type));
    }

    return ok(res, sessions);
  } catch (error) {
    return fail(res, error);
  }
});

router.get("/positions/:sessionKey", async (req: Request, res: Response) => {
  try {
    return ok(res, await getPositions(req.params.sessionKey));
  } catch (error) {
    return fail(res, error);
  }
});

router.get("/laps/:sessionKey", async (req: Request, res: Response) => {
  try {
    return ok(res, await getLaps(req.params.sessionKey));
  } catch (error) {
    return fail(res, error);
  }
});

router.get("/car-data/:sessionKey/:driverNumber", async (req: Request, res: Response) => {
  try {
    return ok(res, await getCarData(req.params.sessionKey, req.params.driverNumber));
  } catch (error) {
    return fail(res, error);
  }
});

export default router;

