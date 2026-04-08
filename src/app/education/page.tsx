"use client";
import { useState, useEffect, useRef } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
import {
  getArticles,
  createArticle,
  deleteArticle,
  Article,
} from "@/lib/services";
import { getImageUrl } from "@/lib/reports";
import {
  Button,
  Input,
  Textarea,
  Card,
  PageHeader,
  EmptyState,
  Skeleton,
  Avatar,
} from "@/components/ui";
import {
  BookOpen,
  Plus,
  Trash2,
  Clock,
  ChevronRight,
  X,
  Image as ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

const ECO_TIPS = [
  {
    icon: "♻️",
    tip: "Separate organic waste from plastic to enable proper recycling",
  },
  {
    icon: "💧",
    tip: "Fix leaking taps — 1 drip/sec wastes 3,000 litres per year",
  },
  {
    icon: "🌱",
    tip: "Compost kitchen scraps to reduce landfill waste by up to 30%",
  },
  {
    icon: "🛍️",
    tip: "Carry reusable bags — Uganda produces 600 million plastic bags annually",
  },
];

export default function EducationPage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState<Article | null>(null);
  const [form, setForm] = useState({ title: "", content: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const canPost = user?.role === "admin" || user?.role === "vendor";

  const loadArticles = async () => {
    setLoading(true);
    try {
      setArticles(await getArticles());
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content required");
      return;
    }
    if (!user) return;
    setSubmitting(true);
    try {
      await createArticle(
        user.$id,
        form.title,
        form.content,
        user.name,
        imageFile || undefined,
      );
      toast.success("Article published!");
      setForm({ title: "", content: "" });
      setImageFile(null);
      setPreview(null);
      setShowForm(false);
      loadArticles();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to publish");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    await deleteArticle(id);
    toast.success("Article deleted");
    loadArticles();
  };

  return (
    <AppShell>
      <div className="animate-in">
        {/* Article reader modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8">
              {selected.image && (
                <div className="mb-6 rounded-xl overflow-hidden h-64 bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getImageUrl(selected.image)}
                    alt={selected.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex items-start justify-between mb-6">
                <h2
                  className="text-2xl font-bold text-slate-900 pr-4"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {selected.title}
                </h2>
                <button
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center hover:bg-slate-200 flex-shrink-0"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
                <Avatar
                  src={
                    selected.author_image
                      ? getImageUrl(selected.author_image)
                      : undefined
                  }
                  name={selected.author_name || "Author"}
                  size="md"
                />
                <div className="flex-1">
                  {selected.author_name && (
                    <p className="font-semibold text-slate-800 text-sm">
                      {selected.author_name}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Clock size={11} />
                    {formatDistanceToNow(new Date(selected.$createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
              <div className="prose prose-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {selected.content}
              </div>
            </div>
          </div>
        )}

        <PageHeader
          title="Environmental Education"
          subtitle="Learn about sustainability and eco-friendly practices"
          action={
            canPost && (
              <Button
                onClick={() => setShowForm(!showForm)}
                variant={showForm ? "secondary" : "primary"}
              >
                <Plus size={16} /> {showForm ? "Cancel" : "Write Article"}
              </Button>
            )
          }
        />

        {/* Quick tips */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {ECO_TIPS.map(({ icon, tip }) => (
            <Card key={tip} className="p-4">
              <span className="text-2xl block mb-2">{icon}</span>
              <p className="text-xs text-slate-600 leading-relaxed">{tip}</p>
            </Card>
          ))}
        </div>

        {/* Write article */}
        {showForm && canPost && (
          <Card className="p-6 mb-8 border-blue-100 animate-in">
            <h3
              className="font-bold text-slate-800 mb-5"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Write Article
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Article Title"
                placeholder="e.g. How to Reduce Plastic Waste in Kampala"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <Textarea
                label="Content"
                placeholder="Write your article here..."
                rows={6}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />

              {/* Image upload */}
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                  Cover Image (optional)
                </label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                {preview ? (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPreview(null);
                        setImageFile(null);
                      }}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full h-24 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50 transition-colors text-slate-400 hover:text-blue-500"
                  >
                    <ImageIcon size={24} />
                    <span className="text-sm font-medium">
                      Click to upload cover image
                    </span>
                  </button>
                )}
              </div>

              <Button type="submit" loading={submitting}>
                Publish Article
              </Button>
            </form>
          </Card>
        )}

        {/* Articles */}
        <h3
          className="font-bold text-slate-800 mb-4"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Articles & Guides
        </h3>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <Card>
            <EmptyState
              icon={<BookOpen size={22} />}
              title="No articles yet"
              description="Admins and vendors can publish environmental guides"
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <Card
                key={article.$id}
                className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-b border-slate-100 last:border-b-0 p-0"
                onClick={() => setSelected(article)}
              >
                <div className="flex flex-col sm:flex-row gap-0">
                  {/* Image Section */}
                  {article.image && (
                    <div className="w-full sm:w-48 h-48 sm:h-40 overflow-hidden bg-slate-100 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getImageUrl(article.image)}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  {/* Content Section */}
                  <div className="flex-1 flex flex-col justify-between p-6 sm:p-6">
                    {/* Header with Icon */}
                    <div>
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:from-blue-200 group-hover:to-blue-100 transition-colors">
                          <BookOpen size={18} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2"
                            style={{ fontFamily: "Inter, sans-serif" }}
                          >
                            {article.title}
                          </h3>
                        </div>
                      </div>
                      
                      {/* Preview Text */}
                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-4">
                        {article.content.slice(0, 200)}...
                      </p>
                    </div>

                    {/* Footer with Author & Actions */}
                    <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar
                          src={
                            article.author_image
                              ? getImageUrl(article.author_image)
                              : undefined
                          }
                          name={article.author_name || "Author"}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          {article.author_name && (
                            <p className="text-sm font-semibold text-slate-800">
                              {article.author_name}
                            </p>
                          )}
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock size={12} />
                            {formatDistanceToNow(new Date(article.$createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {(user?.role === "admin" ||
                          user?.$id === article.author_id) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(article.$id);
                            }}
                            className="p-2 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                            title="Delete article"
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </button>
                        )}
                        <div className="p-2 text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 rounded-lg transition-all duration-200">
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
