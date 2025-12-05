import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types";
import api from "./api";

export const authService = {
  async login(
    email: string,
    password: string
  ): Promise<{ user: User; token: string }> {
    const response = await api.post("/auth/login", { email, password });
    const { user, token } = response.data.data;

    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("user", JSON.stringify(user));

    return { user, token };
  },

  async register(
    email: string,
    password: string,
    name: string,
    phone?: string,
    inviteCode?: string
  ): Promise<{ user: User; token: string }> {
    const response = await api.post("/auth/register", {
      email,
      password,
      name,
      phone,
      inviteCode,
    });
    const { user, token } = response.data.data;

    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("user", JSON.stringify(user));

    return { user, token };
  },

  async getMe(): Promise<User> {
    const response = await api.get("/auth/me");
    return response.data.data;
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
  },

  async getStoredUser(): Promise<User | null> {
    const userJson = await AsyncStorage.getItem("user");
    return userJson ? JSON.parse(userJson) : null;
  },

  async getStoredToken(): Promise<string | null> {
    return await AsyncStorage.getItem("token");
  },
};
