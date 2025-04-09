import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Card, Text } from 'react-native-paper';
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
  return (
    <View style={styles.column}>
      <Text variant="titleMedium" style={styles.title}>{title}</Text>
      {tasks.map((task) => (
        <View key={task.id} style={styles.taskWrapper}>
          <Card 
            style={styles.taskCard} 
            onPress={() => onTaskPress(task)}
          >
            <Card.Content>
              <Text variant="titleMedium">{task.title}</Text>
              <Text variant="bodyMedium" numberOfLines={2}>
                {task.description}
              </Text>
            </Card.Content>
          </Card>
        </View>
      ))}
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