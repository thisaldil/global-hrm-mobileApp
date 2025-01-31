import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  StyleSheet,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Resume = () => {
  const [empId, setEmpId] = useState(null);
  const [experienceList, setExperienceList] = useState([]);
  const [educationList, setEducationList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isExperience, setIsExperience] = useState(true);
  const [currentItem, setCurrentItem] = useState(null);

  useEffect(() => {
    const fetchEmpId = async () => {
      const storedEmpId = await AsyncStorage.getItem("empId");
      setEmpId(storedEmpId);
      fetchData(storedEmpId);
    };
    fetchEmpId();
  }, []);

  const fetchData = async (id) => {
    try {
      const experienceResponse = await axios.get(
        `https://global-hrm-mobile-server.vercel.app/employees/getExperience/${id}`
      );
      setExperienceList(experienceResponse.data);
      const educationResponse = await axios.get(
        `https://global-hrm-mobile-server.vercel.app/employees/getEducation/${id}`
      );
      setEducationList(educationResponse.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const handleDelete = async (id, type) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await axios.delete(
                `https://global-hrm-mobile-server.vercel.app/employees/delete${type}/${empId}/${id}`
              );
              if (type === "Experience") {
                setExperienceList((prev) =>
                  prev.filter((item) => item.id !== id)
                );
              } else {
                setEducationList((prev) =>
                  prev.filter((item) => item.id !== id)
                );
              }
            } catch (error) {
              console.error(`Error deleting ${type.toLowerCase()}:`, error);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Experience</Text>
      <FlatList
        data={experienceList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              setIsExperience(true);
              setCurrentItem(item);
              setModalVisible(true);
            }}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>{item.company}</Text>
            <Text>{item.role}</Text>
            <Text>
              {item.date_from} to {item.date_to || "Current"}
            </Text>
            <TouchableOpacity
              onPress={() => handleDelete(item.id, "Experience")}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.header}>Education</Text>
      <FlatList
        data={educationList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              setIsExperience(false);
              setCurrentItem(item);
              setModalVisible(true);
            }}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>{item.institution}</Text>
            <Text>{item.degree}</Text>
            <Text>
              {item.date_from} to {item.date_to || "Current"}
            </Text>
            <TouchableOpacity
              onPress={() => handleDelete(item.id, "Education")}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F8F9FA" },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardTitle: { fontSize: 16, fontWeight: "bold" },
  deleteButton: {
    marginTop: 5,
    backgroundColor: "red",
    padding: 5,
    borderRadius: 5,
    alignItems: "center",
  },
  deleteText: { color: "white" },
});

export default Resume;
