import { db } from './firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export async function addToWaitlist(email: string) {
  if (!email) throw new Error('Email is required');
  return await addDoc(collection(db, 'waitlist'), {
    email,
    createdAt: serverTimestamp(),
  });
} 