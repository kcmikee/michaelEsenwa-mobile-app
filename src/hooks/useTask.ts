import { useCallback, useState } from "react";
import { taskService } from "../services/task.service";
import { Task } from "../types";

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(
    async (filters?: { assignedTo?: number; status?: string }) => {
      setLoading(true);
      setError(null);
      try {
        const data = await taskService.getTasks(filters);
        setTasks(data);
      } catch (err) {
        setError("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createTask = async (data: {
    title: string;
    description?: string;
    assignedTo: number;
    dueDate?: string;
  }) => {
    try {
      const newTask = await taskService.createTask(data);
      setTasks((prev) => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      throw new Error("Failed to create task");
    }
  };

  const updateTask = async (id: number, data: Partial<Task>) => {
    try {
      const updatedTask = await taskService.updateTask(id, data);
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updatedTask : task))
      );
      return updatedTask;
    } catch (err) {
      throw new Error("Failed to update task");
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await taskService.deleteTask(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (err) {
      throw new Error("Failed to delete task");
    }
  };

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadTasks();
    } finally {
      setRefreshing(false);
    }
  }, [loadTasks]);

  return {
    tasks,
    loading,
    refreshing,
    error,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    refresh,
  };
};
