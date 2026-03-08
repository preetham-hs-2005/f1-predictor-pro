import express from "express";
import { Driver } from "../models/Driver.js";
import { authMiddleware, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public: Get all drivers
router.get("/", async (req, res) => {
  try {
    const activeOnly = req.query.all !== "true";
    const drivers = await Driver.getAll(activeOnly);
    
    res.json({
      success: true,
      data: drivers.map(d => Driver.formatResponse(d))
    });
  } catch (error) {
    console.error("Error fetching drivers:", error);
    res.status(500).json({ success: false, message: "Failed to fetch drivers" });
  }
});

// Admin: Create driver
router.post("/", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const driver = await Driver.create(req.body);
    res.status(201).json({
      success: true,
      data: Driver.formatResponse(driver)
    });
  } catch (error) {
    console.error("Error creating driver:", error);
    res.status(400).json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to create driver" 
    });
  }
});

// Admin: Update driver
router.patch("/:id", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const driver = await Driver.update(req.params.id, req.body);
    
    if (!driver) {
      return res.status(404).json({ success: false, message: "Driver not found" });
    }
    
    res.json({
      success: true,
      data: Driver.formatResponse(driver)
    });
  } catch (error) {
    console.error("Error updating driver:", error);
    res.status(400).json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to update driver" 
    });
  }
});

// Admin: Delete driver
router.delete("/:id", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const deleted = await Driver.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Driver not found" });
    }
    
    res.json({
      success: true,
      message: "Driver deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting driver:", error);
    res.status(500).json({ success: false, message: "Failed to delete driver" });
  }
});

export default router;
