import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, SPACING } from "../constants";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  style?: any;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.errorBox}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.message}>{message}</Text>
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
  },
  errorBox: {
    backgroundColor: COLORS.danger + "15",
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: "center",
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  message: {
    color: COLORS.danger,
    fontSize: 14,
    textAlign: "center",
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 6,
    marginTop: SPACING.sm,
  },
  retryText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: "600",
  },
});
