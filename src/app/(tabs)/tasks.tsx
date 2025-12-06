import { EmptyState } from "@/src/components/Empty";
import { ErrorMessage } from "@/src/components/ErrorComponent";
import { LoadingSpinner } from "@/src/components/Loader";
import { TaskCard } from "@/src/components/TaskCard";
import { COLORS, SPACING } from "@/src/constants";
import { useTasks, useUpdateTask } from "@/src/hooks/useQueries";
import { Task } from "@/src/types";
import { router, useLocalSearchParams, usePathname } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TasksScreen() {
  const params = useLocalSearchParams<{
    assignedTo?: string;
    status?: string;
  }>();
  const pathname = usePathname();
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const filterParams = {
    assignedTo: params.assignedTo ? parseInt(params.assignedTo) : undefined,
    status: filter === "all" ? params.status : filter,
  };

  const { data: tasks, isLoading, error, refetch } = useTasks(filterParams);

  const updateTask = useUpdateTask();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleStatusChange = async (task: Task, newStatus: Task["status"]) => {
    try {
      await updateTask.mutateAsync({
        id: task.id,
        data: { status: newStatus },
      });
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  const hasActiveFilters = useMemo(() => {
    return filter !== "all" || params.assignedTo || params.status;
  }, [filter, params.assignedTo, params.status]);

  const handleClearFilters = () => {
    setFilter("all");
    // @ts-ignore
    router.replace(pathname);
    handleRefresh();
  };

  const FilterButton = ({
    title,
    value,
  }: {
    title: string;
    value: typeof filter;
  }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === value && styles.filterButtonActive,
      ]}
      onPress={() => setFilter(value)}
    >
      <Text
        style={[
          styles.filterButtonText,
          filter === value && styles.filterButtonTextActive,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading && !refreshing) {
    return <LoadingSpinner message="Loading tasks..." />;
  }

  if (error && !refreshing) {
    return (
      <ErrorMessage message="Failed to load tasks" onRetry={() => refetch()} />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tasks</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push("/create-task")}
          >
            <Text style={styles.createButtonText}>+ New</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterContainer}>
          <FilterButton title="All" value="all" />
          <FilterButton title="Pending" value="pending" />
          <FilterButton title="Completed" value="completed" />
          {hasActiveFilters && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearFilters}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onPress={(task) =>
                router.push({
                  pathname: "/create-task",
                  params: { taskId: task.id.toString() },
                })
              }
              onStatusChange={handleStatusChange}
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
              title="No Tasks Found"
              message={
                filter === "completed"
                  ? "No completed tasks yet"
                  : "Create your first task to get started"
              }
              actionText={filter === "all" ? "Create Task" : undefined}
              onAction={
                filter === "all" ? () => router.push("/create-task") : undefined
              }
              icon={<Text style={{ fontSize: 64 }}>📝</Text>}
            />
          }
          contentContainerStyle={
            !tasks || tasks.length === 0 ? styles.emptyContainer : undefined
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
    flex: 1,
    backgroundColor: COLORS.light,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.dark,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  createButtonText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: "600",
  },
  filterContainer: {
    flexDirection: "row",
    padding: SPACING.md,
    gap: SPACING.sm,
    backgroundColor: COLORS.background,
    alignItems: "center",
  },
  filterButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.light,
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.gray,
  },
  filterButtonTextActive: {
    color: COLORS.background,
  },
  clearButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.gray + "20",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 60,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.gray,
  },
  emptyContainer: {
    flex: 1,
  },
});
