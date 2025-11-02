import { getClientDb } from './firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export async function addToWaitlist(email: string) {
  if (!email) throw new Error('Email is required');
  
  try {
    console.log('Attempting to add email to waitlist:', email);
    const db = getClientDb();
    if (!db) throw new Error('Firestore not available in this environment');
    
    const result = await addDoc(collection(db, 'waitlist'), {
      email,
      createdAt: serverTimestamp(),
    });
    
    console.log('Successfully added to waitlist with ID:', result.id);
    return result;
  } catch (error: any) {
    console.error('Error adding to waitlist:', error);
    console.error('Error code:', error?.code);
    console.error('Error message:', error?.message);
    throw error;
  }
} 