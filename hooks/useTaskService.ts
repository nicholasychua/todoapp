import { useAuth } from '@/lib/auth-context';
import {
  createTaskFirestore,
  updateTaskFirestore,
  deleteTaskFirestore,
  subscribeToTasksFirestore,
  Task
} from '@/lib/tasks';

export type { Task };  // Re-export the Task type

export function useTaskService() {
  const { user } = useAuth();

  async function createTask(task: Omit<Task, 'id' | 'userId'>) {
    if (!user) throw new Error('Not signed in');
    return createTaskFirestore(task, user.uid);
  }

  async function updateTask(taskId: string, updates: Partial<Task>) {
    if (!user) throw new Error('Not signed in');
    return updateTaskFirestore(taskId, updates);
  }

  async function deleteTask(taskId: string) {
    if (!user) throw new Error('Not signed in');
    return deleteTaskFirestore(taskId);
  }

  function subscribeToTasks(cb: (tasks: Task[]) => void) {
    if (!user) throw new Error('Not signed in');
    return subscribeToTasksFirestore(user.uid, cb);
  }

  return { createTask, updateTask, deleteTask, subscribeToTasks };
} 