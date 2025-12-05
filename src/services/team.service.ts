import { TeamMember, TeamStats } from "../types";
import api from "./api";

export const teamService = {
  async getTeamMembers(): Promise<TeamMember[]> {
    const response = await api.get("/team/members");
    return response.data.data;
  },

  async getMyTeam(): Promise<TeamMember[]> {
    const response = await api.get("/team/my-team");
    return response.data.data;
  },

  async getTeamHierarchy(): Promise<any[]> {
    const response = await api.get("/team/hierarchy");
    return response.data.data;
  },

  async getTeamStats(): Promise<TeamStats> {
    const response = await api.get("/team/stats");
    return response.data.data;
  },

  async getTeamLeader(): Promise<TeamMember | null> {
    const response = await api.get("/team/leader");
    return response.data.data;
  },
};
