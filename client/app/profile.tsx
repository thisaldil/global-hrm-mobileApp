import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  Modal,
  Alert,
} from "react-native";
import { FaCamera } from "react-icons/fa"; // Keep icon imports for reference
import * as ImagePicker from "expo-image-picker";
import { AntDesign } from "@expo/vector-icons";
import AccountSecurity from "./profileComponents/AccountSecurity";
import PersonalDetails from "./profileComponents/PersonalDetails";
import WorkInformation from "./profileComponents/WorkInformation";
import Resume from "./profileComponents/Resume";

const Profile = () => {
  const [visibleSection, setVisibleSection] = useState("account");
  const [avatar, setAvatar] = useState(
    "https://global-hrm-mobile-server.vercel.app/images/avatar.png"
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [workDetails, setWorkDetails] = useState({});
  const [personalDetails, setPersonalDetails] = useState({});
  const [empId, setEmpId] = useState(null); // Assuming you fetch empId from AsyncStorage or some other source

  useEffect(() => {
    const fetchData = async () => {
      try {
        const personalResponse = await axios.get(
          `https://global-hrm-mobile-server.vercel.app/employees/getPersonalDetails/${empId}`
        );
        setPersonalDetails(personalResponse.data);
        if (personalResponse.data.profilepic) {
          setAvatar(`${API_BASE_URL}${personalResponse.data.profilepic}`);
        }

        const workResponse = await axios.get(
          `https://global-hrm-mobile-server.vercel.app/employees/getWorkDetails/${empId}`
        );
        setWorkDetails(workResponse.data);
      } catch (err) {
        console.log("Error fetching data:", err);
      }
    };

    if (empId) {
      fetchData();
    }
  }, [empId]);

  const handleFileChange = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled) {
      setAvatar(result.uri);
      // Here you can upload the selected image to your server using FormData and axios
      try {
        const formData = new FormData();
        formData.append("profilePic", {
          uri: result.uri,
          type: "image/jpeg", // Adjust the type based on selected image
          name: "profilePic.jpg",
        });

        await axios.post(
          `https://global-hrm-mobile-server.vercel.app/employees/uploadProfileImage/${empId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        Alert.alert(
          "Profile Picture Updated",
          "Your profile picture has been updated successfully."
        );
      } catch (err) {
        console.log("Error uploading profile image:", err);
      }
    }
  };

  const handleSectionToggle = (section) => {
    setVisibleSection(visibleSection === section ? null : section);
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={() => setIsModalVisible(true)}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: avatar }} style={styles.avatar} />
            </View>
          </TouchableOpacity>

          <Modal
            visible={isModalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setIsModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.closeModalButton}
              />
              <TouchableOpacity
                onPress={handleFileChange}
                style={styles.changeAvatarButton}
              >
                <Text style={styles.changeAvatarText}>Change Avatar</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.nameText}>{personalDetails.name}</Text>
          <Text style={styles.designationText}>{workDetails.designation}</Text>
          <Text style={styles.infoText}>
            Supervisor: {workDetails.supervisor}
          </Text>
          <Text style={styles.infoText}>
            Work Email: {workDetails.workEmail}
          </Text>
          <Text style={styles.infoText}>
            Work Phone: {workDetails.workPhone}
          </Text>
        </View>
      </View>

      <View style={styles.sectionButtons}>
        <TouchableOpacity
          onPress={() => handleSectionToggle("account")}
          style={styles.sectionButton}
        >
          <Text style={styles.buttonText}>Account Security</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleSectionToggle("work")}
          style={styles.sectionButton}
        >
          <Text style={styles.buttonText}>Work Information</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleSectionToggle("resume")}
          style={styles.sectionButton}
        >
          <Text style={styles.buttonText}>Resume</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleSectionToggle("personal")}
          style={styles.sectionButton}
        >
          <Text style={styles.buttonText}>Personal Details</Text>
        </TouchableOpacity>
      </View>

      {visibleSection === "account" && <AccountSecurity />}
      {visibleSection === "personal" && <PersonalDetails />}
      {visibleSection === "work" && <WorkInformation />}
      {visibleSection === "resume" && <Resume />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f8f8",
  },
  profileContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  avatarSection: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 20,
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: "#ff7f50",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  profileInfo: {
    justifyContent: "center",
  },
  nameText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  designationText: {
    fontSize: 16,
    color: "#555",
    marginVertical: 5,
  },
  infoText: {
    fontSize: 14,
    color: "#777",
  },
  sectionButtons: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  sectionButton: {
    padding: 10,
    backgroundColor: "#ff7f50",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  closeModalButton: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    backgroundColor: "red",
    borderRadius: 20,
  },
  changeAvatarButton: {
    padding: 15,
    backgroundColor: "#ff7f50",
    borderRadius: 30,
  },
  changeAvatarText: {
    color: "white",
    fontSize: 18,
  },
});

export default Profile;
