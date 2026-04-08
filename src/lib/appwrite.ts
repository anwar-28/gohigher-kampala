import { Client, Account, Databases, Storage } from "appwrite";

const client = new Client();

client
  .setEndpoint(
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
  )
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const DB_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "gohigher-db";
export const STORAGE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID || "gohigher-storage";

export const COLLECTIONS = {
  USERS: process.env.NEXT_PUBLIC_COLLECTION_USERS || "users",
  REPORTS: process.env.NEXT_PUBLIC_COLLECTION_REPORTS || "reports",
  GARBAGE_REQUESTS:
    process.env.NEXT_PUBLIC_COLLECTION_GARBAGE_REQUESTS || "garbage_requests",
  HOTSPOTS: process.env.NEXT_PUBLIC_COLLECTION_HOTSPOTS || "hotspots",
  PRODUCTS: process.env.NEXT_PUBLIC_COLLECTION_PRODUCTS || "products",
  ARTICLES: process.env.NEXT_PUBLIC_COLLECTION_ARTICLES || "articles",
  MESSAGES: process.env.NEXT_PUBLIC_COLLECTION_MESSAGES || "messages",
  POSTS: process.env.NEXT_PUBLIC_COLLECTION_POSTS || "posts",
};

export default client;
