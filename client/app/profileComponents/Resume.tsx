import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import axios from "axios";
import { Ionicons, MaterialIcons } from "react-native-vector-icons";

const Resume = () => {
  const empId = "exampleEmpId"; // Placeholder for employee ID
  const [experienceList, setExperienceList] = useState([]);
  const [newExperience, setNewExperience] = useState({
    date_from: "",
    date_to: "",
    company: "",
    role: "",
  });
  const [editExperience, setEditExperience] = useState(null);
  const [isAddingExperience, setIsAddingExperience] = useState(false);

  const [educationList, setEducationList] = useState([]);
  const [newEducation, setNewEducation] = useState({
    date_from: "",
    date_to: "",
    institution: "",
    degree: "",
  });
  const [editEducation, setEditEducation] = useState(null);
  const [isAddingEducation, setIsAddingEducation] = useState(false);

  // Fetch experiences and education
  useEffect(() => {
    const fetchData = async () => {
      try {
        const experienceResponse = await axios.get(
          `http://localhost:4000/employees/getExperience/${empId}`
        );
        setExperienceList(experienceResponse.data);

        const educationResponse = await axios.get(
          `http://localhost:4000/employees/getEducation/${empId}`
        );
        setEducationList(educationResponse.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [empId]);

  const handleAddExperience = async () => {
    try {
      const response = await axios.post(
        `http://localhost:4000/employees/experience/${empId}`,
        newExperience
      );
      setExperienceList((prev) => [
        ...prev,
        { ...newExperience, id: response.data.id },
      ]);
      setNewExperience({ date_from: "", date_to: "", company: "", role: "" });
      setIsAddingExperience(false);
      Alert.alert("Success", "New experience added successfully");
    } catch (err) {
      console.error("Error adding experience:", err);
      Alert.alert("Error", "Error adding experience");
    }
  };

  const handleAddEducation = async () => {
    try {
      const response = await axios.post(
        `http://localhost:4000/employees/education/${empId}`,
        newEducation
      );
      setEducationList((prev) => [
        ...prev,
        { ...newEducation, id: response.data.id },
      ]);
      setNewEducation({
        date_from: "",
        date_to: "",
        institution: "",
        degree: "",
      });
      setIsAddingEducation(false);
      Alert.alert("Success", "New education added successfully");
    } catch (err) {
      console.error("Error adding education:", err);
      Alert.alert("Error", "Error adding education");
    }
  };

  const handleDeleteExperience = async (expId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this experience?"
    );
    if (confirmDelete) {
      try {
        await axios.delete(
          `http://localhost:4000/employees/deleteExperience/${empId}/${expId}`
        );
        setExperienceList((prev) => prev.filter((exp) => exp.id !== expId));
        Alert.alert("Success", "Experience deleted successfully");
      } catch (error) {
        console.error("Error deleting experience:", error);
        Alert.alert("Error", "Failed to delete experience");
      }
    }
  };

  const handleDeleteEducation = async (eduId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this education?"
    );
    if (confirmDelete) {
      try {
        await axios.delete(
          `http://localhost:4000/employees/deleteEducation/${empId}/${eduId}`
        );
        setEducationList((prev) => prev.filter((edu) => edu.id !== eduId));
        Alert.alert("Success", "Education deleted successfully");
      } catch (error) {
        console.error("Error deleting education:", error);
        Alert.alert("Error", "Failed to delete education");
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Experience</Text>
        <FlatList
          data={experienceList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardContent}>
                <Ionicons name="ios-business" size={24} color="#888" />
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{item.company}</Text>
                  <Text>{item.role}</Text>
                  <Text>
                    {new Date(item.date_from).toLocaleDateString()} to{" "}
                    {item.date_to
                      ? new Date(item.date_to).toLocaleDateString()
                      : "Current"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleDeleteExperience(item.id)}
                style={styles.deleteButton}
              >
                <MaterialIcons name="delete" size={24} color="red" />
              </TouchableOpacity>
            </View>
          )}
        />
        <Button
          title="Add Experience"
          onPress={() => setIsAddingExperience(true)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Education</Text>
        <FlatList
          data={educationList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardContent}>
                <Ionicons name="ios-school" size={24} color="#888" />
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{item.institution}</Text>
                  <Text>{item.degree}</Text>
                  <Text>
                    {new Date(item.date_from).toLocaleDateString()} to{" "}
                    {item.date_to
                      ? new Date(item.date_to).toLocaleDateString()
                      : "Current"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleDeleteEducation(item.id)}
                style={styles.deleteButton}
              >
                <MaterialIcons name="delete" size={24} color="red" />
              </TouchableOpacity>
            </View>
          )}
        />
        <Button
          title="Add Education"
          onPress={() => setIsAddingEducation(true)}
        />
      </View>

      {/* Modals for Adding Experience */}
      <Modal visible={isAddingExperience} animationType="slide">
        <View style={styles.modal}>
          <TextInput
            placeholder="Company"
            value={newExperience.company}
            onChangeText={(text) =>
              setNewExperience({ ...newExperience, company: text })
            }
            style={styles.input}
          />
          <TextInput
            placeholder="Role"
            value={newExperience.role}
            onChangeText={(text) =>
              setNewExperience({ ...newExperience, role: text })
            }
            style={styles.input}
          />
          <TextInput
            placeholder="From"
            value={newExperience.date_from}
            onChangeText={(text) =>
              setNewExperience({ ...newExperience, date_from: text })
            }
            style={styles.input}
          />
          <TextInput
            placeholder="To"
            value={newExperience.date_to}
            onChangeText={(text) =>
              setNewExperience({ ...newExperience, date_to: text })
            }
            style={styles.input}
          />
          <Button title="Save" onPress={handleAddExperience} />
          <Button title="Cancel" onPress={() => setIsAddingExperience(false)} />
        </View>
      </Modal>

      {/* Modals for Adding Education */}
      <Modal visible={isAddingEducation} animationType="slide">
        <View style={styles.modal}>
          <TextInput
            placeholder="Institution"
            value={newEducation.institution}
            onChangeText={(text) =>
              setNewEducation({ ...newEducation, institution: text })
            }
            style={styles.input}
          />
          <TextInput
            placeholder="Degree"
            value={newEducation.degree}
            onChangeText={(text) =>
              setNewEducation({ ...newEducation, degree: text })
            }
            style={styles.input}
          />
          <TextInput
            placeholder="From"
            value={newEducation.date_from}
            onChangeText={(text) =>
              setNewEducation({ ...newEducation, date_from: text })
            }
            style={styles.input}
          />
          <TextInput
            placeholder="To"
            value={newEducation.date_to}
            onChangeText={(text) =>
              setNewEducation({ ...newEducation, date_to: text })
            }
            style={styles.input}
          />
          <Button title="Save" onPress={handleAddEducation} />
          <Button title="Cancel" onPress={() => setIsAddingEducation(false)} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginBottom: 10,
  },
  cardContent: {
    flexDirection: "row",
    flex: 1,
  },
  cardText: {
    marginLeft: 10,
  },
  cardTitle: {
    fontWeight: "bold",
  },
  deleteButton: {
    padding: 5,
  },
  modal: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginBottom: 10,
  },
});

export default Resume;
