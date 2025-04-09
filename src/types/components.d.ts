declare module '../components/TaskCard' {
  import { FC } from 'react';
  import { Task } from './index';

  interface TaskCardProps {
    task: Task;
    onPress: () => void;
  }

  const TaskCard: FC<TaskCardProps>;
  export default TaskCard;
} 