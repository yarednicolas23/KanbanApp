import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text as PaperText, FAB, Portal, Modal, TextInput, Button } from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';
import { Task, TaskStatus } from '../types';
import { createTask, getTasksByUser, moveTask } from '../services/tasks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import KanbanColumn from '../components/KanbanColumn';

type KanbanBoardScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'KanbanBoard'>;

interface KanbanBoardScreenProps {
  navigation: KanbanBoardScreenNavigationProp;
}

const columns: { id: TaskStatus; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'inProgress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

export default function KanbanBoardScreen({ navigation }: KanbanBoardScreenProps) {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [visible, setVisible] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '' });

  useEffect(() => {
    if (!user) return;

    const unsubscribe = getTasksByUser(user.id, (fetchedTasks) => {
      setTasks(fetchedTasks);
    });

    return () => unsubscribe();
  }, [user]);

  const handleCreateTask = async () => {
    if (!user) return;

    try {
      await createTask({
        title: newTask.title,
        description: newTask.description,
        status: 'todo',
        userId: user.id,
      });
      setNewTask({ title: '', description: '' });
      setVisible(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleTaskMove = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await moveTask(taskId, newStatus);
    } catch (error) {
      console.error('Error moving task:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <PaperText style={styles.title}>Kanban Board</PaperText>
        <Button onPress={logout}>Logout</Button>
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

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setVisible(true)}
      />

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <PaperText style={styles.modalTitle}>Create New Task</PaperText>
          <TextInput
            label="Title"
            value={newTask.title}
            onChangeText={(text) => setNewTask({ ...newTask, title: text })}
            style={styles.input}
          />
          <TextInput
            label="Description"
            value={newTask.description}
            onChangeText={(text) => setNewTask({ ...newTask, description: text })}
            style={styles.input}
            multiline
          />
          <Button mode="contained" onPress={handleCreateTask} style={styles.button}>
            Create Task
          </Button>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  board: {
    flex: 1,
  },
  boardContent: {
    padding: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
}); 