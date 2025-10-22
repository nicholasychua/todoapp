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
  Timestamp,
  DocumentData,
  onSnapshot
} from 'firebase/firestore';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  tags: string[];
  createdAt: Date;
  userId: string;
  group: "master" | "today";
}

export async function createTaskFirestore(task: Omit<Task, 'id' | 'userId'>, userId: string) {
  const taskData = {
    ...task,
    userId,
    createdAt: task.createdAt ? Timestamp.fromDate(task.createdAt) : Timestamp.now(),
  };
  const docRef = await addDoc(collection(db, 'tasks'), taskData);
  return {
    id: docRef.id,
    ...task,
    userId,
    createdAt: taskData.createdAt.toDate(),
  } as Task;
}

export async function updateTaskFirestore(taskId: string, updates: Partial<Task>) {
  const taskRef = doc(db, 'tasks', taskId);
  // Convert any Date objects to Firestore Timestamps
  const firestoreUpdates: any = { ...updates };
  if (updates.createdAt) {
    firestoreUpdates.createdAt = Timestamp.fromDate(updates.createdAt);
  }
  await updateDoc(taskRef, firestoreUpdates);
}

export async function deleteTaskFirestore(taskId: string) {
  const taskRef = doc(db, 'tasks', taskId);
  await deleteDoc(taskRef);
}

export function subscribeToTasksFirestore(userId: string, callback: (tasks: Task[]) => void) {
  const tasksQuery = query(
    collection(db, 'tasks'),
    where('userId', '==', userId)
  );
  return onSnapshot(tasksQuery, (querySnapshot) => {
    const tasks = querySnapshot.docs.map((doc) => {
      const data: any = doc.data();
      const createdAtValue = data?.createdAt;
      const createdAtDate: Date = createdAtValue?.toDate?.() ?? (createdAtValue instanceof Date ? createdAtValue : new Date());
      return {
        id: doc.id,
        ...data,
        createdAt: createdAtDate,
      } as Task;
    });
    // Sort in memory to avoid needing a composite index
    tasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    callback(tasks);
  });
}

export {} 