import React from "react";
import { Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, SPACING } from "../constants";
import { Invitation } from "../types";

interface InvitationCardProps {
  invitation: Invitation;
  onShare?: (invitation: Invitation) => void;
}

export const InvitationCard: React.FC<InvitationCardProps> = ({
  invitation,
  onShare,
}) => {
  const sentDate = new Date(invitation.sentAt).toLocaleDateString();
  const respondedDate = invitation.respondedAt
    ? new Date(invitation.respondedAt).toLocaleDateString()
    : null;

  const getStatusColor = () => {
    switch (invitation.status) {
      case "accepted":
        return COLORS.success;
      case "declined":
        return COLORS.danger;
      default:
        return COLORS.warning;
    }
  };

  const getStatusText = () => {
    switch (invitation.status) {
      case "accepted":
        return "Accepted";
      case "declined":
        return "Declined";
      default:
        return "Pending";
    }
  };

  const handleShare = async () => {
    if (onShare) {
      onShare(invitation);
    } else {
      try {
        await Share.share({
          message: `Join my sales team! ${invitation.inviteLink}`,
        });
      } catch (error) {
        console.error("Error sharing invitation:", error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.recipientInfo}>
          <Text style={styles.name} numberOfLines={1}>
            {invitation.recipientName || "Unknown"}
          </Text>
          <Text style={styles.phone} numberOfLines={1}>
            {invitation.recipientPhone}
          </Text>
          {invitation.recipientEmail && (
            <Text style={styles.email} numberOfLines={1}>
              {invitation.recipientEmail}
            </Text>
          )}
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

      <View style={styles.dates}>
        <Text style={styles.dateText}>Sent: {sentDate}</Text>
        {respondedDate && (
          <Text style={styles.dateText}>Responded: {respondedDate}</Text>
        )}
      </View>

      {invitation.status === "pending" && (
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>Share Again</Text>
        </TouchableOpacity>
      )}
    </View>
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
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.md,
  },
  recipientInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.dark,
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    color: COLORS.gray,
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
  dates: {
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.light,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 2,
  },
  shareButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    marginTop: SPACING.md,
    alignItems: "center",
  },
  shareButtonText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: "600",
  },
});
