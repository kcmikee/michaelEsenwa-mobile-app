import { EmptyState } from "@/src/components/Empty";
import { ErrorMessage } from "@/src/components/ErrorComponent";
import { LoadingSpinner } from "@/src/components/Loader";
import { COLORS, SPACING } from "@/src/constants";
import { useTeamStats } from "@/src/hooks/useQueries";
import { router } from "expo-router";
import React from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DashboardScreen() {
  const { data: stats, isLoading, error, refetch } = useTeamStats();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading && !refreshing) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (error && !refreshing) {
    return (
      <ErrorMessage
        message="Failed to load dashboard"
        onRetry={() => refetch()}
      />
    );
  }

  if (!stats || stats.totalMembers === 0) {
    return (
      <EmptyState
        title="Build Your Team"
        message="Invite team members to see your dashboard statistics"
        actionText="Invite Contacts"
        onAction={() => router.push("/contacts")}
        icon={<Text style={{ fontSize: 64 }}>📊</Text>}
      />
    );
  }

  const StatCard = ({
    title,
    value,
    subtitle,
    color,
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    color: string;
  }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const ActivityItem = ({
    activity,
  }: {
    activity: (typeof stats.recentActivity)[0];
  }) => {
    const getIcon = () => {
      switch (activity.type) {
        case "member_joined":
          return "👋";
        case "task_completed":
          return "✅";
        case "task_assigned":
          return "📋";
        default:
          return "📌";
      }
    };

    return (
      <View style={styles.activityItem}>
        <Text style={styles.activityIcon}>{getIcon()}</Text>
        <View style={styles.activityContent}>
          <Text style={styles.activityDescription}>{activity.description}</Text>
          <Text style={styles.activityTime}>
            {new Date(activity.timestamp).toLocaleString()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          style={{ height: "100%" }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
            />
          }
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Team Dashboard</Text>
            <Text style={styles.headerSubtitle}>
              Overview of your team&apos;s performance
            </Text>
          </View>

          <View style={styles.statsGrid}>
            <StatCard
              title="Team Members"
              value={stats.totalMembers}
              subtitle={`${stats.activeMembers} active (30 days)`}
              color={COLORS.primary}
            />

            <StatCard
              title="Total Tasks"
              value={stats.totalTasks}
              subtitle={`${stats.completedTasks} completed`}
              color={COLORS.info}
            />

            <StatCard
              title="Completion Rate"
              value={`${Math.round(stats.completionRate)}%`}
              subtitle={
                stats.completionRate >= 80
                  ? "Excellent!"
                  : stats.completionRate >= 50
                  ? "Good"
                  : "Needs improvement"
              }
              color={
                stats.completionRate >= 80
                  ? COLORS.success
                  : stats.completionRate >= 50
                  ? COLORS.warning
                  : COLORS.danger
              }
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
            </View>

            <View style={styles.activityList}>
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))
              ) : (
                <Text style={styles.noActivityText}>No recent activity</Text>
              )}
            </View>
          </View>

          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push("/contacts")}
            >
              <Text style={styles.quickActionIcon}>👥</Text>
              <Text style={styles.quickActionText}>Invite Team Members</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push("/create-task")}
            >
              <Text style={styles.quickActionIcon}>➕</Text>
              <Text style={styles.quickActionText}>Create New Task</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push("/team")}
            >
              <Text style={styles.quickActionIcon}>📊</Text>
              <Text style={styles.quickActionText}>View Team</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    height: "105%",
    backgroundColor: COLORS.light,
  },
  header: {
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.dark,
    marginBottom: SPACING.sm,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
  },
  statsGrid: {
    padding: SPACING.md,
  },
  statCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
  },
  statTitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: SPACING.xs,
  },
  statSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
  },
  section: {
    padding: SPACING.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.dark,
  },
  activityList: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
  },
  activityItem: {
    flexDirection: "row",
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  activityIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 14,
    color: COLORS.dark,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: COLORS.gray,
  },
  noActivityText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: "center",
    paddingVertical: SPACING.lg,
  },
  quickActions: {
    padding: SPACING.md,
  },
  quickActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  quickActionIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  quickActionText: {
    fontSize: 16,
    color: COLORS.dark,
    fontWeight: "500",
  },
});
