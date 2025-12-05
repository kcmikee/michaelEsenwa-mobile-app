import { useCallback, useState } from "react";
import { teamService } from "../services/team.service";
import { TeamMember, TeamStats } from "../types";

export const useTeam = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await teamService.getTeamMembers();
      setMembers(data);
    } catch (err) {
      setError("Failed to load team members");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    setError(null);
    try {
      const data = await teamService.getTeamStats();
      setStats(data);
    } catch (err) {
      setError("Failed to load team stats");
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadMembers(), loadStats()]);
    } finally {
      setRefreshing(false);
    }
  }, [loadMembers, loadStats]);

  return {
    members,
    stats,
    loading,
    refreshing,
    error,
    loadMembers,
    loadStats,
    refresh,
  };
};
