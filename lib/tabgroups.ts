import { db } from './firebase';
import { 
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
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
  createdAt: Date;
  userId: string;
  color?: string;
}

export async function createTabGroupFirestore(tabGroup: Omit<TabGroup, 'id' | 'userId'>, userId: string) {
  console.log("createTabGroupFirestore called with:", { tabGroup, userId });
  
  const tabGroupData = {
    ...tabGroup,
    userId,
    createdAt: tabGroup.createdAt ? Timestamp.fromDate(tabGroup.createdAt) : Timestamp.now(),
  };
  
  try {
    console.log("Adding document to Firestore:", tabGroupData);
    const docRef = await addDoc(collection(db, 'tabGroups'), tabGroupData);
    console.log("Document added with ID:", docRef.id);
    
    return {
      id: docRef.id,
      ...tabGroup,
      userId,
      createdAt: tabGroupData.createdAt.toDate(),
    } as TabGroup;
  } catch (error) {
    console.error("Error adding document to Firestore:", error);
    throw error;
  }
}

export async function updateTabGroupFirestore(tabGroupId: string, updates: Partial<TabGroup>) {
  const tabGroupRef = doc(db, 'tabGroups', tabGroupId);
  // Convert any Date objects to Firestore Timestamps
  const firestoreUpdates: any = { ...updates };
  if (updates.createdAt) {
    firestoreUpdates.createdAt = Timestamp.fromDate(updates.createdAt);
  }
  await updateDoc(tabGroupRef, firestoreUpdates);
}

export async function deleteTabGroupFirestore(tabGroupId: string) {
  const tabGroupRef = doc(db, 'tabGroups', tabGroupId);
  await deleteDoc(tabGroupRef);
}

export function subscribeToTabGroupsFirestore(userId: string, callback: (tabGroups: TabGroup[]) => void) {
  console.log("Subscribing to tab groups for user:", userId);
  
  // Simplify the query by removing the orderBy to avoid requiring a composite index
  const tabGroupsQuery = query(
    collection(db, 'tabGroups'),
    where('userId', '==', userId)
  );
  
  console.log("Query created:", tabGroupsQuery);
  
  return onSnapshot(tabGroupsQuery, (querySnapshot) => {
    console.log("Snapshot received, documents count:", querySnapshot.docs.length);
    
    if (querySnapshot.docs.length > 0) {
      console.log("First document ID:", querySnapshot.docs[0].id);
      console.log("First document data:", querySnapshot.docs[0].data());
    }
    
    const tabGroups = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      const tabGroup = {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
      } as TabGroup;
      console.log("Processed tab group:", tabGroup);
      return tabGroup;
    });
    
    // Sort the tab groups client-side instead of in the query
    tabGroups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    console.log("Parsed tab groups:", tabGroups);
    callback(tabGroups);
  }, (error) => {
    console.error("Error in tab groups subscription:", error);
  });
} 