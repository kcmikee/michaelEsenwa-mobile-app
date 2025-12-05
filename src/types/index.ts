export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: "leader" | "member";
  invitedBy?: number;
  createdAt: string;
}

export interface Contact {
  id: string;
  name: string;
  phoneNumbers?: { number: string }[];
  emails?: { email: string }[];
}

export interface Invitation {
  id: number;
  recipientPhone: string;
  recipientEmail?: string;
  recipientName?: string;
  status: "pending" | "accepted" | "declined";
  inviteLink: string;
  sentAt: string;
  respondedAt?: string;
}

export interface TeamMember {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: string;
  joinDate: string;
  tasksCompleted: number;
  tasksTotal: number;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  assignedBy: number;
  assignedByName?: string;
  assignedTo: number;
  assignedToName?: string;
  status: "pending" | "in_progress" | "completed";
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  recentActivity: Activity[];
}

export interface Activity {
  id: number;
  type: "member_joined" | "task_completed" | "task_assigned";
  userId: number;
  userName: string;
  description: string;
  timestamp: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    phone?: string,
    inviteCode?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}
