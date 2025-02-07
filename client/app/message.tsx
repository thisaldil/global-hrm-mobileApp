import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Image,
  Alert,
} from "react-native";
import { BlurView } from "expo-blur";
import { TouchableWithoutFeedback } from "react-native";
import { Feather, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { db } from "../firebase/firebase";
import { ref, set, push, onValue, remove } from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import ChatMembersModal from "./ChatMembersModal";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Linking } from "react-native";
import ProfilePicture from "@/components/profilepicture";

const Message = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");
  const [role, setRole] = useState("");
  const [sidebarWidth] = useState(new Animated.Value(70)); // Initial width for sidebar
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [chatMembers, setChatMembers] = useState([]);
  const [isChatMembersModalOpen, setIsChatMembersModalOpen] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isMainChatVisible, setIsMainChatVisible] = useState(true);
  const [longPressedChatId, setLongPressedChatId] = useState(null); // Track the long-pressed chat
  const [isFileSelected, setIsFileSelected] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const getEmployeeData = async () => {
      const empId = await AsyncStorage.getItem("empId");
      if (empId) {
        fetch(
          `https://global-hrm-mobile-server.vercel.app/employees/getEmployee/${empId}`
        )
          .then((response) => response.json())
          .then((data) => {
            if (data.empId && data.role) {
              setSelectedUser(data.empId);
              setRole(data.role);
            }
          });
      }
    };

    getEmployeeData();
  }, []);

  useEffect(() => {
    const chatsRef = ref(db, "chats/");
    const unsubscribe = onValue(chatsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedChats = Object.entries(data)
          .map(([key, value]) => ({
            chatId: key,
            timestamp: value.timestamp || Date.now(),
            participants: value.members || [],
          }))
          .filter((chat) => {
            return chat.participants.includes(selectedUser);
          })
          .sort((a, b) => b.timestamp - a.timestamp);
        setChats(loadedChats);
        if (loadedChats.length > 0 && !currentChatId) {
          setCurrentChatId(loadedChats[0].chatId);
        }
      }
    });
    return () => unsubscribe();
  }, [currentChatId, selectedUser]);

  useEffect(() => {
    if (currentChatId) {
      const messagesRef = ref(db, `chats/${currentChatId}/messages/`);
      const unsubscribe = onValue(messagesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const loadedMessages = Object.values(data);
          setMessages(loadedMessages);
        } else {
          setMessages([]);
        }
      });

      const fetchChatMembers = async () => {
        try {
          const response = await axios.get(
            `https://global-hrm-mobile-server.vercel.app/admin/getAllMembers/${currentChatId}`
          );
          setChatMembers(response.data);
        } catch (error) {
          console.error("Error fetching chat members:", error);
        }
      };

      fetchChatMembers();
      return () => unsubscribe();
    } else {
      setMessages([]);
    }
  }, [currentChatId]);

  const handleNewChat = () => {
    setIsMainChatVisible(false); // Hide the main chat area
    setIsChatMembersModalOpen(true); // Show the chat members modal
  };

  const handleLongPress = (chatId) => {
    setLongPressedChatId(chatId); // Set the chatId of the long-pressed chat
  };

  const handleSendMessage = async () => {
    if (message.trim() || file) {
      if (file && file.size > 5 * 1024 * 1024) {
        Alert.alert("File too large", "Please select a file smaller than 5MB.");
        return;
      }

      setIsUploading(true); // Start loading state

      const storage = getStorage();
      let uploadedFileURL = null;
      let uploadedFileName = null;

      if (file) {
        try {
          const fileRef = storageRef(storage, `uploads/${fileName}`);
          const uploadResult = await uploadBytes(fileRef, file); // Upload Blob
          uploadedFileURL = await getDownloadURL(uploadResult.ref);
          uploadedFileName = fileName;
        } catch (error) {
          console.error("Error uploading file:", error);
          Alert.alert("Upload Failed", "Error uploading file.");
          setIsUploading(false);
          return;
        }
      }

      const newMessage = {
        sender: selectedUser,
        role,
        content: message,
        fileURL: uploadedFileURL,
        fileName: uploadedFileName,
        timestamp: Date.now(),
      };

      try {
        const messagesRef = ref(db, `chats/${currentChatId}/messages/`);
        const newMessageRef = push(messagesRef);
        await set(newMessageRef, newMessage);

        setMessages([
          ...messages,
          { ...newMessage, messageId: newMessageRef.key },
        ]);

        // Reset input states
        setMessage("");
        setFile(null);
        setFileName("");
        setIsFileSelected(false);
      } catch (e) {
        console.error("Error sending message:", e);
        Alert.alert("Error", "Failed to send message.");
      } finally {
        setIsUploading(false); // Stop loading state
      }
    }
  };

  const handleFileChange = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const selectedFile = result.assets[0];
      const uri = selectedFile.uri;

      try {
        const response = await fetch(uri);
        const blob = await response.blob();

        setFile(blob);
        setFileName(selectedFile.fileName || uri.split("/").pop()); // Extract filename
        setIsFileSelected(true); // Indicate a file has been selected
      } catch (error) {
        console.error("Error converting file to Blob:", error);
        Alert.alert("File Error", "Failed to process the selected file.");
      }
    }
  };

  const handleModalClose = () => {
    setIsChatMembersModalOpen(false);
    setIsMainChatVisible(true);
  };

  const openFile = (fileUri) => {
    Linking.openURL(fileUri).catch((err) =>
      console.error("Failed to open file:", err)
    );
  };

  const handleCreateChatWithMembers = async (members) => {
    const newChatRef = push(ref(db, "chats/"));
    const newChat = {
      participants: [selectedUser, ...members],
      timestamp: Date.now(),
    };
    await set(newChatRef, newChat);
    setCurrentChatId(newChatRef.key);
    setMessages([]);
    setIsChatMembersModalOpen(false);
  };

  const handleDelete = async (chatId) => {
    Alert.alert(
      "Delete Chat",
      "Are you sure you want to delete this chat?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const chatRef = ref(db, `chats/${chatId}`);
              await remove(chatRef);
              await axios.delete(
                `https://global-hrm-mobile-server.vercel.app/admin/deleteChat/${chatId}`
              );
            } catch (error) {
              console.error("Error deleting chat: ", error);
              Alert.alert("Error", "Error deleting chat");
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const toggleSidebar = () => {
    Animated.timing(sidebarWidth, {
      toValue: isSidebarExpanded ? 70 : 180,
      duration: 100,
      useNativeDriver: false,
    }).start();
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, { width: sidebarWidth }]}>
        <LinearGradient
          colors={["#FF8008", "#FFC837"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sidebarGradient}
        >
          {" "}
          <TouchableOpacity style={styles.toggleButton} onPress={toggleSidebar}>
            <Feather
              name={isSidebarExpanded ? "chevron-left" : "menu"}
              size={22}
              color="white"
            />
          </TouchableOpacity>
          {isSidebarExpanded && (
            <View style={styles.container}>
              <View style={styles.sidebar}>
                <Text style={styles.sidebarTitle}>Chats</Text>
                <TouchableOpacity
                  style={[
                    styles.newChatButton,
                    role === "Employee" && styles.disabledButton,
                  ]}
                  onPress={handleNewChat}
                  disabled={role === "Employee"}
                >
                  <Text style={styles.newChatButtonText}>New Chat</Text>
                </TouchableOpacity>
                <ScrollView style={styles.chatList}>
                  {chats.map((chat) => (
                    <TouchableOpacity
                      key={chat.chatId}
                      style={[
                        styles.chatItem,
                        currentChatId === chat.chatId &&
                          styles.selectedChatItem,
                      ]}
                      onPress={() => setCurrentChatId(chat.chatId)}
                      onLongPress={() => handleLongPress(chat.chatId)} // Trigger on long press
                    >
                      <Text style={styles.chatItemText}>{chat.chatId}</Text>
                      {longPressedChatId === chat.chatId && ( // Show delete button only for long-pressed chat
                        <TouchableOpacity
                          onPress={() => handleDelete(chat.chatId)}
                        >
                          <Feather name="trash" size={20} color="#FF6347" />
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          )}
        </LinearGradient>
      </Animated.View>

      {/* Main Chat Area */}
      {isMainChatVisible && (
        <View style={styles.mainContent}>
          {/* Apply Blur Effect and Disable Interaction when Sidebar is Expanded */}
          {isSidebarExpanded && (
            <TouchableWithoutFeedback onPress={toggleSidebar}>
              <BlurView intensity={15} style={styles.blurOverlay} tint="dark" />
            </TouchableWithoutFeedback>
          )}
          {/* Display the chatId when a chat is selected */}
          {currentChatId && (
            <View style={styles.chatIdContainer}>
              <Text style={styles.chatIdText}> {currentChatId}</Text>
            </View>
          )}
          <ScrollView style={styles.messagesContainer}>
            <View style={styles.chatMembersDropdown}>
              {/* Dropdown Toggle */}
              <TouchableOpacity
                onPress={() => setDropdownOpen(!isDropdownOpen)}
              >
                <Text style={styles.dropdownLabel}>
                  Members {isDropdownOpen ? "▲" : "▼"}
                </Text>
              </TouchableOpacity>

              {/* Dropdown Content */}
              {isDropdownOpen && (
                <ScrollView>
                  {[...new Set(chatMembers)]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(({ empId, name }) => (
                      <Text key={empId} style={styles.dropdownItem}>
                        {name} ({empId})
                      </Text>
                    ))}
                </ScrollView>
              )}
            </View>
            {messages.map((msg, index) => {
              // Find sender's name from chatMembers based on empId
              const senderData = chatMembers.find(
                (member) => member.empId === msg.sender
              );
              const senderName = senderData
                ? senderData.name.split(" ")[0]
                : "Unknown"; // Get first name
              const senderProfilePic = senderData
                ? senderData.profilePicture
                : null;

              return (
                <View
                  key={index}
                  style={[
                    styles.messageContainer,
                    msg.sender === selectedUser
                      ? styles.messageContainerRight
                      : styles.messageContainerLeft,
                  ]}
                >
                  {/* Message Header */}
                  <View style={styles.messageHeader}>
                    {/* Sender Name */}
                    <Text style={styles.messageRole}>{senderName}</Text>

                    {/* Timestamp */}
                    <Text style={styles.messageTime}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </Text>
                  </View>

                  {/* ✅ Message Content Added Here */}
                  <View style={styles.messageBody}>
                    <Text style={styles.messageText}>{msg.content}</Text>
                  </View>
                  {msg.fileURL && (
                    <TouchableOpacity
                      style={styles.fileLink}
                      onPress={() => Linking.openURL(msg.fileURL)}
                    >
                      <MaterialIcons
                        name="insert-drive-file"
                        size={20}
                        color="#007AFF"
                      />
                      <Text style={styles.fileLinkText}>{msg.fileName}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </ScrollView>
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.fileUploadButton}
              onPress={handleFileChange}
            >
              {isFileSelected ? (
                <Feather name="check-circle" size={24} color="green" />
              ) : (
                <Feather name="upload" size={24} color="black" />
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.textInput}
              placeholder="Type your message..."
              value={message}
              onChangeText={setMessage}
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
            >
              <Feather name="send" size={24} color="white" />
              <Text style={styles.sendButtonText}></Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {isChatMembersModalOpen && (
        <ChatMembersModal
          onClose={handleModalClose}
          onSave={handleCreateChatWithMembers}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    padding: 2,
    justifyContent: "center",
    width: 150,
    zIndex: 2, // Ensure sidebar stays above the blur
  },
  sidebarGradient: {
    flex: 1, // Ensure it fills the entire sidebar
    padding: 6, // Add padding inside the gradient
    justifyContent: "flex-start",
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1, // Ensures blur is above everything except sidebar
  },

  toggleButton: {
    alignSelf: "flex-start",
    padding: 20,
  },
  sidebarTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  newChatButton: {
    backgroundColor: "#3498db",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: "#95a5a6",
  },
  newChatButtonText: {
    color: "white",
    fontSize: 16,
  },
  chatList: {
    flex: 1,
    marginTop: 10,
  },
  chatItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 6,
    backgroundColor: "#34495e",
    borderRadius: 5,
    marginBottom: 5,
  },
  selectedChatItem: {
    backgroundColor: "#02c3cc",
  },
  chatItemText: {
    color: "white",
    fontSize: 16,
  },
  mainContent: {
    flex: 1,
    padding: 6,
    backgroundColor: "white",
  },
  messagesContainer: {
    flex: 1,
  },
  chatMembersDropdown: {
    padding: 10,
    backgroundColor: "#ecf0f1",
    borderRadius: 5,
    marginBottom: 10,
  },
  dropdownLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  dropdownItem: {
    fontSize: 14,
    paddingVertical: 5,
  },
  messageContainer: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    maxWidth: "80%",
  },
  messageContainerRight: {
    alignSelf: "flex-end",
    backgroundColor: "#d1e7dd",
  },
  messageContainerLeft: {
    alignSelf: "flex-start",
    backgroundColor: "#f8d7da",
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  messageRole: {
    fontWeight: "bold",
    marginRight: 5,
  },
  messageTime: {
    fontSize: 12,
    color: "gray",
  },
  messageContent: {
    flexDirection: "column",
  },
  messageText: {
    fontSize: 16,
  },
  fileLink: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  fileLinkText: {
    color: "#007AFF",
    marginLeft: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  fileUploadButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#ecf0f1",
    borderRadius: 5,
    marginRight: 10,
  },
  fileUploadText: {
    marginLeft: 5,
  },
  textInput: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#02c3cc",
    padding: 6,
    borderRadius: 5,
  },
  sendButtonText: {
    color: "white",
    fontSize: 6,
  },
  chatIdContainer: {
    padding: 10,
    backgroundColor: "#f1f1f1",
    borderRadius: 5,
    marginBottom: 10,
    alignItems: "center",
  },
  chatIdText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});
export default Message;
