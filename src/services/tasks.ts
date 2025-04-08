import { 
  ref,
  push,
  set,
  update,
  remove,
  query,
  orderByChild,
  equalTo,
  onValue,
  off,
  DatabaseReference,
  DataSnapshot
} from 'firebase/database';
import { database } from './firebase';
import { Task, TaskStatus } from '../types';

const tasksRef = ref(database, 'tasks');

export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
  const newTaskRef = push(tasksRef);
  const newTask: Task = {
    ...task,
    id: newTaskRef.key || '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  await set(newTaskRef, newTask);
  return newTask;
};

export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<void> => {
  const taskRef = ref(database, `tasks/${taskId}`);
  await update(taskRef, {
    ...updates,
    updatedAt: new Date(),
  });
};

export const deleteTask = async (taskId: string): Promise<void> => {
  const taskRef = ref(database, `tasks/${taskId}`);
  await remove(taskRef);
};

export const moveTask = async (taskId: string, newStatus: TaskStatus): Promise<void> => {
  await updateTask(taskId, { status: newStatus });
};

export const getTasksByUser = (userId: string, callback: (tasks: Task[]) => void): () => void => {
  const tasksQuery = query(tasksRef, orderByChild('userId'), equalTo(userId));
  
  const handleData = (snapshot: DataSnapshot) => {
    const tasks: Task[] = [];
    snapshot.forEach((childSnapshot) => {
      tasks.push(childSnapshot.val());
    });
    callback(tasks);
  };

  onValue(tasksQuery, handleData);

  return () => {
    off(tasksQuery, 'value', handleData);
  };
}; 