import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import * as DocumentPicker from "expo-document-picker";
import { db } from "../firebase/firebase";
import { ref, set, push, onValue, remove } from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import axios from "axios";

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");
  const [role, setRole] = useState("");
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);

  useEffect(() => {
    const empId = "12345"; // Replace with AsyncStorage or SecureStorage for persistence
    if (empId) {
      axios
        .get(`http://localhost:4000/employees/getEmployee/${empId}`)
        .then(({ data }) => {
          if (data.empId && data.role) {
            setSelectedUser(data.empId);
            setRole(data.role);
          }
        });
    }
  }, []);

  useEffect(() => {
    if (currentChatId) {
      const messagesRef = ref(db, `chats/${currentChatId}/messages/`);
      const unsubscribe = onValue(messagesRef, (snapshot) => {
        setMessages(snapshot.val() ? Object.values(snapshot.val()) : []);
      });
      return () => unsubscribe();
    }
  }, [currentChatId]);

  const handleSendMessage = async () => {
    if (!message.trim() && !file) return;

    let fileURL = null;
    if (file) {
      const storage = getStorage();
      const fileRef = storageRef(storage, `uploads/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      fileURL = await getDownloadURL(fileRef);
    }

    const newMessage = {
      sender: selectedUser,
      role,
      content: message,
      fileURL,
      timestamp: Date.now(),
    };

    try {
      const messagesRef = ref(db, `chats/${currentChatId}/messages/`);
      await set(push(messagesRef), newMessage);
      setMessage("");
      setFile(null);
    } catch (error) {
      Alert.alert("Error", "Failed to send message");
    }
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
      if (result.type === "success") {
        setFile(result);
      }
    } catch (error) {
      Alert.alert("Error", "File selection failed");
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 10 }}>
            <Text>
              {item.sender}: {item.content}
            </Text>
            {item.fileURL && (
              <Text
                style={{ color: "blue" }}
                onPress={() => Linking.openURL(item.fileURL)}
              >
                View File
              </Text>
            )}
          </View>
        )}
      />
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity onPress={handleFilePick}>
          <FontAwesome name="upload" size={24} color="black" />
        </TouchableOpacity>
        <TextInput
          style={{ flex: 1, borderWidth: 1, padding: 8, marginHorizontal: 10 }}
          placeholder="Type a message"
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity onPress={handleSendMessage}>
          <FontAwesome name="paper-plane" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatScreen;
