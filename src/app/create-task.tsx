import { Picker } from "@react-native-picker/picker";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { LoadingSpinner } from "@/src/components/Loader";
import { COLORS, SPACING } from "@/src/constants";
import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useTeamMembers,
  useUpdateTask,
} from "@/src/hooks/useQueries";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../store/AuthStore";

export default function CreateTaskScreen() {
  const { taskId } = useLocalSearchParams<{ taskId?: string }>();
  const { data: tasks } = useTasks();
  const existingTask = taskId
    ? tasks?.find((t) => t.id.toString() === taskId)
    : undefined;
  const isEditing = !!existingTask;

  const user = useAuthStore((state) => state.user);
  const [title, setTitle] = useState(existingTask?.title || "");
  const [description, setDescription] = useState(
    existingTask?.description || ""
  );
  const [assignedTo, setAssignedTo] = useState<number | undefined>(
    existingTask?.assignedTo
  );
  const [dueDate, setDueDate] = useState<Date | undefined>(
    existingTask?.dueDate ? new Date(existingTask.dueDate) : undefined
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { data: teamMembers, isLoading: loadingMembers } = useTeamMembers();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return "";
    return date.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  const formatDateDisplay = (date?: Date) => {
    if (!date) return "Select due date";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a task title");
      return;
    }

    if (!assignedTo) {
      Alert.alert("Error", "Please select who to assign this task to");
      return;
    }

    try {
      if (isEditing) {
        await updateTask.mutateAsync({
          id: existingTask.id,
          data: {
            title,
            description,
            dueDate: dueDate ? formatDate(dueDate) : undefined,
          },
        });
        Alert.alert("Success", "Task updated successfully");
      } else {
        await createTask.mutateAsync({
          title,
          description,
          assignedTo,
          dueDate: dueDate ? formatDate(dueDate) : undefined,
        });
        Alert.alert("Success", "Task created successfully");
      }
      router.back();
    } catch {
      Alert.alert("Error", "Failed to save task. Please try again.");
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTask.mutateAsync(existingTask!.id);
            Alert.alert("Success", "Task deleted successfully");
            router.back();
          } catch {
            Alert.alert("Error", "Failed to delete task");
          }
        },
      },
    ]);
  };

  const clearDueDate = () => {
    setDueDate(undefined);
  };

  if (loadingMembers) {
    return (
      <>
        <Stack.Screen
          options={{ title: isEditing ? "Edit Task" : "Create Task" }}
        />
        <LoadingSpinner message="Loading..." />
      </>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: isEditing ? "Edit Task" : "Create Task",
          presentation: "modal",
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={{ marginLeft: 20 }}>
          <TouchableOpacity onPress={() => router.navigate("/tasks")}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Task Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter task title"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter task description"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Assign To *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={assignedTo}
                  onValueChange={(value) => setAssignedTo(value as number)}
                  enabled={!isEditing}
                  style={{ color: "black" }}
                  itemStyle={{ color: "black" }}
                >
                  <Picker.Item label="Select assignee..." value={undefined} />

                  {user && (
                    <Picker.Item
                      label={`Myself (${user.name})`}
                      value={user.id}
                    />
                  )}

                  {teamMembers && teamMembers.length > 0 && (
                    <Picker.Item
                      label="─── Team Members ───"
                      value={undefined}
                      enabled={false}
                    />
                  )}

                  {teamMembers?.map((member) => (
                    <Picker.Item
                      key={member.id}
                      label={member.name}
                      value={member.id}
                    />
                  ))}
                </Picker>
              </View>

              {isEditing && (
                <Text style={styles.helperText}>
                  Cannot change assignee for existing task
                </Text>
              )}

              {!isEditing && assignedTo === user?.id && (
                <View style={styles.selfAssignNotice}>
                  <Text style={styles.selfAssignText}>
                    ✓ This task will be assigned to you
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Due Date</Text>

              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(!showDatePicker)}
              >
                <Text
                  style={[
                    styles.datePickerText,
                    !dueDate && styles.datePickerPlaceholder,
                  ]}
                >
                  {formatDateDisplay(dueDate)}
                </Text>
                <Text style={styles.datePickerIcon}>📅</Text>
              </TouchableOpacity>

              {dueDate && (
                <TouchableOpacity
                  style={styles.clearDateButton}
                  onPress={clearDueDate}
                >
                  <Text style={styles.clearDateText}>Clear Date</Text>
                </TouchableOpacity>
              )}

              {showDatePicker && (
                <DateTimePicker
                  value={dueDate || new Date()}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                  accentColor="black"
                  textColor="black"
                />
              )}

              {/* <Text style={styles.helperText}>
                {dueDate
                  ? `Due: ${formatDate(dueDate)}`
                  : "Tap to select a due date"}
              </Text> */}
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={createTask.isPending || updateTask.isPending}
            >
              <Text style={styles.saveButtonText}>
                {isEditing ? "Update Task" : "Create Task"}
              </Text>
            </TouchableOpacity>

            {isEditing && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
                disabled={deleteTask.isPending}
              >
                <Text style={styles.deleteButtonText}>Delete Task</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.dark,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.light,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.dark,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  pickerContainer: {
    backgroundColor: COLORS.light,
    borderRadius: 8,
    overflow: "hidden",
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.light,
    borderRadius: 8,
    padding: SPACING.md,
  },
  datePickerText: {
    fontSize: 16,
    color: COLORS.dark,
  },
  datePickerPlaceholder: {
    color: COLORS.gray,
  },
  datePickerIcon: {
    fontSize: 20,
  },
  clearDateButton: {
    marginTop: SPACING.sm,
    alignSelf: "flex-start",
  },
  clearDateText: {
    fontSize: 14,
    color: COLORS.danger,
    fontWeight: "500",
  },
  helperText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: SPACING.sm,
  },
  selfAssignNotice: {
    backgroundColor: COLORS.info + "20",
    padding: SPACING.sm,
    borderRadius: 6,
    marginTop: SPACING.sm,
  },
  selfAssignText: {
    fontSize: 12,
    color: COLORS.info,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: "center",
    marginTop: SPACING.md,
  },
  saveButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: COLORS.danger,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: "center",
    marginTop: SPACING.md,
  },
  deleteButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: "600",
  },
});
