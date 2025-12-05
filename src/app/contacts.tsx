/* eslint-disable react-hooks/exhaustive-deps */
import { ContactListItem } from "@/src/components/ContactListItem";
import { EmptyState } from "@/src/components/Empty";
import { ErrorMessage } from "@/src/components/ErrorComponent";
import { LoadingSpinner } from "@/src/components/Loader";
import { COLORS, SPACING } from "@/src/constants";
import { useCreateInvitation, useInvitations } from "@/src/hooks/useQueries";
import { contactsService } from "@/src/services/contact.service";
import { Contact } from "@/src/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Contacts from "expo-contacts";
import { router, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ContactsScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState("");

  const { data: invitations } = useInvitations();
  const createInvitation = useCreateInvitation();

  useEffect(() => {
    requestPermission();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [searchQuery, contacts]);

  const requestPermission = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        setHasPermission(true);
        loadContacts();
      } else {
        setError("Contacts permission is required to invite team members");
      }
    } catch {
      setError("Failed to request contacts permission");
    }
  };

  const loadContacts = async () => {
    setIsLoading(true);
    setError("");
    try {
      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Emails,
        ],
      });

      const formattedContacts: Contact[] = data.map((contact) => {
        const phoneNumbers = contact.phoneNumbers
          ?.map((phone) =>
            phone.number ? { number: phone.number } : undefined
          )
          .filter((phone): phone is { number: string } =>
            Boolean(phone?.number)
          );

        const emails = contact.emails
          ?.map((email) => (email.email ? { email: email.email } : undefined))
          .filter((email): email is { email: string } => Boolean(email?.email));

        return {
          id: contact.id,
          name: contact.name || "Unknown",
          phoneNumbers,
          emails,
        };
      });

      setContacts(formattedContacts);
    } catch (err) {
      console.log(err);
      setError("Failed to load contacts");
    } finally {
      setIsLoading(false);
    }
  };

  const filterContacts = () => {
    if (!searchQuery.trim()) {
      setFilteredContacts(contacts);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(query) ||
        contact.phoneNumbers?.some((phone) => phone.number.includes(query)) ||
        contact.emails?.some((email) =>
          email.email.toLowerCase().includes(query)
        )
    );
    setFilteredContacts(filtered);
  };

  const isContactInvited = (contact: Contact) => {
    const phone = contact.phoneNumbers?.[0]?.number;
    if (!phone) return false;

    return invitations?.some(
      (inv) => inv.recipientPhone === phone && inv.status === "pending"
    );
  };

  const handleInvite = async (contact: Contact) => {
    const phone = contact.phoneNumbers?.[0]?.number;
    if (!phone) {
      Alert.alert("Error", "This contact has no phone number");
      return;
    }

    try {
      const invitation = await createInvitation.mutateAsync({
        recipientPhone: phone,
        recipientName: contact.name,
        recipientEmail: contact.emails?.[0]?.email,
      });

      // Send SMS
      const message = `Join my sales team! ${invitation.inviteLink}`;
      await contactsService.sendSMS(phone, message);

      Alert.alert("Success", `Invitation sent to ${contact.name}`);
    } catch {
      Alert.alert("Error", "Failed to send invitation. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: "Contacts" }} />
        <LoadingSpinner message="Loading contacts..." />
      </>
    );
  }

  if (!hasPermission) {
    return (
      <>
        <Stack.Screen options={{ title: "Contacts" }} />
        <EmptyState
          title="Permission Required"
          message="We need access to your contacts to invite team members"
          actionText="Grant Permission"
          onAction={requestPermission}
          icon={<Text style={{ fontSize: 64 }}>📱</Text>}
        />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen options={{ title: "Contacts" }} />
        <ErrorMessage message={error} onRetry={loadContacts} />
      </>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: "Contacts",
          presentation: "modal",
        }}
      />
      <View style={styles.container}>
        <View style={{ marginLeft: 20 }}>
          <TouchableOpacity onPress={() => router.navigate("/team")}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="gray"
          />
        </View>

        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ContactListItem
              contact={item}
              onInvite={handleInvite}
              isInvited={isContactInvited(item)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              title="No Contacts Found"
              message={
                searchQuery
                  ? "No contacts match your search"
                  : "You have no contacts on your device"
              }
              icon={<Text style={{ fontSize: 64 }}>👤</Text>}
            />
          }
          contentContainerStyle={
            filteredContacts.length === 0 ? styles.emptyContainer : undefined
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
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  searchInput: {
    backgroundColor: COLORS.light,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
  },
});
