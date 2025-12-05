import { EmptyState } from "@/src/components/Empty";
import { ErrorMessage } from "@/src/components/ErrorComponent";
import { LoadingSpinner } from "@/src/components/Loader";
import { TeamMemberCard } from "@/src/components/TeamMemberCard";
import { COLORS, SPACING } from "@/src/constants";
import {
  useMyTeam,
  useTeamLeader,
  useTeamMembers,
} from "@/src/hooks/useQueries";

import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function TeamScreen() {
  const [showMode, setShowMode] = useState<"my-team" | "my-invites">("my-team");
  const {
    data: myInvites,
    isLoading: loadingInvites,
    error: errorInvites,
    refetch: refetchInvites,
  } = useTeamMembers();
  const {
    data: myTeam,
    isLoading: loadingTeam,
    error: errorTeam,
    refetch: refetchTeam,
  } = useMyTeam();
  const { data: teamLeader } = useTeamLeader();

  const [refreshing, setRefreshing] = useState(false);

  const isLoading = showMode === "my-team" ? loadingTeam : loadingInvites;
  const error = showMode === "my-team" ? errorTeam : errorInvites;
  const members = showMode === "my-team" ? myTeam : myInvites;

  const handleRefresh = async () => {
    setRefreshing(true);
    if (showMode === "my-team") {
      await refetchTeam();
    } else {
      await refetchInvites();
    }
    setRefreshing(false);
  };

  if (isLoading && !refreshing) {
    return <LoadingSpinner message="Loading team..." />;
  }

  if (error && !refreshing) {
    return (
      <ErrorMessage
        message="Failed to load team"
        onRetry={showMode === "my-team" ? refetchTeam : refetchInvites}
      />
    );
  }

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Team</Text>
        <TouchableOpacity
          style={styles.inviteButton}
          onPress={() => router.push("/contacts")}
        >
          <Text style={styles.inviteButtonText}>+ Invite</Text>
        </TouchableOpacity>
      </View>

      {teamLeader && showMode === "my-team" && (
        <View style={styles.leaderBadge}>
          <Text style={styles.leaderBadgeIcon}>👑</Text>
          <View style={styles.leaderInfo}>
            <Text style={styles.leaderLabel}>Team Leader</Text>
            <Text style={styles.leaderName}>{teamLeader.name}</Text>
          </View>
        </View>
      )}

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            showMode === "my-team" && styles.toggleButtonActive,
          ]}
          onPress={() => setShowMode("my-team")}
        >
          <Text
            style={[
              styles.toggleText,
              showMode === "my-team" && styles.toggleTextActive,
            ]}
          >
            My Team {myTeam ? `(${myTeam.length})` : ""}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            showMode === "my-invites" && styles.toggleButtonActive,
          ]}
          onPress={() => setShowMode("my-invites")}
        >
          <Text
            style={[
              styles.toggleText,
              showMode === "my-invites" && styles.toggleTextActive,
            ]}
          >
            My Invites {myInvites ? `(${myInvites.length})` : ""}
          </Text>
        </TouchableOpacity>
      </View>

      {showMode === "my-team" && (
        <Text style={styles.description}>People in the same team as you</Text>
      )}
      {showMode === "my-invites" && (
        <Text style={styles.description}>People you invited to join</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FlatList
          data={members}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <TeamMemberCard
              member={item}
              onPress={(member) => {
                console.log(item?.role);
                if (item?.role === "leader") {
                  router.push({
                    pathname: "/tasks",
                  });
                } else {
                  router.push({
                    pathname: "/tasks",
                    params: { assignedTo: member.id },
                  });
                }
              }}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title={
                showMode === "my-team" ? "No Team Members" : "No Invites Sent"
              }
              message={
                showMode === "my-team"
                  ? "You are not part of a team yet. Accept an invitation or create your own team!"
                  : "Start building your team by inviting contacts"
              }
              actionText="Invite Contacts"
              onAction={() => router.push("/contacts")}
              icon={<Text style={{ fontSize: 64 }}>👥</Text>}
            />
          }
          contentContainerStyle={
            !members || members.length === 0
              ? styles.emptyContainer
              : styles.listContent
          }
        />
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
  headerContainer: {
    backgroundColor: COLORS.background,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.dark,
  },
  inviteButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  inviteButtonText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: "600",
  },
  leaderBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.warning + "20",
    marginHorizontal: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  leaderBadgeIcon: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  leaderInfo: {
    flex: 1,
  },
  leaderLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  leaderName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.dark,
  },
  toggleContainer: {
    flexDirection: "row",
    marginHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.light,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.gray,
  },
  toggleTextActive: {
    color: COLORS.background,
  },
  description: {
    fontSize: 12,
    color: COLORS.gray,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    fontStyle: "italic",
  },
  listContent: {
    paddingBottom: SPACING.lg,
  },
  emptyContainer: {
    flex: 1,
  },
});
