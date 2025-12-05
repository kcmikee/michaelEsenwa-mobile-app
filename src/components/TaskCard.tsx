import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, SPACING } from "../constants";
import { Task } from "../types";

interface TaskCardProps {
  task: Task;
  onPress?: (task: Task) => void;
  onStatusChange?: (task: Task, newStatus: Task["status"]) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onPress,
  onStatusChange,
}) => {
  const dueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString()
    : null;
  const isDueToday =
    task.dueDate &&
    new Date(task.dueDate).toDateString() === new Date().toDateString() &&
    task.status !== "completed";
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "completed";

  const getStatusColor = () => {
    switch (task.status) {
      case "completed":
        return COLORS.success;
      case "in_progress":
        return COLORS.warning;
      default:
        return COLORS.gray;
    }
  };

  const getStatusText = () => {
    switch (task.status) {
      case "completed":
        return "Completed";
      case "in_progress":
        return "In Progress";
      default:
        return "Pending";
    }
  };

  const handleStatusToggle = () => {
    if (onStatusChange) {
      const newStatus = task.status === "completed" ? "pending" : "completed";
      onStatusChange(task, newStatus);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(task)}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.checkbox,
            task.status === "completed" && styles.checkboxChecked,
          ]}
          onPress={handleStatusToggle}
        >
          {task.status === "completed" && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text
            style={[
              styles.title,
              task.status === "completed" && styles.titleCompleted,
            ]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
          {task.description && (
            <Text style={styles.description} numberOfLines={2}>
              {task.description}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.assigneeContainer}>
          <Text style={styles.assigneeLabel}>Assigned to:</Text>
          <Text style={styles.assigneeName} numberOfLines={1}>
            {task.assignedToName || "Unknown"}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor() + "20" },
          ]}
        >
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
      </View>

      {dueDate && (
        <View style={styles.dueDateContainer}>
          <Text style={[styles.dueDate, isOverdue && styles.overdue]}>
            Due: {dueDate}
            {isDueToday ? "(Due Today)" : isOverdue ? "(Overdue)" : ""}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: SPACING.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray,
    marginRight: SPACING.md,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  checkmark: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: "bold",
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.dark,
    marginBottom: 4,
  },
  titleCompleted: {
    textDecorationLine: "line-through",
    color: COLORS.gray,
  },
  description: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.light,
  },
  assigneeContainer: {
    flex: 1,
  },
  assigneeLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 2,
  },
  assigneeName: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.dark,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  dueDateContainer: {
    marginTop: SPACING.sm,
  },
  dueDate: {
    fontSize: 12,
    color: COLORS.gray,
  },
  overdue: {
    color: COLORS.danger,
    fontWeight: "600",
  },
});
