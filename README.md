# 📌 TheNetFace — Social Networking Platform

## 🧭 Product Description

**TheNetFace** is a modern, hybrid social networking platform that merges the **real-time feed dynamics of Twitter/X** with the **visual-first engagement model of Instagram-style photo sharing**.

It is designed as a **real-time, mobile-first social graph application** featuring:

* Photo-centric posts with captions
* Real-time feed updates
* Nested comment threading (multi-level discussion trees)
* Direct messaging system (1:1 conversations)
* User profiles with editable identity layers
* Lightweight, high-performance UI optimized for modern browsers

The system is built on a **serverless-first architecture using Firebase**, with a React-based frontend and real-time Firestore synchronization.

---

# 🧱 System Architecture

## ⚙️ Recommended Tech Stack

### Frontend

* **React 18+ / Vite**
* Tailwind CSS (utility-first styling)
* Framer Motion (UI animations)
* Zustand or Redux Toolkit (state management)

### Backend (optional evolution path)

* Node.js + Express (API gateway layer if scaling beyond Firebase)
* OR Python + FastAPI (if ML/moderation systems are added)

### Database / Backend-as-a-Service

* **Firebase**

  * Firestore (real-time document DB)
  * Firebase Auth (authentication layer)
  * Firebase Storage (media assets)

Alternative scalable option:

* PostgreSQL (via Supabase) for relational expansion

---

## 🧩 High-Level Architecture

```
Client (React SPA)
      |
      |  Firebase SDK (Realtime listeners)
      v
Firestore (Posts / Users / Messages)
      |
Firebase Auth (Identity layer)
      |
Firebase Storage (Images / Media)
```

Key properties:

* Event-driven UI via `onSnapshot`
* No traditional REST dependency for core feed
* Optimistic UI updates for interactions (likes/comments)

---

# 🗄️ Database Schema Design

## 👤 Users Collection

```json
users/{userId}
{
  uid: string,
  username: string,
  displayName: string,
  bio: string,
  photoURL: string,
  createdAt: timestamp,
  followers: number,
  following: number
}
```

---

## 📝 Posts Collection

```json
posts/{postId}
{
  postId: string,
  userId: string,
  imageUrl: string,
  caption: string,
  likesCount: number,
  commentsCount: number,
  createdAt: timestamp
}
```

---

## 💬 Comments Collection (Nested Threading)

```json
posts/{postId}/comments/{commentId}
{
  commentId: string,
  userId: string,
  text: string,
  parentCommentId: string | null,
  createdAt: timestamp
}
```

### Threading Strategy

* `parentCommentId = null` → root comment
* `parentCommentId != null` → reply node
* Recursive UI rendering required on frontend

---

## 📩 Conversations (Direct Messaging)

```json
conversations/{conversationId}
{
  participants: [userId1, userId2],
  lastMessage: string,
  updatedAt: timestamp
}
```

### Messages Subcollection

```json
conversations/{conversationId}/messages/{messageId}
{
  senderId: string,
  text: string,
  createdAt: timestamp
}
```

---

# 🔐 Authentication System

Implemented using **Firebase Authentication**

## Supported Flows

* Google OAuth Sign-In
* Anonymous-safe UI gating (unauthenticated feed preview optional)

## Flow Logic

1. User clicks "Sign In"
2. Firebase Auth popup triggered
3. On success:

   * Create/update user document in Firestore
   * Sync profile state to frontend store

Key dependency:

* Firebase Authentication

---

# 📸 Media Handling Strategy

## Storage Pipeline

1. User selects image (upload or URL paste)
2. Image uploaded to:

   * Firebase Storage
3. Storage returns public URL
4. URL saved in `posts.imageUrl`

## Optimization Considerations

* Client-side compression (optional: `browser-image-compression`)
* CDN-backed delivery via Firebase Storage
* Lazy loading in feed (`loading="lazy"`)

---

# 🧠 Core Feature Implementation

## 📰 Feed System

### Behavior

* Real-time post stream
* Sorted by `createdAt desc`
* Auto-refresh via Firestore listener

### Key Logic

* Subscription via `onSnapshot(posts)`
* Local optimistic UI updates for likes/comments

---

## ❤️ Like System

* Each post maintains `likesCount`
* Optional enhancement: `likes/{userId}` subcollection for idempotency
* Prevent duplicate likes per user

---

## 💬 Comment System

* Threaded recursive rendering
* Parent-child relationship via `parentCommentId`
* Depth-first UI rendering strategy

---

## 🔁 Reply System

* Replies are just comments with `parentCommentId`
* UI indentation based on depth level

---

# ⚛️ Frontend Implementation (Core Components)

## 📦 Feed Component

```tsx
import { useEffect, useState } from "react";
import { onSnapshot, collection, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";
import Post from "./Post";

export default function Feed() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto p-4 space-y-4">
      {posts.map(post => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}
```

---

## 🧾 Post Component

```tsx
import { useState } from "react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../firebase/config";
import CommentSection from "./CommentSection";

export default function Post({ post }) {
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    await updateDoc(doc(db, "posts", post.id), {
      likesCount: increment(1)
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 space-y-3">
      
      <img
        src={post.imageUrl}
        className="rounded-xl w-full object-cover"
      />

      <p className="text-gray-800">{post.caption}</p>

      <div className="flex gap-4 text-sm">
        <button onClick={handleLike}>❤️ Like</button>
        <button onClick={() => setShowComments(!showComments)}>
          💬 Comment
        </button>
      </div>

      {showComments && (
        <CommentSection postId={post.id} />
      )}
    </div>
  );
}
```

---

## 💬 Comment Section (Concept)

* Recursive rendering
* Input box for replies
* Firestore subcollection writes

---

# 🎨 UI / UX Guidelines

## Design System

* Mobile-first layout
* Soft shadows + rounded corners
* High whitespace density control
* Minimal borders
* Focus on readability of media

## Tailwind Principles

* Utility-first styling
* No custom CSS unless structural
* Responsive breakpoints:

  * `sm:` mobile
  * `md:` tablet
  * `lg:` desktop

---

# 🚀 Deployment Strategy

## Recommended Hosting

* Frontend: Vercel or Firebase Hosting
* Backend: Firebase (primary) or Node microservices
* Media: Firebase Storage CDN

---

# 📈 Scalability Roadmap

## Phase 1 (Current)

* Firebase monolith
* Client-driven real-time UI

## Phase 2

* Node.js API gateway for moderation + analytics
* Feed ranking algorithm

## Phase 3

* AI moderation layer (spam/toxicity filtering)
* Recommendation engine

---

# 🧾 Summary

**TheNetFace** is a real-time, media-rich social network built on a serverless architecture with:

* Firebase real-time synchronization
* React-based modular frontend
* Scalable schema for social graph expansion
* Threaded communication systems (comments + messaging)


<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/12ff3b69-a18a-41d0-9bec-6fd847919958

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
