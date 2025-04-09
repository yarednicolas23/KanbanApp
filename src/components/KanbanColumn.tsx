import React from 'react';
import { View, StyleSheet, Dimensions, Platform, Text, TouchableOpacity } from 'react-native';
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
  backgroundColor?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_WIDTH = SCREEN_WIDTH * 0.8;

const KanbanColumn: React.FC<KanbanColumnProps> = ({ 
  title, 
  tasks, 
  status,
  onTaskPress,
  onTaskMove,
  backgroundColor = 'white'
}) => {
  return (
    <View style={[styles.column, { backgroundColor }]}>
      <Text style={styles.title}>{title}</Text>
      {tasks.map((task) => (
        <TouchableOpacity 
          key={task.id} 
          style={styles.taskWrapper}
          onPress={() => onTaskPress(task)}
        >
          <View style={styles.taskCard}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskDescription} numberOfLines={2}>
              {task.description}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  column: {
    width: COLUMN_WIDTH,
    margin: 8,
    padding: 8,
    borderRadius: Platform.select({
      ios: 10,
      android: 8,
    }),
    minHeight: 400,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'left',
    color: Platform.select({
      ios: '#000000',
      android: '#000000',
    }),
  },
  taskWrapper: {
    marginBottom: 8,
  },
  taskCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: Platform.select({
      ios: 10,
      android: 8,
    }),
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: Platform.select({
      ios: '#000000',
      android: '#000000',
    }),
  },
  taskDescription: {
    fontSize: 14,
    color: Platform.select({
      ios: '#666666',
      android: '#666666',
    }),
  },
});

export default KanbanColumn; 