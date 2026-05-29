# TheNetFace Security Specification

## Data Invariants
1. A **User** profile must belong to the authenticated user. Email and displayName are required.
2. A **Post** must have a valid authorId matching the creator's UID.
3. A **Comment** must belong to a Post and have a valid authorId.
4. A **Like** is unique per user per post (idempotency ensured by using userId as doc ID in `posts/{postId}/likes/{userId}`).
5. **Nested Replies** are comments with a `parentId` field referencing another comment.

## The "Dirty Dozen" Payloads (Red Team Test Cases)
1. **Identity Spoofing**: Attempt to create a post with `authorId` = "someone_else".
2. **Resource Poisoning**: Use a 2KB string as a `commentId`.
3. **Ghost Update**: Attempt to update a post's `likesCount` directly (should be handled via transactions/batch but rules must block direct client increment if possible, or validate).
4. **Relationship Orphan**: Create a comment for a `postId` that doesn't exist.
5. **PII Leak**: Read another user's email if it's in a private field (our User model is public but we should isolate).
6. **Self-Promotion**: Upvoting your own post (if restricted - usually not, but maybe double-liking).
7. **Bypass Verification**: Posting with an unverified email (if `email_verified` is required).
8. **Shadow Field**: Adding `isAdmin: true` to a User profile.
9. **Terminal Lockout**: Modifying a `createdAt` timestamp after creation.
10. **Query Scrape**: Listing all users without a filter (if restricted).
11. **Spam Creation**: Creating 100 posts in a single second (Rate limiting handled at infra, but rules check timestamps).
12. **Nested Depth Abuse**: Creating a reply to a reply to a reply... (Depth validation).

## Test Runner Logic (Conceptual)
The `firestore.rules.test.ts` will verify these via the Emulator/Rules Unit Testing.
