import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

const ProfileScreen = () => {
  const [avatar, setAvatar] = useState(null);
  const [personalDetails, setPersonalDetails] = useState({});
  const [workDetails, setWorkDetails] = useState({});
  const empId = "12345"; // Replace with AsyncStorage stored empId
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const personalResponse = await axios.get(
          `http://localhost:4000/employees/getPersonalDetails/${empId}`
        );
        setPersonalDetails(personalResponse.data);
        if (personalResponse.data.profilepic) {
          setAvatar(`http://localhost:4000${personalResponse.data.profilepic}`);
        }

        const workResponse = await axios.get(
          `http://localhost:4000/employees/getWorkDetails/${empId}`
        );
        setWorkDetails(workResponse.data);
      } catch (err) {
        console.log("Error fetching data:", err);
      }
    };

    fetchData();
  }, [empId]);

  const handleImagePick = async () => {
    let permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "You need to allow access to your photos."
      );
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      const file = pickerResult.assets[0];
      setAvatar(file.uri);
      uploadProfileImage(file.uri);
    }
  };

  const uploadProfileImage = async (imageUri) => {
    const formData = new FormData();
    formData.append("profilePic", {
      uri: imageUri,
      type: "image/jpeg",
      name: "profile.jpg",
    });

    try {
      await axios.post(
        `http://localhost:4000/employees/uploadProfileImage/${empId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      Alert.alert("Success", "Profile image updated successfully.");
    } catch (err) {
      console.log("Error uploading profile image:", err);
      Alert.alert("Error", "Failed to upload profile image.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleImagePick}
        style={styles.avatarContainer}
      >
        <Image
        // source={avatar ? { uri: avatar } : require("../assets/avatar.png")}
        // style={styles.avatar}
        />
      </TouchableOpacity>
      <Text style={styles.name}>{personalDetails.name}</Text>
      <Text style={styles.designation}>{workDetails.designation}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("AccountSecurity")}
      >
        <Text style={styles.buttonText}>Account Security</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("WorkInformation")}
      >
        <Text style={styles.buttonText}>Work Information</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("PersonalDetails")}
      >
        <Text style={styles.buttonText}>Personal Details</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Resume")}
      >
        <Text style={styles.buttonText}>Resume</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  avatarContainer: {
    marginTop: 20,
    borderRadius: 100,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#FFA500",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 10,
  },
  designation: {
    fontSize: 18,
    color: "gray",
  },
  button: {
    marginTop: 15,
    backgroundColor: "#FFA500",
    padding: 10,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfileScreen;
