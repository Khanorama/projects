import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/components/AuthProvider";
import colors from "@/styles/colors";
import Button from "@/components/Button";
import UserPost from "@/components/UserPost";

export default function CommunityScreen() {
  const { session } = useAuth();

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  async function loadPosts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("posts")
      .select(`
        id,
        content,
        image_url,
        created_at,
        profiles ( username ),
        post_reactions ( reaction, user_id )
      `)
      .order("created_at", { ascending: true });

    if (error) {
      Alert.alert("Error loading posts", error.message);
    } else {
      setPosts(data || []);
    }

    setLoading(false);

    // FlatList must finish rendering before scrollToEnd works
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }

  useEffect(() => {
    loadPosts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setLoading(false); // prevent full-screen spinner on pull-to-refresh
    await loadPosts();
    setRefreshing(false);
  };

  async function addPost() {
    if (!session?.user) return;

    if (!newPost.trim()) {
      Alert.alert("Write something first");
      return;
    }

    const { error } = await supabase.from("posts").insert({
      profile_id: session.user.id,
      content: newPost.trim(),
    });

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setNewPost("");
      loadPosts();
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }

  async function handleReact(postId: string, reaction: string) {
    if (!session?.user) return;
    const userId = session.user.id;

    // Update local state immediately so the UI doesn't wait for the DB round-trip
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const existing = (post.post_reactions ?? []).find(
          (r: any) => r.user_id === userId
        );
        let updated: any[];
        if (existing?.reaction === reaction) {
          // same reaction tapped: remove it
          updated = (post.post_reactions ?? []).filter(
            (r: any) => r.user_id !== userId
          );
        } else {
          // new or changed reaction: replace it
          updated = [
            ...(post.post_reactions ?? []).filter(
              (r: any) => r.user_id !== userId
            ),
            { reaction, user_id: userId },
          ];
        }
        return { ...post, post_reactions: updated };
      })
    );

    // Sync to database
    const post = posts.find((p) => p.id === postId);
    const existing = (post?.post_reactions ?? []).find(
      (r: any) => r.user_id === userId
    );

    if (existing?.reaction === reaction) {
      await supabase
        .from("post_reactions")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);
    } else {
      await supabase
        .from("post_reactions")
        .upsert(
          { post_id: postId, user_id: userId, reaction },
          { onConflict: "post_id,user_id" } // replaces existing reaction rather than inserting a duplicate
        );
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 140 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        renderItem={({ item }) => (
          <UserPost
            username={item.profiles?.username ?? "user"}
            initialText={item.content}
            timestamp={item.created_at}
            editable={false}
            imageUrl={item.image_url ?? undefined}
            reactions={item.post_reactions ?? []}
            currentUserId={session?.user?.id}
            onPress={() => {}}
            onReact={(reaction) => handleReact(item.id, reaction)}
          />
        )}
      />

      {/* CREATE POST */}
      <View style={styles.createContainer}>
        <UserPost
          username="You"
          initialText={newPost}
          editable={true}
          onPress={() => {}}
          onChangeText={setNewPost}
        />
        <View style={styles.postButton}>
          <Button title="Post" onPress={addPost} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 12,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  createContainer: {
    paddingTop: 10,
    paddingBottom: 20,
    borderTopWidth: 0.5,
    borderTopColor: colors.secondary,
  },
  postButton: {
    marginTop: 5,
    marginHorizontal: 10,
  },
});

