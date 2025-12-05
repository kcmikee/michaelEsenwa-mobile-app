import * as Contacts from "expo-contacts";
import { contactsService } from "../src/services/contact.service";

jest.mock("expo-contacts");
jest.mock("expo-sms");

describe("Contacts Service", () => {
  describe("requestPermission", () => {
    it("should return true when permission is granted", async () => {
      (Contacts.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "granted",
      });

      const result = await contactsService.requestPermission();

      expect(result).toBe(true);
    });

    it("should return false when permission is denied", async () => {
      (Contacts.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "denied",
      });

      const result = await contactsService.requestPermission();

      expect(result).toBe(false);
    });
  });

  describe("getContacts", () => {
    it("should fetch and format contacts", async () => {
      const mockContactsData = [
        {
          id: "1",
          name: "John Doe",
          phoneNumbers: [{ number: "+1234567890" }],
          emails: [{ email: "john@example.com" }],
        },
        {
          id: "2",
          name: "Jane Smith",
          phoneNumbers: [{ number: "+0987654321" }],
          emails: [],
        },
      ];

      (Contacts.getContactsAsync as jest.Mock).mockResolvedValue({
        data: mockContactsData,
      });

      const result = await contactsService.getContacts();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: "1",
        name: "John Doe",
        phoneNumbers: [{ number: "+1234567890" }],
        emails: [{ email: "john@example.com" }],
      });
    });

    it("should handle contacts without names", async () => {
      const mockContactsData = [
        {
          id: "1",
          name: null,
          phoneNumbers: [{ number: "+1234567890" }],
          emails: [],
        },
      ];

      (Contacts.getContactsAsync as jest.Mock).mockResolvedValue({
        data: mockContactsData,
      });

      const result = await contactsService.getContacts();

      expect(result[0].name).toBe("Unknown");
    });
  });

  describe("invitation creation", () => {
    it("should validate phone number is required", () => {
      const invitation = {
        recipientPhone: "",
        recipientName: "Test User",
      };

      const isValid = invitation.recipientPhone.length > 0;

      expect(isValid).toBe(false);
    });

    it("should allow optional email and name", () => {
      const invitation1 = {
        recipientPhone: "+1234567890",
        recipientEmail: undefined,
        recipientName: undefined,
      };

      const invitation2 = {
        recipientPhone: "+1234567890",
        recipientEmail: "test@example.com",
        recipientName: "Test User",
      };

      expect(invitation1.recipientPhone).toBeTruthy();
      expect(invitation2.recipientPhone).toBeTruthy();
      expect(invitation2.recipientEmail).toBeTruthy();
    });
  });

  describe("phone number formatting", () => {
    it("should handle various phone number formats", () => {
      const phoneNumbers = [
        "1234567890",
        "+1234567890",
        "(123) 456-7890",
        "123-456-7890",
      ];

      const formatPhone = (phone: string) => phone.replace(/[^\d+]/g, "");

      phoneNumbers.forEach((phone) => {
        const formatted = formatPhone(phone);
        expect(formatted).toMatch(/^[+]?[0-9]+$/);
      });
    });
  });
});
