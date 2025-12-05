import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Contacts from "expo-contacts";
import * as SMS from "expo-sms";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- Types ---
type UserRole = "LEADER" | "MEMBER";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface Contact {
  id: string;
  name: string;
  phoneNumbers?: Contacts.PhoneNumber[];
  status: "pending" | "invited" | "accepted";
}

interface Task {
  id: string;
  title: string;
  assignedTo: string;
  isComplete: boolean;
  dueDate: string;
}

// --- Mock Data ---
const MOCK_TEAM = [
  {
    id: "u2",
    name: "Sarah Connor",
    email: "sarah@example.com",
    role: "MEMBER",
    joinDate: "2023-10-15",
  },
  {
    id: "u3",
    name: "Kyle Reese",
    email: "kyle@example.com",
    role: "MEMBER",
    joinDate: "2023-11-02",
  },
];

export default function App() {
  // --- State ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"contacts" | "team" | "tasks">(
    "contacts"
  );

  // Data State
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [team, setTeam] = useState<any[]>(MOCK_TEAM);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", assignedTo: "" });

  // Login Form State
  const [loginEmail, setLoginEmail] = useState("leader@naxum.com");
  const [loginPass, setLoginPass] = useState("password");

  // --- Auth Flow ---
  const handleLogin = () => {
    // In a real app, validate against API
    if (loginEmail && loginPass) {
      setCurrentUser({
        id: "u1",
        name: "John Leader",
        email: loginEmail,
        role: "LEADER",
      });
      setIsAuthenticated(true);
    } else {
      Alert.alert("Error", "Please enter email and password");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setContacts([]);
    setActiveTab("contacts");
  };

  // --- Feature: Contacts ---
  const requestPermissionsAndLoadContacts = async () => {
    setIsLoadingContacts(true);
    try {
      const { status } = await Contacts.requestPermissionsAsync();

      if (status === "granted") {
        setPermissionsGranted(true);
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
        });

        if (data.length > 0) {
          // Transform to our Contact interface
          const formattedContacts: Contact[] = data
            .filter((c) => c.phoneNumbers && c.phoneNumbers.length > 0)
            .map((c) => ({
              id: c.id || Math.random().toString(),
              name: c.name,
              phoneNumbers: c.phoneNumbers,
              status: "pending",
            }));
          setContacts(formattedContacts);
        } else {
          Alert.alert("Notice", "No contacts found on this device.");
        }
      } else {
        Alert.alert(
          "Permission Denied",
          "Permission to access contacts is required to use this feature."
        );
      }
    } catch (error) {
      console.log(error);
      // Fallback for demo if running in non-expo environment or simulator without contacts
      setPermissionsGranted(true);
      setContacts([
        {
          id: "c1",
          name: "Alice Johnson (Mock)",
          status: "pending",
          phoneNumbers: [
            {
              number: "555-0101",
              digits: "5550101",
              label: "mobile",
              countryCode: "us",
              id: "p1",
            },
          ],
        },
        {
          id: "c2",
          name: "Bob Smith (Mock)",
          status: "pending",
          phoneNumbers: [
            {
              number: "555-0102",
              digits: "5550102",
              label: "mobile",
              countryCode: "us",
              id: "p2",
            },
          ],
        },
      ]);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const inviteContact = async (contact: Contact) => {
    const phoneNumber = contact.phoneNumbers?.[0]?.number;

    if (!phoneNumber) {
      Alert.alert("Error", "This contact has no phone number.");
      return;
    }

    const isAvailable = await SMS.isAvailableAsync();

    if (isAvailable) {
      const { result } = await SMS.sendSMSAsync(
        [phoneNumber],
        `Hi ${
          contact.name
        }, join my sales team on Naxum! Here is your invite code: NX-${Math.floor(
          Math.random() * 10000
        )}`
      );

      if (result === "sent" || result === "unknown") {
        updateContactStatus(contact.id, "invited");

        // Simulating acceptance for the demo
        setTimeout(() => {
          updateContactStatus(contact.id, "accepted");
          addToTeam(contact);
        }, 5000);
      }
    } else {
      // Fallback for simulators
      Alert.alert("SMS Simulated", `Invite sent to ${contact.name}`);
      updateContactStatus(contact.id, "invited");
      setTimeout(() => {
        updateContactStatus(contact.id, "accepted");
        addToTeam(contact);
      }, 3000);
    }
  };

  const updateContactStatus = (id: string, status: Contact["status"]) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
  };

  const addToTeam = (contact: Contact) => {
    setTeam((prev) => {
      // Prevent duplicates
      if (prev.find((m) => m.name === contact.name)) return prev;
      return [
        ...prev,
        {
          id: `u-${Date.now()}`,
          name: contact.name,
          email: `${contact.name.split(" ")[0].toLowerCase()}@naxum-demo.com`,
          role: "MEMBER",
          joinDate: new Date().toISOString().split("T")[0],
        },
      ];
    });
  };

  // --- Feature: Tasks ---
  const handleAddTask = () => {
    if (!newTask.title || !newTask.assignedTo) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const task: Task = {
      id: `t-${Date.now()}`,
      title: newTask.title,
      assignedTo: newTask.assignedTo,
      isComplete: false,
      dueDate: new Date().toISOString().split("T")[0],
    };

    setTasks([task, ...tasks]);
    setNewTask({ title: "", assignedTo: "" });
    setShowTaskModal(false);
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, isComplete: !t.isComplete } : t))
    );
  };

  // --- Renderers ---

  const renderLogin = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.loginContainer}
    >
      <View style={styles.loginCard}>
        <View style={styles.logoContainer}>
          <MaterialIcons name="dashboard" size={40} color="white" />
        </View>
        <Text style={styles.loginTitle}>Welcome Back</Text>
        <Text style={styles.loginSubtitle}>Manage your direct sales team</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="leader@naxum.com"
            value={loginEmail}
            onChangeText={setLoginEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={loginPass}
            onChangeText={setLoginPass}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
          <Text style={styles.primaryButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.headerTitle}>
            {activeTab === "contacts"
              ? "Contacts"
              : activeTab === "team"
              ? "My Team"
              : "Assignments"}
          </Text>
          <Text style={styles.headerSubtitle}>
            {currentUser?.name} • {currentUser?.role}
          </Text>
        </View>
        <TouchableOpacity style={styles.profileIcon} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {activeTab !== "tasks" && (
        <View style={styles.searchContainer}>
          <MaterialIcons
            name="search"
            size={20}
            color="#9CA3AF"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
      )}
    </View>
  );

  const renderContactItem = ({ item }: { item: Contact }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSub}>
            {item.phoneNumbers?.[0]?.number || "No number"}
          </Text>
        </View>

        {item.status === "pending" && (
          <TouchableOpacity
            style={styles.outlineButton}
            onPress={() => inviteContact(item)}
          >
            <Text style={styles.outlineButtonText}>Invite</Text>
          </TouchableOpacity>
        )}
        {item.status === "invited" && (
          <View style={[styles.badge, styles.badgeOrange]}>
            <Text style={styles.badgeTextOrange}>Invited</Text>
          </View>
        )}
        {item.status === "accepted" && (
          <View style={[styles.badge, styles.badgeGreen]}>
            <MaterialIcons name="check-circle" size={12} color="#16A34A" />
            <Text style={styles.badgeTextGreen}> Joined</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderTeamItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={[styles.avatar, { backgroundColor: "#E0E7FF" }]}>
          <Text style={[styles.avatarText, { color: "#4F46E5" }]}>
            {item.name.charAt(0)}
          </Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSub}>{item.email}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.miniLabel}>Joined</Text>
          <Text style={styles.miniValue}>{item.joinDate}</Text>
        </View>
      </View>
    </View>
  );

  const renderTaskItem = ({ item }: { item: Task }) => {
    const assignedMember = team.find((u) => u.id === item.assignedTo);
    return (
      <View style={[styles.card, item.isComplete && styles.cardDimmed]}>
        <View style={styles.cardRow}>
          <TouchableOpacity onPress={() => toggleTask(item.id)}>
            {item.isComplete ? (
              <MaterialIcons name="check-circle" size={24} color="#22C55E" />
            ) : (
              <View style={styles.circleOutline} />
            )}
          </TouchableOpacity>
          <View style={styles.cardContent}>
            <Text
              style={[
                styles.cardTitle,
                item.isComplete && styles.textStrikethrough,
              ]}
            >
              {item.title}
            </Text>
            <View style={styles.taskMeta}>
              <View style={styles.tinyAvatar}>
                <Text style={styles.tinyAvatarText}>
                  {assignedMember?.name.charAt(0) || "?"}
                </Text>
              </View>
              <Text style={styles.cardSub}>
                Assigned to {assignedMember?.name || "Unknown"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {!isAuthenticated ? (
        renderLogin()
      ) : (
        <>
          {renderHeader()}

          <View style={styles.content}>
            {activeTab === "contacts" && (
              <>
                {!permissionsGranted ? (
                  <View style={styles.emptyState}>
                    <View style={styles.emptyIcon}>
                      <MaterialIcons
                        name="smartphone"
                        size={40}
                        color="#2563EB"
                      />
                    </View>
                    <Text style={styles.emptyTitle}>Import Contacts</Text>
                    <Text style={styles.emptyDesc}>
                      Access your phone contacts to build your sales team.
                    </Text>
                    {isLoadingContacts ? (
                      <ActivityIndicator size="large" color="#2563EB" />
                    ) : (
                      <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={requestPermissionsAndLoadContacts}
                      >
                        <Text style={styles.primaryButtonText}>
                          Allow Access
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <FlatList
                    data={contacts.filter((c) =>
                      c.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )}
                    keyExtractor={(item) => item.id}
                    renderItem={renderContactItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                      <Text style={styles.emptyListText}>
                        No contacts found
                      </Text>
                    }
                  />
                )}
              </>
            )}

            {activeTab === "team" && (
              <View style={{ flex: 1 }}>
                <View style={styles.statsRow}>
                  <View style={styles.statCardPrimary}>
                    <Text style={styles.statLabelLight}>Total Members</Text>
                    <Text style={styles.statValueLight}>{team.length}</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>New This Month</Text>
                    <Text style={styles.statValue}>2</Text>
                  </View>
                </View>
                <FlatList
                  data={team.filter((t) =>
                    t.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )}
                  keyExtractor={(item) => item.id}
                  renderItem={renderTeamItem}
                  contentContainerStyle={styles.listContent}
                />
              </View>
            )}

            {activeTab === "tasks" && (
              <>
                <View style={styles.taskHeader}>
                  <Text style={styles.sectionTitle}>Goals & Tasks</Text>
                  <TouchableOpacity
                    style={styles.fabMini}
                    onPress={() => setShowTaskModal(true)}
                  >
                    <MaterialIcons name="add" size={20} color="white" />
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={tasks}
                  keyExtractor={(item) => item.id}
                  renderItem={renderTaskItem}
                  contentContainerStyle={styles.listContent}
                  ListEmptyComponent={
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyDesc}>
                        No tasks assigned yet.
                      </Text>
                      <TouchableOpacity onPress={() => setShowTaskModal(true)}>
                        <Text style={styles.linkText}>Create a goal</Text>
                      </TouchableOpacity>
                    </View>
                  }
                />
              </>
            )}
          </View>

          {/* Bottom Tab Bar */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setActiveTab("contacts")}
            >
              <MaterialIcons
                name="people"
                size={24}
                color={activeTab === "contacts" ? "#2563EB" : "#9CA3AF"}
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === "contacts" && styles.tabLabelActive,
                ]}
              >
                Contacts
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setActiveTab("team")}
            >
              <MaterialIcons
                name="person"
                size={24}
                color={activeTab === "team" ? "#2563EB" : "#9CA3AF"}
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === "team" && styles.tabLabelActive,
                ]}
              >
                Team
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setActiveTab("tasks")}
            >
              <MaterialIcons
                name="check-circle"
                size={24}
                color={activeTab === "tasks" ? "#2563EB" : "#9CA3AF"}
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === "tasks" && styles.tabLabelActive,
                ]}
              >
                Tasks
              </Text>
            </TouchableOpacity>
          </View>

          {/* Task Modal */}
          <Modal
            visible={showTaskModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowTaskModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>New Assignment</Text>
                  <TouchableOpacity onPress={() => setShowTaskModal(false)}>
                    <MaterialIcons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Goal / Task Title</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Sell 5 Units"
                    value={newTask.title}
                    onChangeText={(text) =>
                      setNewTask({ ...newTask, title: text })
                    }
                  />
                </View>

                <Text style={styles.label}>Assign To</Text>
                <View style={styles.teamListSelect}>
                  <FlatList
                    data={team}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.memberSelect,
                          newTask.assignedTo === item.id &&
                            styles.memberSelectActive,
                        ]}
                        onPress={() =>
                          setNewTask({ ...newTask, assignedTo: item.id })
                        }
                      >
                        <View
                          style={[
                            styles.tinyAvatar,
                            {
                              backgroundColor:
                                newTask.assignedTo === item.id
                                  ? "#2563EB"
                                  : "#E5E7EB",
                            },
                          ]}
                        >
                          <Text
                            style={{
                              color:
                                newTask.assignedTo === item.id
                                  ? "white"
                                  : "#374151",
                              fontWeight: "bold",
                            }}
                          >
                            {item.name.charAt(0)}
                          </Text>
                        </View>
                        <Text style={styles.memberSelectName}>
                          {item.name.split(" ")[0]}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.primaryButton, { marginTop: 20 }]}
                  onPress={handleAddTask}
                >
                  <Text style={styles.primaryButtonText}>Assign Goal</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  // Login Styles
  loginContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#EFF6FF",
  },
  loginCard: {
    backgroundColor: "white",
    padding: 32,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  logoContainer: {
    alignSelf: "center",
    width: 64,
    height: 64,
    backgroundColor: "#2563EB",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
  },
  // Shared Input Styles
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2937",
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingLeft: 40,
    paddingRight: 16,
    fontSize: 15,
  },
  searchContainer: {
    marginTop: 16,
    position: "relative",
    justifyContent: "center",
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    zIndex: 1,
  },
  // Buttons
  primaryButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  outlineButton: {
    borderWidth: 1.5,
    borderColor: "#2563EB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  outlineButtonText: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "600",
  },
  // Header
  header: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  profileIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  // Content & Lists
  content: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Space for tab bar
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardDimmed: {
    opacity: 0.6,
    backgroundColor: "#F9FAFB",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  cardSub: {
    fontSize: 13,
    color: "#6B7280",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4B5563",
  },
  tinyAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E0E7FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  tinyAvatarText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#4F46E5",
  },
  // Task specific
  circleOutline: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
  },
  textStrikethrough: {
    textDecorationLine: "line-through",
    color: "#9CA3AF",
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  fabMini: {
    backgroundColor: "#2563EB",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  // Status Badges
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  badgeOrange: {
    backgroundColor: "#FFF7ED",
  },
  badgeTextOrange: {
    color: "#F97316",
    fontSize: 12,
    fontWeight: "600",
  },
  badgeGreen: {
    backgroundColor: "#F0FDF4",
  },
  badgeTextGreen: {
    color: "#16A34A",
    fontSize: 12,
    fontWeight: "600",
  },
  // Stats
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  statCardPrimary: {
    flex: 1,
    backgroundColor: "#2563EB",
    borderRadius: 16,
    padding: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statLabelLight: { color: "#BFDBFE", fontSize: 12, marginBottom: 4 },
  statValueLight: { color: "white", fontSize: 24, fontWeight: "bold" },
  statLabel: { color: "#6B7280", fontSize: 12, marginBottom: 4 },
  statValue: { color: "#1F2937", fontSize: 24, fontWeight: "bold" },

  // Empty States
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    marginTop: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    backgroundColor: "#EFF6FF",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  emptyDesc: {
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyListText: {
    textAlign: "center",
    marginTop: 40,
    color: "#9CA3AF",
  },
  linkText: {
    color: "#2563EB",
    fontWeight: "600",
  },
  miniLabel: { fontSize: 11, color: "#9CA3AF" },
  miniValue: { fontSize: 12, color: "#4B5563" },

  // Tab Bar
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  tabItem: {
    alignItems: "center",
    gap: 4,
    width: 60,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  tabLabelActive: {
    color: "#2563EB",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  teamListSelect: {
    height: 80,
    marginTop: 8,
  },
  memberSelect: {
    marginRight: 16,
    alignItems: "center",
    width: 50,
  },
  memberSelectActive: {
    opacity: 1,
  },
  memberSelectName: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
  },
});
