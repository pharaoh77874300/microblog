# MicroBlog - Twitter Feature Completion

## Current State
The app already has:
- Posts, replies, reposts, quote posts
- Likes, follow/unfollow, block/mute
- Profiles with avatar and header image
- Notifications (likes, replies, follows, reposts)
- Search (posts and users)
- Trending hashtags
- Home feed (following) and Global feed
- Hashtag pages

## Requested Changes (Diff)

### Add
- **Bookmarks**: Users can bookmark any post. Dedicated /bookmarks page shows all bookmarked posts in reverse chronological order. Bookmark action available from post context menu.
- **Direct Messages (DMs)**: Users can send private messages to other users. /messages page with conversation list. Clicking a conversation opens the message thread. Users can start a new conversation from any profile page.

### Modify
- AppSidebar: Add Bookmarks and Messages nav items
- PostCard: Add bookmark action (alongside like/repost)
- ProfilePage: Add "Message" button

### Remove
- Nothing

## Implementation Plan
1. Add bookmark functions to backend: bookmarkPost, unbookmarkPost, getBookmarks, isBookmarked field in PostResponse
2. Add DM functions to backend: sendMessage, getConversations, getMessages, markConversationRead, getUnreadMessageCount
3. Frontend: BookmarksPage component
4. Frontend: MessagesPage and ConversationView components
5. Frontend: Wire bookmark toggle into PostCard
6. Frontend: Wire "Message" button into ProfilePage
7. Frontend: Add nav items to AppSidebar
8. Frontend: Add routes for /bookmarks and /messages and /messages/:principal
