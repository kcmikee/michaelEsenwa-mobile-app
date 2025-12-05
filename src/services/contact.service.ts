import * as Contacts from "expo-contacts";
import * as SMS from "expo-sms";
import { Contact, Invitation } from "../types";
import api from "./api";

export const contactsService = {
  async requestPermission(): Promise<boolean> {
    const { status } = await Contacts.requestPermissionsAsync();
    return status === "granted";
  },

  async getContacts(): Promise<Contact[]> {
    const { data } = await Contacts.getContactsAsync({
      fields: [
        Contacts.Fields.Name,
        Contacts.Fields.PhoneNumbers,
        Contacts.Fields.Emails,
      ],
    });
    // @ts-ignore
    return data.map((contact) => ({
      id: contact.id,
      name: contact.name || "Unknown",
      phoneNumbers: contact.phoneNumbers,
      emails: contact.emails,
    }));
  },

  async sendInvitation(
    recipientPhone: string,
    recipientName?: string,
    recipientEmail?: string
  ): Promise<Invitation> {
    const response = await api.post("/invitations", {
      recipientPhone,
      recipientName,
      recipientEmail,
    });
    return response.data.data;
  },

  async sendSMS(phoneNumber: string, message: string): Promise<void> {
    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      await SMS.sendSMSAsync(phoneNumber, message);
    }
  },

  async getInvitations(): Promise<Invitation[]> {
    const response = await api.get("/invitations");
    return response.data.data;
  },
};
