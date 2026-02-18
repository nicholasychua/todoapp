import { getClientDb } from './firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';

export interface DailyPlanItem {
  id: string;
  text: string;
  completed: boolean;
  order: number;
  dateKey: string; // YYYY-MM-DD
  userId: string;
  /** If this item was pulled from an existing task, store the task ID */
  linkedTaskId?: string;
  createdAt: Date;
}

function getTodayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export { getTodayKey };

export async function createDailyPlanItem(
  item: Omit<DailyPlanItem, 'id' | 'userId' | 'createdAt' | 'dateKey'>,
  userId: string
): Promise<DailyPlanItem> {
  const db = getClientDb();
  if (!db) throw new Error('Firestore not available');
  const dateKey = getTodayKey();
  const now = new Date();
  const docRef = await addDoc(collection(db, 'dailyPlan'), {
    ...item,
    userId,
    dateKey,
    createdAt: Timestamp.fromDate(now),
  });
  return {
    id: docRef.id,
    ...item,
    userId,
    dateKey,
    createdAt: now,
  };
}

export async function updateDailyPlanItem(
  itemId: string,
  updates: Partial<Pick<DailyPlanItem, 'text' | 'completed' | 'order'>>
) {
  const db = getClientDb();
  if (!db) throw new Error('Firestore not available');
  const ref = doc(db, 'dailyPlan', itemId);
  await updateDoc(ref, updates);
}

export async function deleteDailyPlanItem(itemId: string) {
  const db = getClientDb();
  if (!db) throw new Error('Firestore not available');
  const ref = doc(db, 'dailyPlan', itemId);
  await deleteDoc(ref);
}

export async function reorderDailyPlanItems(
  items: { id: string; order: number }[]
) {
  const db = getClientDb();
  if (!db) throw new Error('Firestore not available');
  const batch = writeBatch(db);
  items.forEach(({ id, order }) => {
    const ref = doc(db, 'dailyPlan', id);
    batch.update(ref, { order });
  });
  await batch.commit();
}

export function subscribeToDailyPlan(
  userId: string,
  callback: (items: DailyPlanItem[]) => void
) {
  const db = getClientDb();
  if (!db) throw new Error('Firestore not available');
  const dateKey = getTodayKey();
  const q = query(
    collection(db, 'dailyPlan'),
    where('userId', '==', userId),
    where('dateKey', '==', dateKey)
  );
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
      } as DailyPlanItem;
    });
    items.sort((a, b) => a.order - b.order);
    callback(items);
  });
}
