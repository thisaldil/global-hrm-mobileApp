import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, FlatList } from "react-native";
import axios from "axios";
import moment from "moment";
import { Ionicons } from "@expo/vector-icons";
import { t } from "react-native-tailwindcss";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Video from 'react-native-video';
import CommentSection from "@/components/commentSection";

interface Post {
  id: string;
  title: string;
  content: string;
  attachment?: string;
  created_at: string;
  liked: boolean;
  likes: number;
}

const News = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showAllComments, setShowAllComments] = useState<{ [key: string]: boolean }>({});

  const fetchPosts = async () => {
    try {
      const response = await axios.get("https://global-hrm-mobile-server.vercel.app/news/posts");
      const likedPosts = JSON.parse(await AsyncStorage.getItem("likedPosts") || "[]");
      setPosts(response.data.map((post: Post) => ({ ...post, liked: likedPosts.includes(post.id) })));
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const likePost = async (postId: string) => {
    const updatedPosts = posts.map(post =>
      post.id === postId
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    );

    setPosts(updatedPosts);

    try {
      const likedPosts = JSON.parse(await AsyncStorage.getItem("likedPosts") || "[]");
      if (updatedPosts.find(post => post.id === postId)?.liked) {
        likedPosts.push(postId);
      } else {
        const index = likedPosts.indexOf(postId);
        if (index !== -1) likedPosts.splice(index, 1);
      }
      await AsyncStorage.setItem("likedPosts", JSON.stringify(likedPosts));

      await axios.post(`https://global-hrm-mobile-server.vercel.app/news/posts/${postId}/${updatedPosts.find(post => post.id === postId)?.liked ? "like" : "unlike"}`);
    } catch (error) {
      console.error("Error liking/unliking post:", error);
    }
  };

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={[t.bgWhite, t.shadowMd, t.roundedLg, t.p4, t.mB4]}>
          <Text style={[t.textXl, t.fontBold, t.textGray900]}>{item.title}</Text>
          <Text style={[t.textGray700, t.mT2]}>{item.content}</Text>

          {item.attachment && (
            <View style={[t.mT4]}>
              {item.attachment.endsWith(".mp4") || item.attachment.endsWith(".webm") ? (
                <Video
                  source={{ uri: item.attachment }}
                  style={{ width: '100%', height: 200, borderRadius: 10 }}
                  controls
                  resizeMode="contain" 
                />
              ) : (
                <Image
                  source={{ uri: item.attachment }}
                  style={{ width: "100%", height: 200, borderRadius: 10 }}
                  resizeMode="contain"
                />
              )}
            </View>
          )}

          <Text style={[t.textSm, t.textGray500, t.mT2]}>{moment(item.created_at).format("LLL")}</Text>

          <View style={[t.flexRow, t.mT4]}>
            <TouchableOpacity onPress={() => likePost(item.id)} style={[t.flexRow, t.itemsCenter]}>
              <Ionicons name={item.liked ? "heart" : "heart-outline"} size={20} color="red" />
              <Text style={[t.textGray700, t.mL2]}>{item.likes} Likes</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowAllComments({ ...showAllComments, [item.id]: !showAllComments[item.id] })} style={[t.flexRow, t.itemsCenter, t.mL5]}>
              <Ionicons name="chatbubble-outline" size={20} color="blue" />
            </TouchableOpacity>
          </View>

          {showAllComments[item.id] && <CommentSection postId={item.id} />}
        </View>
      )}
    />
  );
};

export default News;