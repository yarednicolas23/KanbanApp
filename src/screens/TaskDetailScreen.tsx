import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, IconButton } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { Task, TaskStatus } from '../types';
import { updateTask, deleteTask } from '../services/tasks';
import { database } from '../services/firebase';
import { ref, onValue, off } from 'firebase/database';

type TaskDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TaskDetail'>;
type TaskDetailScreenRouteProp = RouteProp<RootStackParamList, 'TaskDetail'>;

interface TaskDetailScreenProps {
  navigation: TaskDetailScreenNavigationProp;
  route: TaskDetailScreenRouteProp;
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'inProgress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

export default function TaskDetailScreen({ navigation, route }: TaskDetailScreenProps) {
  const { taskId } = route.params;
  const [task, setTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});

  useEffect(() => {
    // Fetch task details from Firebase
    const taskRef = ref(database, `tasks/${taskId}`);
    const unsubscribe = onValue(taskRef, (snapshot) => {
      setTask(snapshot.val());
    });

    return () => {
      off(taskRef);
    };
  }, [taskId]);

  const handleUpdateTask = async () => {
    if (!task) return;

    try {
      await updateTask(task.id, editedTask);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async () => {
    if (!task) return;

    try {
      await deleteTask(task.id);
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  if (!task) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.title}>Task Details</Text>
        <IconButton
          icon={isEditing ? 'check' : 'pencil'}
          onPress={() => {
            if (isEditing) {
              handleUpdateTask();
            } else {
              setEditedTask(task);
              setIsEditing(true);
            }
          }}
        />
      </View>

      <View style={styles.content}>
        {isEditing ? (
          <>
            <TextInput
              label="Title"
              value={editedTask.title}
              onChangeText={(text) => setEditedTask({ ...editedTask, title: text })}
              style={styles.input}
            />
            <TextInput
              label="Description"
              value={editedTask.description}
              onChangeText={(text) => setEditedTask({ ...editedTask, description: text })}
              style={styles.input}
              multiline
            />
          </>
        ) : (
          <>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskDescription}>{task.description}</Text>
          </>
        )}

        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status:</Text>
          {statusOptions.map((option) => (
            <Button
              key={option.value}
              mode={task.status === option.value ? 'contained' : 'outlined'}
              onPress={() => {
                if (isEditing) {
                  setEditedTask({ ...editedTask, status: option.value });
                } else {
                  updateTask(task.id, { status: option.value });
                }
              }}
              style={styles.statusButton}
            >
              {option.label}
            </Button>
          ))}
        </View>

        <Button
          mode="contained"
          onPress={handleDeleteTask}
          style={styles.deleteButton}
          buttonColor="red"
        >
          Delete Task
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  taskDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  statusContainer: {
    marginBottom: 24,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusButton: {
    marginBottom: 8,
  },
  deleteButton: {
    marginTop: 'auto',
  },
}); 