import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy, 
  onSnapshot,
  increment,
  setDoc,
  serverTimestamp,
  getDocFromServer,
  where,
  getDoc
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError, auth } from './config';

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  email: string;
  bio?: string;
  createdAt: any;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  imageURL: string;
  caption: string;
  likesCount: number;
  commentsCount: number;
  createdAt: any;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  content: string;
  parentId?: string;
  createdAt: any;
}

// Ensure connection
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

// User Profiles
export async function ensureUserProfile(user: any) {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    const profile: UserProfile = {
      uid: user.uid,
      displayName: user.displayName || 'Anonymous',
      photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
      email: user.email,
      createdAt: serverTimestamp(),
    };
    try {
      await setDoc(userRef, profile);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}`);
    }
  }
}

// Posts
export function subscribeToPosts(callback: (posts: Post[]) => void) {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
    callback(posts);
  }, (error) => handleFirestoreError(error, OperationType.LIST, 'posts'));
}

export async function createPost(caption: string, imageURL: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("Must be logged in");

  const postData = {
    authorId: user.uid,
    authorName: user.displayName,
    authorPhoto: user.photoURL,
    imageURL,
    caption,
    likesCount: 0,
    commentsCount: 0,
    createdAt: serverTimestamp(),
  };

  try {
    await addDoc(collection(db, 'posts'), postData);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'posts');
  }
}

// Likes
export async function toggleLike(postId: string, isLiked: boolean) {
  const user = auth.currentUser;
  if (!user) throw new Error("Must be logged in");

  const likeRef = doc(db, 'posts', postId, 'likes', user.uid);
  const postRef = doc(db, 'posts', postId);

  try {
    if (isLiked) {
      await deleteDoc(likeRef);
      await updateDoc(postRef, { likesCount: increment(-1) });
    } else {
      await setDoc(likeRef, {
        userId: user.uid,
        postId,
        createdAt: serverTimestamp(),
      });
      await updateDoc(postRef, { likesCount: increment(1) });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `posts/${postId}/likes/${user.uid}`);
  }
}

export function subscribeToLikeStatus(postId: string, callback: (liked: boolean) => void) {
  const user = auth.currentUser;
  if (!user) {
    callback(false);
    return () => {};
  }

  const likeRef = doc(db, 'posts', postId, 'likes', user.uid);
  return onSnapshot(likeRef, (doc) => {
    callback(doc.exists());
  }, (error) => handleFirestoreError(error, OperationType.GET, `posts/${postId}/likes/${user.uid}`));
}

// Comments
export function subscribeToComments(postId: string, callback: (comments: Comment[]) => void) {
  const q = query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
    callback(comments);
  }, (error) => handleFirestoreError(error, OperationType.LIST, `posts/${postId}/comments`));
}

export async function addComment(postId: string, content: string, parentId?: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("Must be logged in");

  const commentData = {
    postId,
    authorId: user.uid,
    authorName: user.displayName,
    authorPhoto: user.photoURL,
    content,
    parentId: parentId || null,
    createdAt: serverTimestamp(),
  };

  try {
    await addDoc(collection(db, 'posts', postId, 'comments'), commentData);
    await updateDoc(doc(db, 'posts', postId), { commentsCount: increment(1) });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `posts/${postId}/comments`);
  }
}

// User Profiles Extra
export async function getUserProfile(uid: string) {
  try {
    const docSnap = await getDoc(doc(db, 'users', uid));
    if (docSnap.exists()) return { uid: docSnap.id, ...docSnap.data() } as UserProfile;
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    return null;
  }
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  try {
    await updateDoc(doc(db, 'users', uid), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
  }
}

export function subscribeToUserPosts(uid: string, callback: (posts: Post[]) => void) {
  const q = query(collection(db, 'posts'), where('authorId', '==', uid), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
    callback(posts);
  }, (error) => handleFirestoreError(error, OperationType.LIST, 'posts'));
}

export function subscribeToAllUsers(callback: (users: UserProfile[]) => void) {
  return onSnapshot(collection(db, 'users'), (snapshot) => {
    const users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
    callback(users);
  }, (error) => handleFirestoreError(error, OperationType.LIST, 'users'));
}

// Messaging
export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: string;
  updatedAt: any;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: any;
}

export async function getOrCreateConversation(otherUid: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("Must be logged in");

  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', user.uid)
  );

  const snap = await getDocs(q);
  const existing = snap.docs.find(d => (d.data().participants as string[]).includes(otherUid));

  if (existing) return existing.id;

  const docRef = await addDoc(collection(db, 'conversations'), {
    participants: [user.uid, otherUid],
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export function subscribeToConversations(callback: (conversations: Conversation[]) => void) {
  const user = auth.currentUser;
  if (!user) return () => {};

  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', user.uid),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation)));
  }, (error) => handleFirestoreError(error, OperationType.LIST, 'conversations'));
}

export function subscribeToMessages(conversationId: string, callback: (messages: Message[]) => void) {
  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
  }, (error) => handleFirestoreError(error, OperationType.LIST, `conversations/${conversationId}/messages`));
}

export async function sendMessage(conversationId: string, text: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("Must be logged in");

  const msgData = {
    senderId: user.uid,
    text,
    createdAt: serverTimestamp(),
  };

  try {
    await addDoc(collection(db, 'conversations', conversationId, 'messages'), msgData);
    await updateDoc(doc(db, 'conversations', conversationId), {
      lastMessage: text,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `conversations/${conversationId}/messages`);
  }
}
