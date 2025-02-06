import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { AntDesign } from "@expo/vector-icons";
import { getDatabase, ref, update } from "firebase/database";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../firebase/firebase";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const ChatMembersModal = ({ onClose }) => {
  const [employeeList, setEmployeeList] = useState([]);
  const [filteredEmployeeList, setFilteredEmployeeList] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [designationFilter, setDesignationFilter] = useState("");
  const [chatName, setChatName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [empId, setEmpId] = useState("");

  // Fetch empId from AsyncStorage
  useEffect(() => {
    const fetchEmpId = async () => {
      const storedEmpId = await AsyncStorage.getItem("empId");
      setEmpId(storedEmpId || "");
    };
    fetchEmpId();
  }, []);

  // Fetch employee data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://global-hrm-mobile-server.vercel.app/admin/getAllEmployee"
        );
        setEmployeeList(response.data);
        setFilteredEmployeeList(response.data);
      } catch (error) {
        console.error("Error fetching employee details:", error);
      }
    };
    fetchData();
  }, []);

  // Filter employee list when department or designation changes
  useEffect(() => {
    const filteredList = employeeList.filter((employee) => {
      const matchesDepartment = departmentFilter
        ? employee.department.toLowerCase() === departmentFilter.toLowerCase()
        : true;
      const matchesDesignation = designationFilter
        ? employee.designation.toLowerCase() === designationFilter.toLowerCase()
        : true;
      return matchesDepartment && matchesDesignation;
    });
    setFilteredEmployeeList(filteredList);
  }, [departmentFilter, designationFilter, employeeList]);

  // Toggle member selection
  const handleToggleMember = (employeeId) => {
    setSelectedMembers((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  // Save chat group
  const handleSave = async () => {
    if (!chatName) {
      Alert.alert("Error", "Please enter a chat name.");
      return;
    }

    try {
      const chatId = `${chatName}`;
      const chatRef = ref(database, "chats/" + chatId);
      const timestamp = Date.now();
      const membersWithEmpId = [...new Set([empId, ...selectedMembers])];

      await update(chatRef, {
        members: membersWithEmpId,
        timestamp: timestamp,
      });

      const newMember = { members: membersWithEmpId, chatId };
      await axios.post(
        "https://global-hrm-mobile-server.vercel.app/admin/addMember",
        newMember
      );

      Alert.alert("Success", "Chat members added successfully!");
      onClose();
    } catch (error) {
      console.error("Error adding members to chat:", error);
      Alert.alert("Error", "Failed to add chat members.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Chat Members</Text>
      <TextInput
        style={styles.input}
        placeholder="Chat Name"
        value={chatName}
        onChangeText={setChatName}
      />
      <Picker
        selectedValue={departmentFilter}
        onValueChange={setDepartmentFilter}
        style={styles.picker}
      >
        <Picker.Item label="All Departments" value="" />
        {[...new Set(employeeList.map((emp) => emp.department))].map((dept) => (
          <Picker.Item key={dept} label={dept} value={dept} />
        ))}
      </Picker>
      <Picker
        selectedValue={designationFilter}
        onValueChange={setDesignationFilter}
        style={styles.picker}
      >
        <Picker.Item label="All Designations" value="" />
        {[...new Set(employeeList.map((emp) => emp.designation))].map((des) => (
          <Picker.Item key={des} label={des} value={des} />
        ))}
      </Picker>
      <FlatList
        data={filteredEmployeeList}
        keyExtractor={(item) => item.empId}
        renderItem={({ item }) => (
          <View style={styles.employeeRow}>
            <Text>
              {item.name} - {item.designation}
            </Text>
            <TouchableOpacity onPress={() => handleToggleMember(item.empId)}>
              <AntDesign
                name={
                  selectedMembers.includes(item.empId)
                    ? "minuscircle"
                    : "pluscircle"
                }
                size={24}
                color={selectedMembers.includes(item.empId) ? "red" : "green"}
              />
            </TouchableOpacity>
          </View>
        )}
      />
      <View style={styles.buttonRow}>
        <Button title="Save" onPress={handleSave} color="#FF7F32" />
        <Button title="Cancel" onPress={onClose} color="gray" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  picker: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 10,
  },
  employeeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
});

export default ChatMembersModal;
