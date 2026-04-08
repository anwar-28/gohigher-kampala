"use client";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
import {
  createPost,
  getPosts,
  likePost as likePostService,
  unlikePost as unlikePostService,
  deletePost,
  Post,
} from "@/lib/services";
import { getImageUrl } from "@/lib/reports";
import {
  Button,
  Card,
  PageHeader,
  Avatar,
  Skeleton,
  EmptyState,
} from "@/components/ui";
import {
  Heart,
  Image as ImageIcon,
  Trash2,
  Share2,
  MessageCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

const COMPANY_ROLES = ["admin", "vendor"];

export default function PostsPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ text: "", image: null as File | null });
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await getPosts();
      setPosts(data);
      if (user) {
        const liked = new Set<string>();
        data.forEach((post) => {
          if (post.liked_by) {
            try {
              const likes = JSON.parse(post.liked_by);
              if (likes.includes(user.$id)) {
                liked.add(post.$id);
              }
            } catch {
              /* empty */
            }
          }
        });
        setLikedPosts(liked);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const canPost = user && COMPANY_ROLES.includes(user.role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!form.text?.trim() && !form.image) {
      toast.error("Please enter text or select an image");
      return;
    }

    setSubmitting(true);
    try {
      await createPost(
        user.$id,
        form.text || undefined,
        form.image || undefined,
        user.name,
        user.profile_picture,
      );
      toast.success("Post shared!");
      setForm({ text: "", image: null });
      setShowForm(false);
      loadPosts();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    try {
      const isLiked = likedPosts.has(postId);
      if (isLiked) {
        await unlikePostService(postId, user.$id);
        setLikedPosts((prev) => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
      } else {
        await likePostService(postId, user.$id);
        setLikedPosts((prev) => new Set(prev).add(postId));
      }

      // Update post likes count
      setPosts((prev) =>
        prev.map((p) => {
          if (p.$id === postId) {
            const change = isLiked ? -1 : 1;
            return { ...p, likes: Math.max(0, p.likes + change) };
          }
          return p;
        }),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      await deletePost(postId);
      toast.success("Post deleted");
      loadPosts();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete post");
    }
  };

  return (
    <AppShell>
      <div className="animate-in max-w-2xl mx-auto">
        <PageHeader
          title="Company Feed"
          subtitle="A space for official updates and announcements"
        />

        {/* Create post form - only for company accounts */}
        {canPost ? (
          <>
            {!showForm && (
              <div
                className="mb-6 flex gap-4 px-4 py-3 bg-slate-50 rounded-2xl items-center cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => setShowForm(true)}
              >
                <Avatar
                  src={
                    user?.profile_picture
                      ? getImageUrl(user.profile_picture)
                      : undefined
                  }
                  name={user?.name || "User"}
                  size="md"
                />
                <input
                  type="text"
                  placeholder="What's happening?!"
                  className="flex-1 bg-transparent text-slate-700 placeholder-slate-400 focus:outline-none text-sm"
                  readOnly
                />
                <ImageIcon size={18} className="text-slate-400" />
              </div>
            )}

            {showForm && (
              <Card className="p-6 mb-6 border border-blue-200 animate-in">
                <div className="flex gap-4 mb-4">
                  <Avatar
                    src={
                      user?.profile_picture
                        ? getImageUrl(user.profile_picture)
                        : undefined
                    }
                    name={user?.name || "User"}
                    size="md"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{user?.name}</p>
                    <p className="text-xs text-slate-500">
                      {user?.role === "admin"
                        ? "🏢 Organization"
                        : "🏭 Company"}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <textarea
                    value={form.text}
                    onChange={(e) => setForm({ ...form, text: e.target.value })}
                    placeholder="What's happening?!"
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none text-slate-900 placeholder-slate-400"
                    rows={4}
                  />

                  {form.image && (
                    <div className="relative bg-slate-100 rounded-xl overflow-hidden h-48">
                      <img
                        src={URL.createObjectURL(form.image)}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, image: null })}
                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setForm({
                            ...form,
                            image: e.target.files?.[0] || null,
                          })
                        }
                        className="hidden"
                      />
                      <div className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors">
                        <ImageIcon size={16} />
                        <span className="text-sm font-semibold">Add image</span>
                      </div>
                    </label>

                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => setShowForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" loading={submitting}>
                        Post
                      </Button>
                    </div>
                  </div>
                </form>
              </Card>
            )}
          </>
        ) : (
          <Card className="p-6 mb-6 text-center border-2 border-dashed border-slate-200">
            <p className="text-slate-600 text-sm font-semibold">
              🔒 Only company & organization accounts can post
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Contact admin to upgrade your account
            </p>
          </Card>
        )}

        {/* Posts feed */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <EmptyState
              icon={<MessageCircle size={24} />}
              title="No posts yet"
              description="Check back soon for updates from official organizations"
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card
                key={post.$id}
                className="p-5 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200"
              >
                {/* Post header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-3 flex-1">
                    <Avatar
                      src={
                        post.author_avatar
                          ? getImageUrl(post.author_avatar)
                          : undefined
                      }
                      name={post.author_name || "Unknown"}
                      size="md"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900">
                          {post.author_name}
                        </p>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                          Official
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(post.$createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>

                  {user?.$id === post.author_id && (
                    <button
                      onClick={() => handleDelete(post.$id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                      title="Delete post"
                    >
                      <Trash2
                        size={16}
                        className="text-slate-400 group-hover:text-red-500"
                      />
                    </button>
                  )}
                </div>

                {/* Post content */}
                {post.text && (
                  <p className="text-slate-800 text-sm mb-4 leading-relaxed">
                    {post.text}
                  </p>
                )}

                {post.image && (
                  <img
                    src={getImageUrl(post.image)}
                    alt="post"
                    className="w-full rounded-xl mb-4 object-cover max-h-96"
                  />
                )}

                {/* Post actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-slate-500">
                  <button className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors group">
                    <MessageCircle
                      size={16}
                      className="group-hover:text-blue-500"
                    />
                    <span className="text-xs font-semibold group-hover:text-blue-500">
                      Reply
                    </span>
                  </button>

                  <button className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors group">
                    <Share2 size={16} className="group-hover:text-green-500" />
                    <span className="text-xs font-semibold group-hover:text-green-500">
                      Share
                    </span>
                  </button>

                  <button
                    onClick={() => handleLike(post.$id)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-rose-50 rounded-lg transition-colors group"
                  >
                    <Heart
                      size={16}
                      className={
                        likedPosts.has(post.$id)
                          ? "fill-rose-500 text-rose-500"
                          : "group-hover:text-rose-500"
                      }
                    />
                    <span
                      className={`text-xs font-semibold ${
                        likedPosts.has(post.$id)
                          ? "text-rose-500"
                          : "group-hover:text-rose-500"
                      }`}
                    >
                      {post.likes}
                    </span>
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
