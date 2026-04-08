"use client";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
import {
  getProducts,
  createProduct,
  deleteProduct,
  Product,
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
} from "@/components/ui";
import {
  ShoppingBag,
  Plus,
  Trash2,
  Edit2,
  Package,
  Tag,
  MessageCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function MarketplacePage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    vendor_contact: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Product name is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.price || isNaN(parseFloat(form.price)))
      e.price = "Valid price is required";
    return e;
  };

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
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    if (!user) return;
    setSubmitting(true);
    try {
      await createProduct(
        user.$id,
        form.name,
        form.description,
        parseFloat(form.price),
        imageFile || undefined,
        user.name,
        form.vendor_contact || undefined,
      );
      toast.success("Product listed!");
      setForm({ name: "", description: "", price: "", vendor_contact: "" });
      setPreview(null);
      setImageFile(null);
      setShowForm(false);
      loadProducts();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to list product",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this product?")) return;
    await deleteProduct(id);
    toast.success("Product removed");
    loadProducts();
  };

  const myProducts = products.filter((p) => p.vendor_id === user?.$id);
  const otherProducts = products.filter((p) => p.vendor_id !== user?.$id);

  return (
    <AppShell>
      <div className="animate-in">
        <PageHeader
          title="Sustainable Market"
          subtitle="Eco-friendly products from verified vendors"
          action={
            user?.role === "vendor" && (
              <Button
                onClick={() => setShowForm(!showForm)}
                variant={showForm ? "secondary" : "primary"}
              >
                <Plus size={16} /> {showForm ? "Cancel" : "List Product"}
              </Button>
            )
          }
        />

        {/* Add product form — vendors only */}
        {showForm && user?.role === "vendor" && (
          <Card className="p-6 mb-8 border-blue-100 animate-in">
            <h3
              className="font-bold text-slate-800 mb-5"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              List New Product
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <Input
                label="Product Name"
                placeholder="e.g. Recycled Paper Bag"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                error={errors.name}
                className="col-span-2"
              />
              <Textarea
                label="Description"
                placeholder="Describe your product..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                error={errors.description}
                className="col-span-2"
                rows={3}
              />
              <Input
                label="Price (UGX)"
                type="number"
                placeholder="5000"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                error={errors.price}
                icon={<Tag size={14} />}
              />
              <Input
                label="Phone Number"
                type="tel"
                placeholder="+256 xxx xxx xxx"
                value={form.vendor_contact}
                onChange={(e) =>
                  setForm({ ...form, vendor_contact: e.target.value })
                }
                icon={<MessageCircle size={14} />}
              />
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                  Product Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="product-img"
                  onChange={handleImageChange}
                />
                <label
                  htmlFor="product-img"
                  className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors w-full"
                >
                  <Package size={15} />
                  {imageFile ? imageFile.name : "Upload image"}
                </label>
              </div>
              {preview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="preview"
                  className="col-span-2 h-40 object-cover rounded-xl"
                />
              )}
              <div className="col-span-2 pt-2">
                <Button type="submit" loading={submitting}>
                  List Product
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* My listings */}
        {user?.role === "vendor" && myProducts.length > 0 && (
          <div className="mb-8">
            <h3
              className="font-bold text-slate-700 mb-4"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              My Listings
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {myProducts.map((p) => (
                <Card key={p.$id} className="overflow-hidden group">
                  <div className="h-36 bg-slate-100 relative">
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getImageUrl(p.image)}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={28} className="text-slate-300" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDelete(p.$id)}
                        className="w-7 h-7 bg-red-500 rounded-lg flex items-center justify-center text-white hover:bg-red-600"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-yellow-400 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-lg">
                      Mine
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-slate-800 text-sm truncate">
                      {p.name}
                    </p>
                    <p className="text-blue-600 font-bold text-sm mt-1">
                      UGX {p.price.toLocaleString()}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All products */}
        <h3
          className="font-bold text-slate-700 mb-4"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          All Products
        </h3>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-56" />
            ))}
          </div>
        ) : otherProducts.length === 0 && products.length === 0 ? (
          <Card>
            <EmptyState
              icon={<ShoppingBag size={22} />}
              title="No products yet"
              description="Vendors can list eco-friendly products here"
            />
          </Card>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {(user?.role === "vendor" ? otherProducts : products).map((p) => (
              <Card
                key={p.$id}
                className="overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <div className="h-40 bg-slate-100">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getImageUrl(p.image)}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={28} className="text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="font-semibold text-slate-800 text-sm truncate mb-1">
                    {p.name}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                    {p.description}
                  </p>
                  {p.vendor_name && (
                    <p className="text-xs text-slate-600 font-medium mb-1">
                      By: {p.vendor_name}
                    </p>
                  )}
                  {p.vendor_contact && (
                    <p className="text-xs text-blue-600 font-medium mb-2">
                      📞 {p.vendor_contact}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 font-bold text-sm">
                      UGX {p.price.toLocaleString()}
                    </span>
                    <button
                      onClick={() =>
                        toast("Contact feature coming soon!", { icon: "💬" })
                      }
                      className="w-7 h-7 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <MessageCircle size={13} className="text-blue-600" />
                    </button>
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
