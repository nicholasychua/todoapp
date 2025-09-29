import { db } from './firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';

export interface Category {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  hiddenOnHome?: boolean;
  description?: string;
  keywords?: string[];
}

export function subscribeToCategories(userId: string, callback: (categories: Category[]) => void) {
  const categoriesQuery = query(
    collection(db, 'categories'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(categoriesQuery, (querySnapshot) => {
    const categories = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      hiddenOnHome: doc.data().hiddenOnHome ?? false,
      description: doc.data().description,
      keywords: doc.data().keywords || [],
    })) as Category[];
    callback(categories);
  });
}

export async function addCategory(
  name: string, 
  userId: string,
  description?: string,
  keywords?: string[]
) {
  const now = new Date();
  const docRef = await addDoc(collection(db, 'categories'), {
    name,
    userId,
    createdAt: Timestamp.fromDate(now),
    hiddenOnHome: false,
    description: description || '',
    keywords: keywords || [],
  });
  return {
    id: docRef.id,
    name,
    userId,
    createdAt: now,
    hiddenOnHome: false,
    description: description || '',
    keywords: keywords || [],
  } as Category;
}

export async function deleteCategory(categoryId: string) {
  await deleteDoc(doc(db, 'categories', categoryId));
}

export async function renameCategory(categoryId: string, newName: string) {
  await updateDoc(doc(db, 'categories', categoryId), { name: newName });
}

export async function setCategoryHiddenOnHome(categoryId: string, hidden: boolean) {
  await updateDoc(doc(db, 'categories', categoryId), { hiddenOnHome: hidden });
}

export async function updateCategory(
  categoryId: string, 
  updates: { name?: string; description?: string; keywords?: string[] }
) {
  await updateDoc(doc(db, 'categories', categoryId), updates);
} 