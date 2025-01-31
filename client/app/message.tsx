import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  StyleSheet,
  Image,
} from "react-native";
import { db } from "../firebase/firebase"; // Assuming you already have the firebase setup
import { ref, set, push, onValue, remove } from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import * as DocumentPicker from "expo-document-picker";
import { AntDesign, FontAwesome } from "@expo/vector-icons"; // Using icons compatible with Expo
import axios from "axios";
import ChatMembersModel from "./ChatMembersModal";

const Messege = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [role, setRole] = useState("");
  const [chats, setChats] = useState([]);
  const [chatMembers, setChatMembers] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isChatMembersModalOpen, setIsChatMembersModalOpen] = useState(false);

  useEffect(() => {
    const empId = "12345"; // Replace with AsyncStorage or another method to fetch logged-in user's empId
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
          .filter((chat) => chat.participants.includes(selectedUser))
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

  const handleSendMessage = async () => {
    if (message.trim() || file) {
      if (file && file.size > 5 * 1024 * 1024) {
        Alert.alert("Error", "File size exceeds the limit of 5MB.");
        return;
      }

      const storage = getStorage();
      let uploadedFileURL = null;
      let uploadedFileName = null;

      if (file) {
        const fileRef = storageRef(storage, `uploads/${file.name}`);
        const uploadResult = await uploadBytes(fileRef, file);
        uploadedFileURL = await getDownloadURL(uploadResult.ref);
        uploadedFileName = file.name;
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
        setMessage("");
        setFile(null);
        setFileName("");
      } catch (e) {
        console.error("Error sending message:", e);
      }
    }
  };

  const handleFileChange = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
      if (result.type === "success") {
        setFile(result);
        setFileName(result.name);
      }
    } catch (e) {
      console.error("Error picking file:", e);
    }
  };

  const handleNewChat = () => {
    setIsChatMembersModalOpen(true);
  };

  const handleModalClose = () => {
    setIsChatMembersModalOpen(false);
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
    const confirmDelete = Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this chat?",
      [
        { text: "Cancel" },
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
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.sidebar}>
        <Text style={styles.heading}>Team Group Chat</Text>
        <TouchableOpacity
          onPress={handleNewChat}
          disabled={role === "Employee"}
          style={[
            styles.newChatButton,
            role === "Employee" && styles.disabledButton,
          ]}
        >
          <Text style={styles.buttonText}>New Chat</Text>
        </TouchableOpacity>
        <FlatList
          data={chats}
          keyExtractor={(item) => item.chatId}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.chatItem,
                currentChatId === item.chatId && styles.selectedChat,
              ]}
              onPress={() => setCurrentChatId(item.chatId)}
            >
              <Text>{item.chatId}</Text>
              {role !== "Employee" && (
                <TouchableOpacity onPress={() => handleDelete(item.chatId)}>
                  <AntDesign name="delete" size={20} color="red" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.chatContainer}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.messageId}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageContainer,
                item.sender === selectedUser && styles.senderMessage,
              ]}
            >
              <Text>{item.content}</Text>
              {item.fileURL && (
                <TouchableOpacity onPress={() => Linking.openURL(item.fileURL)}>
                  <Text style={styles.fileLink}>{item.fileName}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
        <View style={styles.inputContainer}>
          <TouchableOpacity
            onPress={handleFileChange}
            style={styles.filePicker}
          >
            <FontAwesome name="upload" size={20} color="gray" />
            <Text>{fileName || "Upload File"}</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder="Type your message..."
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            style={styles.sendButton}
          >
            <FontAwesome name="paper-plane" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {isChatMembersModalOpen && (
        <Modal
          visible={isChatMembersModalOpen}
          onRequestClose={handleModalClose}
        >
          {/* Insert your modal content */}
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flex: 1,
  },
  sidebar: {
    width: "25%",
    padding: 10,
    backgroundColor: "#f4f4f4",
    borderRightWidth: 1,
    borderColor: "#ddd",
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
  },
  newChatButton: {
    backgroundColor: "#f56c00",
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  disabledButton: {
    backgroundColor: "#f4a261",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
  chatItem: {
    padding: 12,
    backgroundColor: "#e4e4e4",
    borderRadius: 6,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  selectedChat: {
    backgroundColor: "#d3d3d3",
  },
  chatContainer: {
    flex: 1,
    padding: 10,
  },
  messageContainer: {
    backgroundColor: "#f1f1f1",
    padding: 10,
    borderRadius: 6,
    marginVertical: 8,
  },
  senderMessage: {
    backgroundColor: "#d1e7ff",
    alignSelf: "flex-end",
  },
  fileLink: {
    color: "blue",
    textDecorationLine: "underline",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  filePicker: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 6,
  },
  sendButton: {
    backgroundColor: "#f56c00",
    padding: 10,
    borderRadius: 6,
    marginLeft: 10,
  },
});

export default Messege;
