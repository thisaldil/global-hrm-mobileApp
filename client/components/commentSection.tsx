import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { t } from "react-native-tailwindcss";

interface CommentSectionProps {
  postId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [userName, setUserName] = useState("");
  const [empId, setEmpId] = useState<string | null>(null);
  const [showAllComments, setShowAllComments] = useState(false);

  // Fetch employee data and comments when the component loads
  useEffect(() => {
    const fetchEmpId = async () => {
      const storedEmpId = await AsyncStorage.getItem("empId");
      setEmpId(storedEmpId);
    };

    const fetchUserName = async (empId: string) => {
      try {
        const response = await axios.get(
          `https://global-hrm-mobile-server.vercel.app/employees/getPersonalDetails/${empId}`
        );
        setUserName(response.data.name || "Unknown User");
      } catch (error) {
        console.error("Error fetching employee name:", error);
      }
    };

    const fetchComments = async () => {
      try {
        const response = await axios.get(
          `https://global-hrm-mobile-server.vercel.app/news/posts/${postId}/comments`
        );
        setComments(response.data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    if (empId) fetchUserName(empId);
    fetchComments();
    fetchEmpId();
  }, [postId, empId]);

  // Add a new comment to the post
  const addComment = async () => {
    if (!empId || !userName || !comment.trim()) {
      console.error("Missing required fields for adding comment");
      return;
    }

    try {
      await axios.post(`https://global-hrm-mobile-server.vercel.app/news/posts/${postId}/comment`, {
        user: userName,
        comment,
      });
      setComment(""); // Clear the input field
      setShowAllComments(true); // Always show all comments after posting
    //   fetchComments(); // Refresh comments
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <View style={[t.p2]}>
      {/* Show only the latest comment if showAllComments is false */}
      {comments.length > 0 && !showAllComments ? (
        <View style={[t.flexRow, t.itemsCenter, t.mY1]}>
          <Ionicons name="person-circle-outline" size={20} color="gray" />
          <Text style={[t.textGray600, t.textSm, t.mL2]}>
            {comments[comments.length - 1].user}: {comments[comments.length - 1].comment}
          </Text>
        </View>
      ) : (
        // Show all comments when showAllComments is true
        <ScrollView style={[t.mB4]} showsVerticalScrollIndicator={false}>
          {comments.map((c, index) => (
            <View key={index} style={[t.flexRow, t.itemsCenter, t.mY1]}>
              <Ionicons name="person-circle-outline" size={20} color="gray" />
              <Text style={[t.textGray600, t.textSm, t.mL2]}>
                {c.user}: {c.comment}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Toggle button to show all comments */}
      <TouchableOpacity
        onPress={() => setShowAllComments(!showAllComments)}
        style={[t.mT2, t.flexRow, t.itemsCenter]}
      >
        <Ionicons name="chevron-down-circle-outline" size={20} color="blue" />
        <Text style={[t.textBlue500, t.mL2]}>
          {showAllComments ? "Show Latest Comment" : "Show All Comments"}
        </Text>
      </TouchableOpacity>

      {/* Add a new comment */}
      <View style={[t.flexRow, t.itemsCenter, t.border, t.rounded, t.p2, t.mT4]}>
        <TextInput
          style={[t.flex1, t.p1, t.textSm]}
          placeholder="Add a comment..."
          value={comment}
          onChangeText={setComment}
        />
        <TouchableOpacity onPress={addComment} style={[t.bgBlue500, t.p2, t.rounded]}>
          <Text style={[t.textWhite, t.textSm]}>Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CommentSection;