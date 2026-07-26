import express, { Request, Response } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { Discussion } from "../models/Discussion.js";
import { Message } from "../models/Message.js";
import { Poll } from "../models/Poll.js";
import { PollVote } from "../models/PollVote.js";
import { User } from "../models/User.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// ==================== DISCUSSIONS ====================

// Get all discussions or by category
router.get("/", async (req: Request, res: Response) => {
  try {
    const { category = "", page = "1", limit = "20" } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * limitNum;

    let discussions;
    if (category && category !== "all") {
      discussions = await Discussion.findByCategory(category as string, limitNum, skip);
    } else {
      discussions = await Discussion.findAll(limitNum, skip);
    }

    res.json({ success: true, discussions });
  } catch (error) {
    console.error("Error fetching discussions:", error);
    res.status(500).json({ success: false, error: "Failed to fetch discussions" });
  }
});

// Get single discussion with messages
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = "1", limit = "50" } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 50));
    const skip = (pageNum - 1) * limitNum;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid discussion ID" });
    }

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return res.status(404).json({ success: false, error: "Discussion not found" });
    }

    // Increment views if requested
    if (req.query.incrementView === "true") {
      await Discussion.incrementViews(id);
    }

    // Get messages
    const messages = await Message.findByDiscussion(id, limitNum, skip);

    // Get polls
    const polls = await Poll.findByDiscussion(id);

    // Get vote counts for each poll
    const pollsWithVotes = await Promise.all(
      polls.map(async (poll) => {
        const votes = await PollVote.getVoteCounts(poll._id!.toString(), poll.options.length);
        return { ...poll, voteCounts: votes };
      })
    );

    res.json({ success: true, discussion, messages, polls: pollsWithVotes });
  } catch (error) {
    console.error("Error fetching discussion:", error);
    res.status(500).json({ success: false, error: "Failed to fetch discussion" });
  }
});

// Create discussion
router.post("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { title, content, category, raceWeekendId } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: title, content, category",
      });
    }

    const validCategories = ["general", "technical", "race-specific", "predictions", "off-topic"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ success: false, error: "Invalid category" });
    }

    const discussion = await Discussion.create({
      title,
      content,
      category,
      raceWeekendId,
      userId: req.user!.userId,
      userName: req.user!.name,
      isPinned: false,
    });

    res.status(201).json({ success: true, discussion });
  } catch (error) {
    console.error("Error creating discussion:", error);
    res.status(500).json({ success: false, error: "Failed to create discussion" });
  }
});

// Update discussion
router.patch("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, isPinned } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid discussion ID" });
    }

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return res.status(404).json({ success: false, error: "Discussion not found" });
    }

    // Check authorization
    const isAdmin = req.user!.role === "admin";
    if (discussion.userId !== req.user!.userId && !isAdmin) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    const updates: any = {};
    if (title) updates.title = title;
    if (content) updates.content = content;
    if (isAdmin && isPinned !== undefined) updates.isPinned = isPinned;

    const updated = await Discussion.update(id, updates);
    res.json({ success: true, discussion: updated });
  } catch (error) {
    console.error("Error updating discussion:", error);
    res.status(500).json({ success: false, error: "Failed to update discussion" });
  }
});

// Delete discussion (admin or creator only)
router.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid discussion ID" });
    }

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return res.status(404).json({ success: false, error: "Discussion not found" });
    }

    // Check authorization
    const isAdmin = req.user!.role === "admin";
    if (discussion.userId !== req.user!.userId && !isAdmin) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    // Delete associated messages and polls
    await Message.deleteByDiscussion(id);
    await Poll.deleteByDiscussion(id);

    const deleted = await Discussion.delete(id);
    res.json({ success: true, deleted });
  } catch (error) {
    console.error("Error deleting discussion:", error);
    res.status(500).json({ success: false, error: "Failed to delete discussion" });
  }
});

// ==================== MESSAGES ====================

// Create message
router.post("/:id/messages", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, error: "Message content is required" });
    }

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid discussion ID" });
    }

    // Verify discussion exists
    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return res.status(404).json({ success: false, error: "Discussion not found" });
    }

    const message = await Message.create({
      discussionId: id,
      userId: req.user!.userId,
      userName: req.user!.name,
      content,
    });

    // Increment message count
    await Discussion.incrementMessageCount(id);

    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ success: false, error: "Failed to create message" });
  }
});

// Get messages for a discussion
router.get("/:id/messages", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = "1", limit = "50" } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit as string) || 50));
    const skip = (pageNum - 1) * limitNum;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid discussion ID" });
    }

    const messages = await Message.findByDiscussion(id, limitNum, skip);
    res.json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ success: false, error: "Failed to fetch messages" });
  }
});

// Update message
router.patch("/:id/messages/:messageId", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, error: "Content is required" });
    }

    if (!ObjectId.isValid(messageId)) {
      return res.status(400).json({ success: false, error: "Invalid message ID" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, error: "Message not found" });
    }

    // Check authorization
    const isAdmin = req.user!.role === "admin";
    if (message.userId !== req.user!.userId && !isAdmin) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    const updated = await Message.update(messageId, content);
    res.json({ success: true, message: updated });
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({ success: false, error: "Failed to update message" });
  }
});

// Delete message
router.delete("/:id/messages/:messageId", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;

    if (!ObjectId.isValid(messageId)) {
      return res.status(400).json({ success: false, error: "Invalid message ID" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, error: "Message not found" });
    }

    // Check authorization
    const isAdmin = req.user!.role === "admin";
    if (message.userId !== req.user!.userId && !isAdmin) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    const deleted = await Message.delete(messageId);
    if (deleted) {
      await Discussion.decrementMessageCount(message.discussionId);
    }
    res.json({ success: true, deleted });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ success: false, error: "Failed to delete message" });
  }
});

// Like message
router.post("/:id/messages/:messageId/like", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;

    if (!ObjectId.isValid(messageId)) {
      return res.status(400).json({ success: false, error: "Invalid message ID" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, error: "Message not found" });
    }

    const updated = await Message.toggleLike(messageId, req.user!.userId);

    res.json({ success: true, message: updated });
  } catch (error) {
    console.error("Error liking message:", error);
    res.status(500).json({ success: false, error: "Failed to like message" });
  }
});

// ==================== POLLS ====================

// Create poll in discussion
router.post("/:id/polls", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { question, description, type, options } = req.body;

    if (!question || !type || !options || options.length < 2) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: question, type, and at least 2 options",
      });
    }

    if (!["single", "multiple"].includes(type)) {
      return res.status(400).json({ success: false, error: "Invalid poll type" });
    }

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid discussion ID" });
    }

    // Verify discussion exists
    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return res.status(404).json({ success: false, error: "Discussion not found" });
    }

    const poll = await Poll.create({
      discussionId: id,
      userId: req.user!.userId,
      userName: req.user!.name,
      question,
      description,
      type,
      options,
      allowMultiple: type === "multiple",
      closed: false,
    });

    res.status(201).json({ success: true, poll });
  } catch (error) {
    console.error("Error creating poll:", error);
    res.status(500).json({ success: false, error: "Failed to create poll" });
  }
});

// Get polls for discussion
router.get("/:id/polls", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid discussion ID" });
    }

    const polls = await Poll.findByDiscussion(id);

    // Get vote counts for each poll
    const pollsWithVotes = await Promise.all(
      polls.map(async (poll) => {
        const votes = await PollVote.getVoteCounts(poll._id!.toString(), poll.options.length);
        return { ...poll, voteCounts: votes };
      })
    );

    res.json({ success: true, polls: pollsWithVotes });
  } catch (error) {
    console.error("Error fetching polls:", error);
    res.status(500).json({ success: false, error: "Failed to fetch polls" });
  }
});

// Vote on poll
router.post("/:id/polls/:pollId/vote", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id, pollId } = req.params;
    const { selectedOptions } = req.body;

    if (!Array.isArray(selectedOptions) || selectedOptions.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Selected options must be an array with at least one option",
      });
    }

    if (!ObjectId.isValid(pollId)) {
      return res.status(400).json({ success: false, error: "Invalid poll ID" });
    }

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ success: false, error: "Poll not found" });
    }

    if (poll.closed) {
      return res.status(400).json({ success: false, error: "Poll is closed" });
    }

    // Check if user already voted
    const existingVote = await PollVote.findByPollAndUser(pollId, req.user!.userId);
    if (existingVote) {
      return res.status(400).json({ success: false, error: "You have already voted on this poll" });
    }

    // Validate selected options
    if (selectedOptions.some((opt: any) => opt < 0 || opt >= poll.options.length)) {
      return res.status(400).json({ success: false, error: "Invalid option index" });
    }

    // For single choice, only one option allowed
    if (poll.type === "single" && selectedOptions.length > 1) {
      return res.status(400).json({
        success: false,
        error: "Single choice polls can only have one selected option",
      });
    }

    const vote = await PollVote.create({
      pollId,
      userId: req.user!.userId,
      selectedOptions,
    });

    // Increment poll vote count
    await Poll.incrementVotes(pollId);

    const votes = await PollVote.getVoteCounts(pollId, poll.options.length);

    res.status(201).json({ success: true, vote, voteCounts: votes });
  } catch (error) {
    console.error("Error voting on poll:", error);
    res.status(500).json({ success: false, error: "Failed to vote on poll" });
  }
});

// Close poll (admin or creator only)
router.patch("/:id/polls/:pollId/close", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { pollId } = req.params;

    if (!ObjectId.isValid(pollId)) {
      return res.status(400).json({ success: false, error: "Invalid poll ID" });
    }

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ success: false, error: "Poll not found" });
    }

    // Check authorization
    const isAdmin = req.user!.role === "admin";
    if (poll.userId !== req.user!.userId && !isAdmin) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    await Poll.closePoll(pollId);
    const updated = await Poll.findById(pollId);

    res.json({ success: true, poll: updated });
  } catch (error) {
    console.error("Error closing poll:", error);
    res.status(500).json({ success: false, error: "Failed to close poll" });
  }
});

// Delete poll (admin or creator only)
router.delete("/:id/polls/:pollId", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { pollId } = req.params;

    if (!ObjectId.isValid(pollId)) {
      return res.status(400).json({ success: false, error: "Invalid poll ID" });
    }

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ success: false, error: "Poll not found" });
    }

    // Check authorization
    const isAdmin = req.user!.role === "admin";
    if (poll.userId !== req.user!.userId && !isAdmin) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    // Delete votes associated with this poll
    await PollVote.deleteByPoll(pollId);
    const deleted = await Poll.delete(pollId);

    res.json({ success: true, deleted });
  } catch (error) {
    console.error("Error deleting poll:", error);
    res.status(500).json({ success: false, error: "Failed to delete poll" });
  }
});

export default router;
