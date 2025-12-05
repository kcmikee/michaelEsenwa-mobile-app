import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, SPACING } from "../constants";
import { Contact } from "../types";

interface ContactListItemProps {
  contact: Contact;
  onInvite: (contact: Contact) => void;
  isInvited?: boolean;
}

export const ContactListItem: React.FC<ContactListItemProps> = ({
  contact,
  onInvite,
  isInvited,
}) => {
  const phone = contact.phoneNumbers?.[0]?.number;
  const email = contact.emails?.[0]?.email;

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {contact.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {contact.name}
        </Text>
        {phone && (
          <Text style={styles.detail} numberOfLines={1}>
            {phone}
          </Text>
        )}
        {email && (
          <Text style={styles.detail} numberOfLines={1}>
            {email}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.inviteButton, isInvited && styles.invitedButton]}
        onPress={() => onInvite(contact)}
        disabled={isInvited}
      >
        <Text style={[styles.inviteText, isInvited && styles.invitedText]}>
          {isInvited ? "Invited" : "Invite"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  avatarContainer: {
    marginRight: SPACING.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: COLORS.background,
    fontSize: 20,
    fontWeight: "600",
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.dark,
    marginBottom: 4,
  },
  detail: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 2,
  },
  inviteButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 6,
  },
  invitedButton: {
    backgroundColor: COLORS.success + "20",
  },
  inviteText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: "600",
  },
  invitedText: {
    color: COLORS.success,
  },
});
