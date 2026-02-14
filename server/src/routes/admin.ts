import { Router, Request, Response } from "express";
import { getDB } from "../utils/db";

const router = Router();

/**
 * DELETE /api/admin/cleanup-test-data
 * Remove test users and their related data
 * This is a utility endpoint for development/cleanup
 */
router.delete("/cleanup-test-data", async (req: Request, res: Response) => {
  try {
    const db = getDB();

    // Test user patterns to identify
    const testPatterns = [
      "alice",
      "bob",
      "charlie",
      "example.com",
      "test",
      "user",
      "john doe",
    ];

    // Find users that match test patterns
    const usersCollection = db.collection("users");
    const testUsers = await usersCollection
      .find({
        $or: [
          { name: { $regex: testPatterns.join("|"), $options: "i" } },
          { email: { $regex: testPatterns.join("|"), $options: "i" } },
        ],
      })
      .toArray();

    console.log(`Found ${testUsers.length} test users to remove`);

    if (testUsers.length === 0) {
      return res.json({
        success: true,
        message: "No test users found",
        deletedUsers: 0,
        deletedPredictions: 0,
      });
    }

    // Get user IDs
    const testUserIds = testUsers.map((u) => u._id.toString());

    // Delete predictions for test users
    const predictionsCollection = db.collection("predictions");
    const predictionsDelete = await predictionsCollection.deleteMany({
      userId: { $in: testUserIds },
    });

    // Delete test users
    const usersDelete = await usersCollection.deleteMany({
      _id: { $in: testUsers.map((u) => u._id) },
    });

    console.log(`Deleted ${usersDelete.deletedCount} test users`);
    console.log(`Deleted ${predictionsDelete.deletedCount} related predictions`);

    res.json({
      success: true,
      message: "Test data cleaned up successfully",
      deletedUsers: usersDelete.deletedCount,
      deletedPredictions: predictionsDelete.deletedCount,
      usernames: testUsers.map((u) => ({ name: u.name, email: u.email })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cleanup failed";
    console.error("Cleanup error:", message);
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
