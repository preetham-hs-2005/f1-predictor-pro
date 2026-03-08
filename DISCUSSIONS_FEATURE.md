# Discussion Feature Implementation

## Overview
A complete discussion system has been added to the F1 Predictor Pro website with the following features:

### Features Implemented

1. **Discussion Threads**
   - Create discussions in multiple categories (General, Technical, Race-Specific, Predictions, Off-Topic)
   - View, update, and delete discussions
   - Track views and message counts
   - Pin discussions (admin only)

2. **Messaging System**
   - Send messages/comments in discussions
   - Edit and delete messages
   - Like messages with vote counts
   - Real-time message updates via WebSocket

3. **Polling System**
   - Create single-choice and multiple-choice polls within discussions
   - Vote on polls
   - View real-time vote counts and percentages
   - Close polls (creator or admin only)
   - Prevent duplicate voting

4. **Real-Time Features**
   - WebSocket support for live updates
   - User join/leave notifications
   - Live message broadcasting
   - Live poll updates

5. **Moderation**
   - Admins can delete discussions, messages, and polls
   - Users can only delete their own content
   - Discussion creators can edit their posts

## Files Created

### Backend Models
- `server/src/models/Discussion.ts` - Discussion document model with CRUD operations
- `server/src/models/Message.ts` - Message document model
- `server/src/models/Poll.ts` - Poll document model
- `server/src/models/PollVote.ts` - Poll vote tracking model

### Backend Routes
- `server/src/routes/discussions.ts` - RESTful API endpoints for discussions, messages, and polls

### Backend Updates
- `server/src/server.ts` - Updated with WebSocket server and integration
- `server/package.json` - Added `ws` dependency for WebSocket support

### Frontend Components
- `src/components/discussions/DiscussionForm.tsx` - Form to create new discussions
- `src/components/discussions/DiscussionsList.tsx` - List of all discussions with filtering
- `src/components/discussions/DiscussionItem.tsx` - Individual discussion card display
- `src/components/discussions/DiscussionThread.tsx` - Full discussion view with messages and polls
- `src/components/discussions/MessageForm.tsx` - Form to post new messages
- `src/components/discussions/MessageItem.tsx` - Individual message display with actions
- `src/components/discussions/PollComponent.tsx` - Poll display and voting interface

### Frontend Pages & Hooks
- `src/pages/Discussions.tsx` - Main discussions page
- `src/hooks/useDiscussions.ts` - Custom React hooks for API interactions

### Frontend Updates
- `src/App.tsx` - Added route for discussions page
- `src/components/layout/Navbar.tsx` - Added navigation link to discussions
- `src/hooks/index.ts` - Exported new hooks

## API Endpoints

### Discussions
- `GET /api/discussions` - Get all discussions (with category and pagination)
- `GET /api/discussions/:id` - Get single discussion with messages and polls
- `POST /api/discussions` - Create new discussion
- `PATCH /api/discussions/:id` - Update discussion
- `DELETE /api/discussions/:id` - Delete discussion

### Messages
- `POST /api/discussions/:id/messages` - Create message
- `GET /api/discussions/:id/messages` - Get discussion messages
- `PATCH /api/discussions/:id/messages/:messageId` - Update message
- `DELETE /api/discussions/:id/messages/:messageId` - Delete message
- `POST /api/discussions/:id/messages/:messageId/like` - Like message

### Polls
- `POST /api/discussions/:id/polls` - Create poll
- `GET /api/discussions/:id/polls` - Get discussion polls
- `POST /api/discussions/:id/polls/:pollId/vote` - Vote on poll
- `PATCH /api/discussions/:id/polls/:pollId/close` - Close poll
- `DELETE /api/discussions/:id/polls/:pollId` - Delete poll

## Database Collections

The following MongoDB collections are used:
- `discussions` - Discussion threads
- `messages` - Discussion messages
- `polls` - Polls
- `pollVotes` - Poll vote tracking

## WebSocket Events

The server supports the following WebSocket message types:

### Client → Server
- `join` - User joins a discussion room
- `message` - New message posted
- `poll-vote` - Poll vote cast

### Server → Client
- `user-joined` - User entered the discussion
- `user-left` - User left the discussion
- `new-message` - New message received
- `poll-updated` - Poll vote counts updated

## Installation & Setup

1. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```
   This will install the `ws` package for WebSocket support.

2. **Update Frontend Hooks Index** (Already done)
   The hooks are properly exported in `src/hooks/index.ts`

3. **Update App Routes** (Already done)
   The discussions route is added to the router

4. **Update Navigation** (Already done)
   The Navbar includes the Discussions link

## Usage

### For Users
1. Navigate to the "Discussions" tab in the navbar
2. Browse discussions by category or search
3. Click on a discussion to view details
4. Add messages to the discussion thread
5. Create polls within discussions
6. Vote on polls (single or multiple choice)

### For Admins
- All user capabilities plus:
- Pin/unpin discussions
- Delete any discussion, message, or poll
- Close polls

## Technical Details

- **Backend**: Express.js with MongoDB
- **Frontend**: React with TypeScript
- **Real-time**: WebSocket (ws package)
- **UI**: shadcn/ui components
- **Authentication**: JWT token-based (existing auth system)
- **Authorization**: Role-based (admin/user)

## Next Steps (Optional Enhancements)

1. Add discussion notifications
2. Implement user mentions (@username)
3. Add rich text editor for messages
4. Add file attachment support
5. Implement discussion subscriptions
6. Add moderation dashboard
7. Add user activity feeds
8. Implement email notifications for replies
