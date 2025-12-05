import { Task } from "../types";
import api from "./api";

export const taskService = {
  async getTasks(filters?: {
    assignedTo?: number;
    status?: string;
  }): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filters?.assignedTo)
      params.append("assignedTo", filters.assignedTo.toString());
    if (filters?.status) params.append("status", filters.status);

    const response = await api.get(`/tasks?${params.toString()}`);
    return response.data.data;
  },

  async createTask(data: {
    title: string;
    description?: string;
    assignedTo: number;
    dueDate?: string;
  }): Promise<Task> {
    const response = await api.post("/tasks", data);
    return response.data.data;
  },

  async updateTask(id: number, data: Partial<Task>): Promise<Task> {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data.data;
  },

  async deleteTask(id: number): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },
};
