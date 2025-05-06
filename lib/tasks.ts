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
}

export async function createTaskFirestore(task: Omit<Task, 'id' | 'createdAt' | 'userId'>, userId: string) {
  const taskData = {
    ...task,
    userId,
    createdAt: Timestamp.now(),
  };
  const docRef = await addDoc(collection(db, 'tasks'), taskData);
  return {
    id: docRef.id,
    ...taskData,
    createdAt: taskData.createdAt.toDate(),
  } as Task;
}

export async function updateTaskFirestore(taskId: string, updates: Partial<Task>) {
  const taskRef = doc(db, 'tasks', taskId);
  await updateDoc(taskRef, updates);
}

export async function deleteTaskFirestore(taskId: string) {
  const taskRef = doc(db, 'tasks', taskId);
  await deleteDoc(taskRef);
}

export function subscribeToTasksFirestore(userId: string, callback: (tasks: Task[]) => void) {
  const tasksQuery = query(
    collection(db, 'tasks'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(tasksQuery, (querySnapshot) => {
    const tasks = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    })) as Task[];
    callback(tasks);
  });
} 