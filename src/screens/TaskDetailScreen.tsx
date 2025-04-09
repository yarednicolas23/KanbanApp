import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity,
  ActivityIndicator,
  Platform
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { Task } from '../types';
import { updateTask, deleteTask } from '../services/tasks';
import { database } from '../services/firebase';
import { ref, onValue, off } from 'firebase/database';

type TaskDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TaskDetail'>;
type TaskDetailScreenRouteProp = RouteProp<RootStackParamList, 'TaskDetail'>;

interface TaskDetailScreenProps {
  navigation: TaskDetailScreenNavigationProp;
  route: TaskDetailScreenRouteProp;
}

const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'inProgress',
  DONE: 'done'
} as const;

const statusOptions = [
  { label: 'To Do', value: TASK_STATUS.TODO },
  { label: 'In Progress', value: TASK_STATUS.IN_PROGRESS },
  { label: 'Done', value: TASK_STATUS.DONE },
];

export default function TaskDetailScreen({ navigation, route }: TaskDetailScreenProps) {
  const { taskId } = route.params;
  const [task, setTask] = useState<Task | null>(null);
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const taskRef = ref(database, `tasks/${taskId}`);
    
    const unsubscribe = onValue(taskRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTask({ ...data, id: taskId });
      }
    });

    return () => {
      off(taskRef);
    };
  }, [taskId]);

  const handleUpdateTask = async () => {
    if (!editedTask) return;

    setLoading(true);
    try {
      await updateTask(taskId, editedTask);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    setLoading(true);
    try {
      await deleteTask(taskId);
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!task) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Task Details</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            if (isEditing) {
              handleUpdateTask();
            } else {
              setEditedTask(task);
              setIsEditing(true);
            }
          }}
        >
          <Text style={styles.editButtonText}>
            {isEditing ? '✓' : '✎'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {isEditing ? (
          <>
            <TextInput
              placeholder="Title"
              value={editedTask?.title}
              onChangeText={(text) => setEditedTask({ ...editedTask!, title: text })}
              style={styles.input}
            />
            <TextInput
              placeholder="Description"
              value={editedTask?.description}
              onChangeText={(text) => setEditedTask({ ...editedTask!, description: text })}
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
            <TouchableOpacity
              key={option.value}
              style={[
                styles.statusButton,
                task.status === option.value && styles.statusButtonActive
              ]}
              onPress={() => {
                if (isEditing) {
                  setEditedTask({ ...editedTask!, status: option.value });
                } else {
                  updateTask(task.id, { status: option.value });
                }
              }}
            >
              <Text style={[
                styles.statusButtonText,
                task.status === option.value && styles.statusButtonTextActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteTask}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.deleteButtonText}>Delete Task</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Platform.select({
      ios: '#f2f2f7',
      android: '#f5f5f5',
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#007AFF',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    fontSize: 20,
    color: '#007AFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: Platform.select({
      ios: 10,
      android: 8,
    }),
    paddingHorizontal: 15,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: 'white',
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: '600',
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
    fontWeight: '600',
    marginBottom: 8,
  },
  statusButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: Platform.select({
      ios: 10,
      android: 8,
    }),
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  statusButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  statusButtonText: {
    fontSize: 16,
    color: '#666',
  },
  statusButtonTextActive: {
    color: 'white',
  },
  deleteButton: {
    height: 50,
    backgroundColor: '#FF3B30',
    borderRadius: Platform.select({
      ios: 10,
      android: 8,
    }),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 