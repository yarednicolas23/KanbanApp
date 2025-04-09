import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { Task, TaskStatus } from '../types';
import { getTaskById, updateTask, deleteTask } from '../services/tasks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { TASK_STATUS } from '../constants';

type TaskDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TaskDetail'>;

interface TaskDetailScreenProps {
  navigation: TaskDetailScreenNavigationProp;
  route: {
    params: {
      taskId: string;
    };
  };
}

export default function TaskDetailScreen({ navigation, route }: TaskDetailScreenProps) {
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const statusColors = {
    [TASK_STATUS.TODO]: '#E3F2FD',
    [TASK_STATUS.IN_PROGRESS]: '#FFF8E1',
    [TASK_STATUS.DONE]: '#E8F5E9',
  };

  useEffect(() => {
    const loadTask = async () => {
      if (user) {
        const taskData = await getTaskById(route.params.taskId);
        setTask(taskData);
      }
    };
    loadTask();
  }, [user, route.params.taskId]);

  useEffect(() => {
    navigation.setOptions({
      title: 'Task Details',
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            if (isEditing) {
              handleUpdateTask();
            } else {
              setEditedTask(task);
              setIsEditing(true);
            }
          }}
          style={{ marginRight: 16 }}
        >
          <Text style={{ color: '#007AFF', fontSize: 16 }}>
            {isEditing ? '💾 Guardar' : '✏️ Editar'}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, isEditing, task]);

  const handleUpdateTask = async () => {
    if (!editedTask || !task) return;

    setLoading(true);
    try {
      const updates = {
        title: editedTask.title,
        description: editedTask.description,
      };
      await updateTask(editedTask.id, updates);
      setTask(editedTask);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (editedTask) {
      const updatedTask = { ...editedTask, status: newStatus };
      setEditedTask(updatedTask);
      try {
        await updateTask(editedTask.id, { status: newStatus });
        setTask(updatedTask);
      } catch (error) {
        console.error('Error updating task status:', error);
      }
    }
  };

  const handleDeleteTask = async () => {
    if (!task) return;
    
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteTask(task.id);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting task:', error);
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  if (!task) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {isEditing ? (
          <>
            <TextInput
              style={styles.input}
              value={editedTask?.title}
              onChangeText={(text) => setEditedTask({ ...editedTask!, title: text })}
              placeholder="Task Title"
            />
            <TextInput
              style={[styles.input, styles.descriptionInput]}
              value={editedTask?.description}
              onChangeText={(text) => setEditedTask({ ...editedTask!, description: text })}
              placeholder="Task Description"
              multiline
            />
            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Status:</Text>
              <View style={styles.statusButtons}>
                {Object.values(TASK_STATUS).map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusButton,
                      { backgroundColor: statusColors[status] },
                      editedTask?.status === status && styles.selectedStatusButton,
                    ]}
                    onPress={() => handleStatusChange(status)}
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        editedTask?.status === status && styles.selectedStatusButtonText,
                      ]}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.title}>{task.title}</Text>
            <Text style={styles.description}>{task.description}</Text>
            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Status:</Text>
              <Text style={styles.statusValue}>
                {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
              </Text>
            </View>
          </>
        )}
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
    </ScrollView>
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
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: Platform.select({
      ios: 10,
      android: 8,
    }),
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  descriptionInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  statusContainer: {
    marginTop: 16,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusValue: {
    fontSize: 16,
    color: '#666',
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Platform.select({
      ios: 10,
      android: 8,
    }),
    marginRight: 8,
  },
  selectedStatusButton: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  statusButtonText: {
    fontSize: 14,
    color: '#666',
  },
  selectedStatusButtonText: {
    color: '#007AFF',
    fontWeight: '600',
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
    margin: 16,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 