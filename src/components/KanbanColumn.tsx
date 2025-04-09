import React from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Task, TaskStatus } from '../types';
import { TASK_STATUS } from '../constants';
import TaskCard from './TaskCard';

interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  status: TaskStatus;
  onTaskPress: (task: Task) => void;
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
  backgroundColor: string;
  onDragStart: (task: Task) => void;
  onDragEnd: (tasks: Task[]) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_WIDTH = SCREEN_WIDTH * 0.8;

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  tasks,
  status,
  onTaskPress,
  onTaskMove,
  backgroundColor,
  onDragStart,
  onDragEnd,
}) => {
  const [localTasks, setLocalTasks] = React.useState(tasks);

  React.useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const handleDragStart = (task: Task) => {
    onDragStart(task);
  };

  const handleDragEnd = (updatedTasks: Task[]) => {
    // Actualizar el estado de la tarea al estado de la columna actual
    const finalTasks = updatedTasks.map(t => {
      if (t.id === updatedTasks[0].id) { // La tarea que se está arrastrando
        return { ...t, status };
      }
      return t;
    });
    
    setLocalTasks(finalTasks);
    onDragEnd(finalTasks);
  };

  return (
    <View style={[styles.column, { backgroundColor }]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.tasksContainer}>
        {localTasks.map((task) => (
          <DraggableTask
            key={task.id}
            task={task}
            status={status}
            onPress={() => onTaskPress(task)}
            onDragStart={() => handleDragStart(task)}
            onDragEnd={handleDragEnd}
            tasks={localTasks}
            onTaskMove={onTaskMove}
          />
        ))}
      </View>
    </View>
  );
};

interface DraggableTaskProps {
  task: Task;
  status: TaskStatus;
  onPress: () => void;
  onDragStart: () => void;
  onDragEnd: (tasks: Task[]) => void;
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
}

const DraggableTask: React.FC<DraggableTaskProps> = ({
  task,
  status,
  onPress,
  onDragStart,
  onDragEnd,
  tasks,
  onTaskMove,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const isDragging = useSharedValue(false);

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {
      scale.value = withSpring(1.05);
      isDragging.value = true;
      runOnJS(onDragStart)();
    },
    onActive: (event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    },
    onEnd: () => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
      isDragging.value = false;

      // Cambiar a in_progress si viene de todo y se arrastró hacia la derecha
      if (task.status === TASK_STATUS.TODO && translateX.value > 100) {
        runOnJS(onTaskMove)(task.id, TASK_STATUS.IN_PROGRESS);
      }
      // Cambiar a todo si viene de in_progress y se arrastró hacia la izquierda
      else if (task.status === TASK_STATUS.IN_PROGRESS && translateX.value < -100) {
        runOnJS(onTaskMove)(task.id, TASK_STATUS.TODO);
      }
      // Cambiar a done si viene de in_progress y se arrastró hacia la derecha
      else if (task.status === TASK_STATUS.IN_PROGRESS && translateX.value > 100) {
        runOnJS(onTaskMove)(task.id, TASK_STATUS.DONE);
      }
      // Cambiar a in_progress si viene de done y se arrastró hacia la izquierda
      else if (task.status === TASK_STATUS.DONE && translateX.value < -100) {
        runOnJS(onTaskMove)(task.id, TASK_STATUS.IN_PROGRESS);
      }

      const updatedTasks = [...tasks];
      runOnJS(onDragEnd)(updatedTasks);
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      zIndex: isDragging.value ? 1 : 0,
    };
  });

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.taskContainer, animatedStyle]}>
        <TaskCard task={task} onPress={onPress} />
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  column: {
    width: COLUMN_WIDTH,
    marginHorizontal: 8,
    padding: 16,
    borderRadius: 8,
    minHeight: 200,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  tasksContainer: {
    flex: 1,
  },
  taskContainer: {
    marginBottom: 8,
  },
});

export default KanbanColumn; 