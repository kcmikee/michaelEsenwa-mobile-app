import { useState } from "react";
import { contactsService } from "../services/contact.service";
import { Contact } from "../types";

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  const requestPermission = async () => {
    try {
      const granted = await contactsService.requestPermission();
      setHasPermission(granted);
      return granted;
    } catch {
      setError("Failed to request contacts permission");
      return false;
    }
  };

  const loadContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const contactsList = await contactsService.getContacts();
      setContacts(contactsList);
    } catch {
      setError("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const sendInvitation = async (contact: Contact) => {
    try {
      const phone = contact.phoneNumbers?.[0]?.number;
      if (!phone) {
        throw new Error("No phone number available");
      }

      const invitation = await contactsService.sendInvitation(
        phone,
        contact.name,
        contact.emails?.[0]?.email
      );

      // Send SMS
      const message = `Join my sales team! ${invitation.inviteLink}`;
      await contactsService.sendSMS(phone, message);

      return invitation;
    } catch {
      throw new Error("Failed to send invitation");
    }
  };

  return {
    contacts,
    loading,
    error,
    hasPermission,
    requestPermission,
    loadContacts,
    sendInvitation,
  };
};
