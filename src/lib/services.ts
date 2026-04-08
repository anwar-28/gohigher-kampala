import { ID, Query } from "appwrite";
import { databases, storage, DB_ID, STORAGE_ID, COLLECTIONS } from "./appwrite";
import { getUserProfile } from "./auth";

// ─── GARBAGE REQUESTS ─────────────────────────────────────────────────────────

export interface GarbageRequest {
  $id: string;
  user_id: string;
  waste_type: string;
  date: string;
  status: "pending" | "scheduled" | "completed";
  $createdAt: string;
}

export async function createGarbageRequest(
  userId: string,
  wasteType: string,
  date: string,
) {
  return await databases.createDocument(
    DB_ID,
    COLLECTIONS.GARBAGE_REQUESTS,
    ID.unique(),
    {
      user_id: userId,
      waste_type: wasteType,
      date,
      status: "pending",
    },
  );
}

export async function getGarbageRequests(userId?: string) {
  const queries = userId
    ? [Query.equal("user_id", userId), Query.orderDesc("$createdAt")]
    : [Query.orderDesc("$createdAt"), Query.limit(50)];
  const res = await databases.listDocuments(
    DB_ID,
    COLLECTIONS.GARBAGE_REQUESTS,
    queries,
  );
  return res.documents as unknown as GarbageRequest[];
}

export async function updateGarbageStatus(
  id: string,
  status: GarbageRequest["status"],
) {
  return await databases.updateDocument(
    DB_ID,
    COLLECTIONS.GARBAGE_REQUESTS,
    id,
    { status },
  );
}

// ─── HOTSPOTS ─────────────────────────────────────────────────────────────────

export interface Hotspot {
  $id: string;
  location: string;
  severity_level: number;
  report_count: number;
}

export async function getHotspots() {
  const res = await databases.listDocuments(DB_ID, COLLECTIONS.HOTSPOTS, [
    Query.orderDesc("severity_level"),
    Query.limit(20),
  ]);
  return res.documents as unknown as Hotspot[];
}

export async function upsertHotspot(location: string) {
  const existing = await databases.listDocuments(DB_ID, COLLECTIONS.HOTSPOTS, [
    Query.equal("location", location),
  ]);
  if (existing.total > 0) {
    const doc = existing.documents[0];
    const count = (doc.report_count as number) + 1;
    return await databases.updateDocument(
      DB_ID,
      COLLECTIONS.HOTSPOTS,
      doc.$id,
      {
        report_count: count,
        severity_level: Math.min(Math.ceil(count / 3), 5),
      },
    );
  }
  return await databases.createDocument(
    DB_ID,
    COLLECTIONS.HOTSPOTS,
    ID.unique(),
    {
      location,
      severity_level: 1,
      report_count: 1,
    },
  );
}

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────

export interface Product {
  $id: string;
  vendor_id: string;
  vendor_name?: string;
  vendor_contact?: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  $createdAt: string;
}

export async function createProduct(
  vendorId: string,
  name: string,
  description: string,
  price: number,
  imageFile?: File,
  vendorName?: string,
  vendorContact?: string,
) {
  let imageId: string | undefined;
  if (imageFile) {
    const uploaded = await storage.createFile(
      STORAGE_ID,
      ID.unique(),
      imageFile,
    );
    imageId = uploaded.$id;
  }
  return await databases.createDocument(
    DB_ID,
    COLLECTIONS.PRODUCTS,
    ID.unique(),
    {
      vendor_id: vendorId,
      vendor_name: vendorName,
      vendor_contact: vendorContact,
      name,
      description,
      price,
      image: imageId,
    },
  );
}

export async function getProducts() {
  const res = await databases.listDocuments(DB_ID, COLLECTIONS.PRODUCTS, [
    Query.orderDesc("$createdAt"),
    Query.limit(50),
  ]);
  return res.documents as unknown as Product[];
}

export async function updateProduct(
  id: string,
  data: Partial<Pick<Product, "name" | "description" | "price">>,
) {
  return await databases.updateDocument(DB_ID, COLLECTIONS.PRODUCTS, id, data);
}

export async function deleteProduct(id: string) {
  return await databases.deleteDocument(DB_ID, COLLECTIONS.PRODUCTS, id);
}

// ─── ARTICLES ─────────────────────────────────────────────────────────────────

export interface Article {
  $id: string;
  author_id: string;
  author_name?: string;
  author_image?: string;
  author_profile?: {
    $id: string;
    name: string;
    email: string;
    profile_picture?: string;
  };
  title: string;
  content: string;
  image?: string;
  $createdAt: string;
}

export async function createArticle(
  authorId: string,
  title: string,
  content: string,
  authorName?: string,
  imageFile?: File,
) {
  let imageId: string | undefined;
  if (imageFile) {
    const uploaded = await storage.createFile(
      STORAGE_ID,
      ID.unique(),
      imageFile,
    );
    imageId = uploaded.$id;
  }
  return await databases.createDocument(
    DB_ID,
    COLLECTIONS.ARTICLES,
    ID.unique(),
    {
      author_id: authorId,
      author_name: authorName,
      title,
      content,
      image: imageId,
    },
  );
}

export async function getArticles() {
  const res = await databases.listDocuments(DB_ID, COLLECTIONS.ARTICLES, [
    Query.orderDesc("$createdAt"),
    Query.limit(20),
  ]);

  const articles = res.documents as unknown as Article[];

  // Enrich articles with author profile data
  const enrichedArticles = await Promise.all(
    articles.map(async (article) => {
      try {
        const profile = await getUserProfile(article.author_id);
        return {
          ...article,
          author_profile: profile ?? undefined,
          author_image: profile?.profile_picture,
        };
      } catch {
        return article;
      }
    }),
  );

  return enrichedArticles;
}

export async function getArticle(id: string): Promise<Article> {
  return (await databases.getDocument(
    DB_ID,
    COLLECTIONS.ARTICLES,
    id,
  )) as unknown as Article;
}

export async function deleteArticle(id: string) {
  return await databases.deleteDocument(DB_ID, COLLECTIONS.ARTICLES, id);
}

// ─── MESSAGES ─────────────────────────────────────────────────────────────────

export interface Message {
  $id: string;
  user_id: string;
  message: string;
  response?: string;
  $createdAt: string;
}

export async function createMessage(userId: string, message: string) {
  return await databases.createDocument(
    DB_ID,
    COLLECTIONS.MESSAGES,
    ID.unique(),
    {
      user_id: userId,
      message,
      response: "",
    },
  );
}

export async function getMessages() {
  const res = await databases.listDocuments(DB_ID, COLLECTIONS.MESSAGES, [
    Query.orderDesc("$createdAt"),
    Query.limit(50),
  ]);
  return res.documents as unknown as Message[];
}

export async function respondToMessage(id: string, response: string) {
  return await databases.updateDocument(DB_ID, COLLECTIONS.MESSAGES, id, {
    response,
  });
}
