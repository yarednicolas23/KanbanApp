import React, { useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { TaskStatus } from '../types';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
}

interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  status: TaskStatus;
  onTaskPress: (task: Task) => void;
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_WIDTH = SCREEN_WIDTH * 0.8;

const KanbanColumn: React.FC<KanbanColumnProps> = ({ 
  title, 
  tasks, 
  status,
  onTaskPress,
  onTaskMove 
}) => {
  const handleTaskMove = useCallback((taskId: string, newStatus: TaskStatus) => {
    onTaskMove(taskId, newStatus);
  }, [onTaskMove]);

  const createPanGesture = (task: Task) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const isDragging = useSharedValue(false);

    const panGesture = Gesture.Pan()
      .onStart(() => {
        isDragging.value = true;
      })
      .onUpdate((event: { translationX: number; translationY: number }) => {
        translateX.value = event.translationX;
        translateY.value = event.translationY;
      })
      .onEnd((event: { translationX: number }) => {
        isDragging.value = false;
        
        const moveDistance = event.translationX;
        const columnThreshold = COLUMN_WIDTH * 0.4;
        
        let newStatus = status;
        
        if (moveDistance > columnThreshold) {
          if (status === 'todo') newStatus = 'inProgress';
          else if (status === 'inProgress') newStatus = 'done';
        } else if (moveDistance < -columnThreshold) {
          if (status === 'done') newStatus = 'inProgress';
          else if (status === 'inProgress') newStatus = 'todo';
        }

        if (newStatus !== status) {
          runOnJS(handleTaskMove)(task.id, newStatus);
        }

        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      });

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value },
          { scale: isDragging.value ? 1.05 : 1 },
        ],
        zIndex: isDragging.value ? 1000 : 1,
        shadowOpacity: isDragging.value ? 0.2 : 0,
      };
    });

    return { panGesture, animatedStyle };
  };

  return (
    <View style={styles.column}>
      <Text variant="titleMedium" style={styles.title}>{title}</Text>
      {tasks.map((task) => {
        const { panGesture, animatedStyle } = createPanGesture(task);
        
        return (
          <GestureDetector key={task.id} gesture={panGesture}>
            <Animated.View style={[styles.taskWrapper, animatedStyle]}>
              <Card 
                style={styles.taskCard} 
                onPress={() => onTaskPress(task)}
              >
                <Card.Content>
                  <Text variant="titleMedium" style={styles.taskTitle}>{task.title}</Text>
                  <Text variant="bodyMedium" style={styles.taskDescription} numberOfLines={2}>
                    {task.description}
                  </Text>
                </Card.Content>
              </Card>
            </Animated.View>
          </GestureDetector>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  column: {
    width: COLUMN_WIDTH,
    margin: 8,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    minHeight: 400,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  taskWrapper: {
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 8,
    elevation: 5,
  },
  taskCard: {
    backgroundColor: 'white',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default KanbanColumn; 