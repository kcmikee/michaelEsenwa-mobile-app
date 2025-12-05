import { contactsService } from "@/src/services/contact.service";
import { taskService } from "@/src/services/task.service";
import { teamService } from "@/src/services/team.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import { Invitation, Task, TeamMember, TeamStats } from "../types";

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: authService.getMe,
    retry: false,
  });
};

export const useTeamMembers = () => {
  return useQuery<TeamMember[]>({
    queryKey: ["teamMembers"],
    queryFn: teamService.getTeamMembers,
  });
};

export const useMyTeam = () => {
  return useQuery<TeamMember[]>({
    queryKey: ["myTeam"],
    queryFn: teamService.getMyTeam,
  });
};

export const useTeamHierarchy = () => {
  return useQuery<any[]>({
    queryKey: ["teamHierarchy"],
    queryFn: teamService.getTeamHierarchy,
  });
};

export const useTeamStats = () => {
  return useQuery<TeamStats>({
    queryKey: ["teamStats"],
    queryFn: teamService.getTeamStats,
  });
};

export const useTeamLeader = () => {
  return useQuery<TeamMember | null>({
    queryKey: ["teamLeader"],
    queryFn: teamService.getTeamLeader,
  });
};

export const useTasks = (filters?: {
  assignedTo?: number;
  status?: string;
}) => {
  return useQuery<Task[]>({
    queryKey: ["tasks", filters],
    queryFn: () => taskService.getTasks(filters),
  });
};

export const useTask = (id: number) => {
  return useQuery<Task>({
    queryKey: ["task", id],
    queryFn: async () => {
      const tasks = await taskService.getTasks();
      const task = tasks.find((t) => t.id === id);
      if (!task) throw new Error("Task not found");
      return task;
    },
    enabled: !!id,
  });
};

// ============================================
// TASK MUTATIONS
// ============================================

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskService.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["teamStats"] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Task> }) =>
      taskService.updateTask(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["teamStats"] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["teamStats"] });
    },
  });
};

export const useInvitations = () => {
  return useQuery<Invitation[]>({
    queryKey: ["invitations"],
    queryFn: contactsService.getInvitations,
  });
};

export const useCreateInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      recipientPhone,
      recipientName,
      recipientEmail,
    }: {
      recipientPhone: string;
      recipientName?: string;
      recipientEmail?: string;
    }) =>
      contactsService.sendInvitation(
        recipientPhone,
        recipientName,
        recipientEmail
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
    },
  });
};

export const useRefetchAll = () => {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries();
  };
};

export const useIsLoading = () => {
  const queryClient = useQueryClient();
  const queries = queryClient.getQueryCache().getAll();

  return queries.some((query) => query.state.fetchStatus === "fetching");
};

export const usePrefetchData = () => {
  const queryClient = useQueryClient();

  return {
    prefetchTeamMembers: () =>
      queryClient.prefetchQuery({
        queryKey: ["teamMembers"],
        queryFn: teamService.getTeamMembers,
      }),
    prefetchTasks: () =>
      queryClient.prefetchQuery({
        queryKey: ["tasks"],
        queryFn: () => taskService.getTasks(),
      }),
    prefetchTeamStats: () =>
      queryClient.prefetchQuery({
        queryKey: ["teamStats"],
        queryFn: teamService.getTeamStats,
      }),
  };
};
