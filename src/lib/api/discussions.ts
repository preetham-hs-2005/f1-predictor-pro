/**
 * Discussions API - Handles all discussion-related API calls
 */

import { apiClient } from "./client";

export interface Discussion {
  _id: string;
  title: string;
  content: string;
  userId: string;
  userName: string;
  category: "general" | "technical" | "race-specific" | "predictions" | "off-topic";
  raceWeekendId?: string;
  isPinned: boolean;
  views: number;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  discussionId: string;
  userId: string;
  userName: string;
  content: string;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export interface Poll {
  _id: string;
  discussionId: string;
  userId: string;
  userName: string;
  question: string;
  description?: string;
  type: "single" | "multiple";
  options: string[];
  allowMultiple: boolean;
  totalVotes: number;
  closed: boolean;
  voteCounts?: number[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all discussions or by category
 */
export async function getDiscussions(
  category: string = "",
  page: number = 1,
  limit: number = 20
): Promise<Discussion[]> {
  const params = new URLSearchParams();
  if (category && category !== "all") {
    params.append("category", category);
  }
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  const response = await apiClient.get<{ discussions: Discussion[] }>(
    `/api/discussions?${params}`
  );
  return response.discussions;
}

/**
 * Get single discussion with messages and polls
 */
export async function getDiscussion(id: string): Promise<{
  discussion: Discussion;
  messages: Message[];
  polls: Poll[];
}> {
  return apiClient.get(`/api/discussions/${id}`);
}

/**
 * Create a new discussion
 */
export async function createDiscussion(data: {
  title: string;
  content: string;
  category: string;
  raceWeekendId?: string;
}): Promise<Discussion> {
  const response = await apiClient.post<{ discussion: Discussion }>(
    "/api/discussions",
    data
  );
  return response.discussion;
}

/**
 * Update discussion
 */
export async function updateDiscussion(
  id: string,
  data: { title?: string; content?: string; isPinned?: boolean }
): Promise<Discussion> {
  const response = await apiClient.patch<{ discussion: Discussion }>(
    `/api/discussions/${id}`,
    data
  );
  return response.discussion;
}

/**
 * Delete discussion
 */
export async function deleteDiscussion(id: string): Promise<boolean> {
  const response = await apiClient.delete<{ deleted: boolean }>(
    `/api/discussions/${id}`
  );
  return response.deleted;
}

/**
 * Create a message in a discussion
 */
export async function createMessage(
  discussionId: string,
  content: string
): Promise<Message> {
  const response = await apiClient.post<{ message: Message }>(
    `/api/discussions/${discussionId}/messages`,
    { content }
  );
  return response.message;
}

/**
 * Get messages for a discussion
 */
export async function getMessages(
  discussionId: string,
  page: number = 1,
  limit: number = 50
): Promise<Message[]> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  const response = await apiClient.get<{ messages: Message[] }>(
    `/api/discussions/${discussionId}/messages?${params}`
  );
  return response.messages;
}

/**
 * Update a message
 */
export async function updateMessage(
  discussionId: string,
  messageId: string,
  content: string
): Promise<Message> {
  const response = await apiClient.patch<{ message: Message }>(
    `/api/discussions/${discussionId}/messages/${messageId}`,
    { content }
  );
  return response.message;
}

/**
 * Delete a message
 */
export async function deleteMessage(
  discussionId: string,
  messageId: string
): Promise<boolean> {
  const response = await apiClient.delete<{ deleted: boolean }>(
    `/api/discussions/${discussionId}/messages/${messageId}`
  );
  return response.deleted;
}

/**
 * Like a message
 */
export async function likeMessage(
  discussionId: string,
  messageId: string
): Promise<Message> {
  const response = await apiClient.post<{ message: Message }>(
    `/api/discussions/${discussionId}/messages/${messageId}/like`,
    {}
  );
  return response.message;
}

/**
 * Create a poll in a discussion
 */
export async function createPoll(
  discussionId: string,
  data: {
    question: string;
    description?: string;
    type: "single" | "multiple";
    options: string[];
  }
): Promise<Poll> {
  const response = await apiClient.post<{ poll: Poll }>(
    `/api/discussions/${discussionId}/polls`,
    data
  );
  return response.poll;
}

/**
 * Get polls for a discussion
 */
export async function getPolls(discussionId: string): Promise<Poll[]> {
  const response = await apiClient.get<{ polls: Poll[] }>(
    `/api/discussions/${discussionId}/polls`
  );
  return response.polls;
}

/**
 * Vote on a poll
 */
export async function votePoll(
  discussionId: string,
  pollId: string,
  selectedOptions: number[]
): Promise<{ voteCounts: number[] }> {
  return apiClient.post(`/api/discussions/${discussionId}/polls/${pollId}/vote`, {
    selectedOptions,
  });
}

/**
 * Close a poll
 */
export async function closePoll(
  discussionId: string,
  pollId: string
): Promise<Poll> {
  const response = await apiClient.patch<{ poll: Poll }>(
    `/api/discussions/${discussionId}/polls/${pollId}/close`,
    {}
  );
  return response.poll;
}

/**
 * Delete a poll
 */
export async function deletePoll(
  discussionId: string,
  pollId: string
): Promise<boolean> {
  const response = await apiClient.delete<{ deleted: boolean }>(
    `/api/discussions/${discussionId}/polls/${pollId}`
  );
  return response.deleted;
}
