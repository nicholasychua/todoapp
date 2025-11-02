import { getClientDb } from './firebase';
import { 
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  Timestamp,
  DocumentData,
  onSnapshot
} from 'firebase/firestore';

export interface TabItem {
  url: string;
  title: string;
}

export interface TabGroup {
  id: string;
  name: string;
  tabs: TabItem[];
  userId: string;
  createdAt: Date;
}

export async function createTabGroupFirestore(
  tabGroup: Omit<TabGroup, 'id' | 'userId'>, 
  userId: string
) {
  const tabGroupData = {
    ...tabGroup,
    userId,
    createdAt: tabGroup.createdAt ? Timestamp.fromDate(tabGroup.createdAt) : Timestamp.now(),
  };
  const db = getClientDb();
  if (!db) throw new Error('Firestore not available in this environment');
  const docRef = await addDoc(collection(db, 'tabGroups'), tabGroupData);
  return {
    id: docRef.id,
    ...tabGroup,
    userId,
    createdAt: tabGroupData.createdAt.toDate(),
  } as TabGroup;
}

export async function updateTabGroupFirestore(tabGroupId: string, updates: Partial<TabGroup>) {
  const db = getClientDb();
  if (!db) throw new Error('Firestore not available in this environment');
  const tabGroupRef = doc(db, 'tabGroups', tabGroupId);
  // Convert any Date objects to Firestore Timestamps
  const firestoreUpdates: any = { ...updates };
  if (updates.createdAt) {
    firestoreUpdates.createdAt = Timestamp.fromDate(updates.createdAt);
  }
  await updateDoc(tabGroupRef, firestoreUpdates);
}

export async function deleteTabGroupFirestore(tabGroupId: string) {
  const db = getClientDb();
  if (!db) throw new Error('Firestore not available in this environment');
  const tabGroupRef = doc(db, 'tabGroups', tabGroupId);
  await deleteDoc(tabGroupRef);
}

export function subscribeToTabGroupsFirestore(
  userId: string, 
  callback: (tabGroups: TabGroup[]) => void
) {
  const db = getClientDb();
  if (!db) throw new Error('Firestore not available in this environment');
  const tabGroupsQuery = query(
    collection(db, 'tabGroups'),
    where('userId', '==', userId)
  );
  return onSnapshot(tabGroupsQuery, (querySnapshot) => {
    const tabGroups = querySnapshot.docs.map((doc) => {
      const data: any = doc.data();
      const createdAtValue = data?.createdAt;
      const createdAtDate: Date = createdAtValue?.toDate?.() ?? (createdAtValue instanceof Date ? createdAtValue : new Date());
      return {
        id: doc.id,
        ...data,
        createdAt: createdAtDate,
      } as TabGroup;
    });
    // Sort in memory to avoid needing a composite index
    tabGroups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    callback(tabGroups);
  });
}

export {}

