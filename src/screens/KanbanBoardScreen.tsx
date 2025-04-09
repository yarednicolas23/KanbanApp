import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Modal,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { Task } from '../types';
import { TaskStatus } from '../types';
import { createTask, getTasksByUser, moveTask } from '../services/tasks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import KanbanColumn from '../components/KanbanColumn';
import { TASK_STATUS } from '../constants';

type KanbanBoardScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'KanbanBoard'>;

interface KanbanBoardScreenProps {
  navigation: KanbanBoardScreenNavigationProp;
}

export default function KanbanBoardScreen({ navigation }: KanbanBoardScreenProps) {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [visible, setVisible] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: TASK_STATUS.TODO,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const unsubscribe = getTasksByUser(user.id, (tasks) => {
        setTasks(tasks);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      return;
    }

    setLoading(true);
    try {
      await createTask({
        ...newTask,
        userId: user?.id || '',
      });
      setNewTask({
        title: '',
        description: '',
        status: TASK_STATUS.TODO,
      });
      setVisible(false);
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskMove = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await moveTask(taskId, newStatus);
    } catch (error) {
      console.error('Error moving task:', error);
    }
  };

  const columns = [
    { id: TASK_STATUS.TODO, title: 'To Do' },
    { id: TASK_STATUS.IN_PROGRESS, title: 'In Progress' },
    { id: TASK_STATUS.DONE, title: 'Done' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Kanban Board</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal style={styles.board} contentContainerStyle={styles.boardContent}>
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            title={column.title}
            status={column.id}
            tasks={tasks.filter((task) => task.status === column.id)}
            onTaskPress={(task) => navigation.navigate('TaskDetail', { taskId: task.id })}
            onTaskMove={handleTaskMove}
          />
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Create New Task</Text>
            <TextInput
              placeholder="Title"
              value={newTask.title}
              onChangeText={(text) => setNewTask({ ...newTask, title: text })}
              style={styles.input}
            />
            <TextInput
              placeholder="Description"
              value={newTask.description}
              onChangeText={(text) => setNewTask({ ...newTask, description: text })}
              style={styles.input}
              multiline
            />
            <TouchableOpacity 
              style={styles.button}
              onPress={handleCreateTask}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Create Task</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#007AFF',
    fontSize: 16,
  },
  board: {
    flex: 1,
  },
  boardContent: {
    padding: 16,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
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
        elevation: 5,
      },
    }),
  },
  fabText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: Platform.select({
      ios: 10,
      android: 8,
    }),
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
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
  button: {
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: Platform.select({
      ios: 10,
      android: 8,
    }),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 