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
import { createTask, getTasksByUser, moveTask, reorderTasks } from '../services/tasks';
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
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  useEffect(() => {
    navigation.setOptions({
      title: 'Kanban Board',
      headerRight: () => (
        Platform.OS === 'android' ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity 
              onPress={() => setVisible(true)}
              style={{ marginRight: 16 }}
            >
              <Text style={{ color: '#007AFF', fontSize: 16 }}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={logout}
              style={{ marginRight: 16 }}
            >
              <Text style={{ color: '#007AFF', fontSize: 16 }}>Logout</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            onPress={() => setVisible(true)}
            style={{ marginRight: 16 }}
          >
            <Text style={{ color: '#007AFF', fontSize: 16 }}>+</Text>
          </TouchableOpacity>
        )
      ),
      headerLeft: () => (
        Platform.OS === 'ios' ? (
          <TouchableOpacity 
            onPress={logout}
            style={{ marginLeft: 16 }}
          >
            <Text style={{ color: '#007AFF', fontSize: 16 }}>Logout</Text>
          </TouchableOpacity>
        ) : null
      ),
    });
  }, [navigation, logout]);

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

  const handleTaskMove = async (taskId: string, newStatus: TaskStatus): Promise<void> => {
    try {
      // Actualizar el estado local primero
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );

      // Luego actualizar en la base de datos
      await moveTask(taskId, newStatus);
    } catch (error) {
      console.error('Error moving task:', error);
      // Revertir el cambio en caso de error
      setTasks(prevTasks => prevTasks);
    }
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragEnd = async (tasks: Task[]) => {
    if (!draggedTask) return;

    try {
      // Actualizar el estado local primero para una respuesta más rápida
      setTasks(tasks);

      // Luego actualizar en la base de datos
      const taskToUpdate = tasks.find(t => t.id === draggedTask.id);
      if (taskToUpdate && taskToUpdate.status !== draggedTask.status) {
        await moveTask(draggedTask.id, taskToUpdate.status);
      }
    } catch (error) {
      console.error('Error moving task:', error);
      // Revertir el cambio en caso de error
      setTasks(prevTasks => prevTasks);
    } finally {
      setDraggedTask(null);
    }
  };

  const handleTaskPress = (task: Task) => {
    navigation.navigate('TaskDetail', { taskId: task.id });
  };

  const columns = [
    { id: TASK_STATUS.TODO, title: 'To Do', color: '#E3F2FD' },
    { id: TASK_STATUS.IN_PROGRESS, title: 'In Progress', color: '#FFF8E1' },
    { id: TASK_STATUS.DONE, title: 'Done', color: '#E8F5E9' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView horizontal style={styles.board} contentContainerStyle={styles.boardContent}>
        <KanbanColumn
          title="To Do"
          tasks={tasks.filter(task => task.status === TASK_STATUS.TODO)}
          status={TASK_STATUS.TODO}
          onTaskPress={handleTaskPress}
          onTaskMove={handleTaskMove}
          backgroundColor="#E3F2FD"
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
        />
        <KanbanColumn
          title="In Progress"
          tasks={tasks.filter(task => task.status === TASK_STATUS.IN_PROGRESS)}
          status={TASK_STATUS.IN_PROGRESS}
          onTaskPress={handleTaskPress}
          onTaskMove={handleTaskMove}
          backgroundColor="#FFF8E1"
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
        />
        <KanbanColumn
          title="Done"
          tasks={tasks.filter(task => task.status === TASK_STATUS.DONE)}
          status={TASK_STATUS.DONE}
          onTaskPress={handleTaskPress}
          onTaskMove={handleTaskMove}
          backgroundColor="#E8F5E9"
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
        />
      </ScrollView>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <TouchableOpacity 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
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
          </TouchableOpacity>
        </TouchableOpacity>
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
  board: {
    flex: 1,
  },
  boardContent: {
    padding: 16,
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