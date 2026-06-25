import { createFileRoute } from "@tanstack/react-router";
import {
  MessageSquare,
  TrendingUp,
  Users,
  Plus,
  Heart,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/_app/community")({
  head: () => ({ meta: [{ title: "Community · Sahaayak AI" }] }),
  component: Community,
});

import { CommunityAPI } from "@/lib/api";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";

function Community() {
  const { user } = useUser();
  const [posts, setPosts] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [studentId, setStudentId] = useState<string>("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTitle, setNewPostTitle] = useState("");

  useEffect(() => {
    if (user?.id) {
      setStudentId(user.id);
    } else {
      setStudentId("student_123");
    }
  }, [user]);

  const loadCommunityData = async () => {
    if (!studentId) return;
    try {
      const postsRes = await CommunityAPI.getPosts(studentId);
      if (postsRes.success) setPosts(postsRes.data || []);

      const groupsRes = await CommunityAPI.getGroups(studentId);
      if (groupsRes.success) setGroups(groupsRes.data || []);

      const trendingRes = await CommunityAPI.getTrending();
      if (trendingRes.success) setTrending(trendingRes.data || []);
    } catch (err) {
      console.error("Failed to load community data", err);
    }
  };

  useEffect(() => {
    loadCommunityData();
  }, [studentId]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !newPostTitle.trim()) {
      toast.error("Please enter a title and content.");
      return;
    }
    try {
      const res = await CommunityAPI.createPost({
        author_id: studentId,
        title: newPostTitle,
        content: newPostContent,
        group: "General",
      });
      if (res.success) {
        toast.success("Post created successfully!");
        setNewPostTitle("");
        setNewPostContent("");
        loadCommunityData();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to create post.");
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      const res = await CommunityAPI.joinGroup(groupId, studentId);
      if (res.success) {
        toast.success("Joined group successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to join group.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      <div className="flex-1 space-y-4">
        <header className="glass-strong shadow-soft relative overflow-hidden rounded-3xl p-6 md:p-8">
          <div className="flex items-center gap-4">
            <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <MessageSquare className="size-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                Community Feed
              </h1>
              <p className="text-sm text-muted-foreground">
                Engage with peers, share stories, and ask questions.
              </p>
            </div>
          </div>
        </header>

        <form
          onSubmit={handleCreatePost}
          className="glass rounded-3xl p-4 flex flex-col gap-3"
        >
          <div className="flex gap-4 items-center">
            <div className="size-10 rounded-full bg-muted shrink-0" />
            <input
              type="text"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              placeholder="Post title..."
              className="w-full bg-transparent border-none focus:ring-0 text-sm py-1 font-semibold"
              required
            />
          </div>
          <div className="flex gap-4 items-start pl-14">
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Share a success story or ask a question..."
              className="w-full bg-transparent border-none focus:ring-0 text-sm py-1 resize-none h-16"
              required
            />
            <Button
              type="submit"
              size="sm"
              className="rounded-full px-4 shrink-0"
            >
              <Plus className="size-4 mr-1" /> Post
            </Button>
          </div>
        </form>

        <div className="space-y-4">
          {posts.map((post, idx) => (
            <PostCard key={idx} post={post} />
          ))}
        </div>
      </div>

      <div className="w-full lg:w-80 space-y-4">
        <div className="glass rounded-3xl p-6">
          <h3 className="font-bold flex items-center gap-2 mb-4">
            <TrendingUp className="size-5 text-primary" /> Trending Topics
          </h3>
          <ul className="space-y-3">
            {trending.length > 0 ? (
              trending.map((topic: any, idx: number) => (
                <li key={idx} className="text-sm font-medium">
                  #{topic.tag || topic.name}
                  <span className="text-xs text-muted-foreground block font-normal">
                    {topic.count || topic.posts_count || 0} posts
                  </span>
                </li>
              ))
            ) : (
              <li className="text-sm text-muted-foreground">
                No trending topics.
              </li>
            )}
          </ul>
        </div>

        <div className="glass rounded-3xl p-6">
          <h3 className="font-bold flex items-center gap-2 mb-4">
            <Users className="size-5 text-primary" /> Suggested Groups
          </h3>
          <div className="space-y-4">
            {groups.length > 0 ? (
              groups.map((g: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-medium leading-tight">
                      {g.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {g.members || g.member_count || 0} members
                    </p>
                  </div>
                  <Button
                    onClick={() => handleJoinGroup(g.id)}
                    variant="outline"
                    size="sm"
                    className="rounded-full text-xs h-7"
                  >
                    Join
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">
                No suggested groups.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PostCard({ post }: { post: any }) {
  return (
    <article className="glass shadow-soft rounded-3xl p-5 border border-border/50">
      <div className="flex items-center gap-3 mb-4">
        <div className="size-10 rounded-full bg-muted" />
        <div>
          <h4 className="font-semibold text-sm">{post.author}</h4>
          <p className="text-xs text-muted-foreground">
            in <span className="font-medium text-primary/80">{post.group}</span>{" "}
            • {post.time}
          </p>
        </div>
      </div>

      <h3 className="font-bold text-lg mb-2">{post.title}</h3>
      <p className="text-sm text-foreground/80 mb-4">{post.content}</p>

      <div className="flex items-center gap-6 pt-4 border-t border-border/50">
        <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
          <Heart className="size-4" /> {post.likes}
        </button>
        <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
          <MessageCircle className="size-4" /> {post.comments} Comments
        </button>
      </div>
    </article>
  );
}
