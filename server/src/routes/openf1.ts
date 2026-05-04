import { Router, Request, Response } from "express";
import {
  getCarData,
  getLaps,
  getPositions,
  getPit,
  getRaceControl,
  getSessionByType,
  getSessions,
  getStints,
  getTeamRadio,
  getWeather,
  getDrivers,
  getConstructors,
  isOpenF1RateLimitError,
} from "../services/openf1Service.js";

const router = Router();
let lastRateLimitLogAt = 0;

function ok(res: Response, data: unknown) {
  return res.json({ success: true, data: Array.isArray(data) ? data : data || null });
}

function fail(res: Response, error: unknown) {
  const message = error instanceof Error ? error.message : "OpenF1 request failed";
  if (isOpenF1RateLimitError(error)) {
    if (Date.now() - lastRateLimitLogAt > 60_000) {
      console.warn("OpenF1 routes paused: API rate limit reached.");
      lastRateLimitLogAt = Date.now();
    }
    return res.json({ success: true, data: [], warning: message });
  }

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

router.get("/race-control/:sessionKey", async (req: Request, res: Response) => {
  try {
    return ok(res, await getRaceControl(req.params.sessionKey));
  } catch (error) {
    return fail(res, error);
  }
});

router.get("/stints/:sessionKey", async (req: Request, res: Response) => {
  try {
    return ok(res, await getStints(req.params.sessionKey));
  } catch (error) {
    return fail(res, error);
  }
});

router.get("/pit/:sessionKey", async (req: Request, res: Response) => {
  try {
    return ok(res, await getPit(req.params.sessionKey));
  } catch (error) {
    return fail(res, error);
  }
});

router.get("/team-radio/:sessionKey", async (req: Request, res: Response) => {
  try {
    return ok(res, await getTeamRadio(req.params.sessionKey));
  } catch (error) {
    return fail(res, error);
  }
});

router.get("/weather/:sessionKey", async (req: Request, res: Response) => {
  try {
    return ok(res, await getWeather(req.params.sessionKey));
  } catch (error) {
    return fail(res, error);
  }
});

router.get("/drivers/:sessionKey", async (req: Request, res: Response) => {
  try {
    return ok(res, await getDrivers(req.params.sessionKey));
  } catch (error) {
    return fail(res, error);
  }
});

router.get("/constructors/:sessionKey", async (req: Request, res: Response) => {
  try {
    return ok(res, await getConstructors(req.params.sessionKey));
  } catch (error) {
    return fail(res, error);
  }
});

export default router;
