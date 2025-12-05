import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, SPACING } from "../constants";
import { TeamMember } from "../types";

interface TeamMemberCardProps {
  member: TeamMember;
  onPress?: (member: TeamMember) => void;
}

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  member,
  onPress,
}) => {
  const joinDate = new Date(member.joinDate).toLocaleDateString();

  console.log(member);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(member)}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{member.name[0].toUpperCase()}</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {member.name}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {member.email}
          </Text>
          <Text style={styles.joinDate}>Joined {joinDate}</Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{member.role}</Text>
        </View>
      </View>
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
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  avatarText: {
    color: COLORS.background,
    fontSize: 24,
    fontWeight: "600",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.dark,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 2,
  },
  joinDate: {
    fontSize: 12,
    color: COLORS.gray,
  },
  badge: {
    backgroundColor: COLORS.info + "20",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: COLORS.info,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
});
