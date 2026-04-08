import { ID, Query } from "appwrite";
import {
  account,
  databases,
  storage,
  DB_ID,
  COLLECTIONS,
  STORAGE_ID,
} from "./appwrite";

export interface UserProfile {
  $id: string;
  name: string;
  email: string;
  role: "citizen" | "admin" | "vendor";
  profile_picture?: string;
  contact_number?: string;
}

export async function register(
  name: string,
  email: string,
  password: string,
  role: "citizen" | "vendor" = "citizen",
  profilePictureFile?: File,
  contactNumber?: string,
) {
  try {
    // Upload profile picture if provided
    let profilePictureId: string | undefined;
    if (profilePictureFile) {
      const uploaded = await storage.createFile(
        STORAGE_ID,
        ID.unique(),
        profilePictureFile,
      );
      profilePictureId = uploaded.$id;
    }

    // Try to create auth account
    let authUser: any;
    try {
      authUser = await account.create(ID.unique(), email, password, name);
    } catch (authError: any) {
      if (authError.code === 409 || authError.status === 409) {
        // Account already exists, try to login and get user
        await account.createEmailPasswordSession(email, password);
        authUser = await account.get();
      } else {
        throw authError;
      }
    }

    // Create or update user profile in database
    try {
      await databases.getDocument(DB_ID, COLLECTIONS.USERS, authUser.$id);
      // Profile exists, update it
      await databases.updateDocument(DB_ID, COLLECTIONS.USERS, authUser.$id, {
        name,
        email,
        role,
        profile_picture: profilePictureId,
        contact_number: contactNumber,
      });
    } catch {
      // Profile doesn't exist, create it
      await databases.createDocument(DB_ID, COLLECTIONS.USERS, authUser.$id, {
        name,
        email,
        role,
        profile_picture: profilePictureId,
        contact_number: contactNumber,
      });
    }

    // Auto login if not already logged in
    try {
      await account.get();
    } catch {
      await account.createEmailPasswordSession(email, password);
    }

    return authUser;
  } catch (error: any) {
    throw new Error(error.message || "Registration failed. Please try again.");
  }
}

export async function login(email: string, password: string) {
  // Create session
  await account.createEmailPasswordSession(email, password);

  // Get the authenticated user
  const authUser = await account.get();

  // Check if profile exists, if not create default one
  try {
    await databases.getDocument(DB_ID, COLLECTIONS.USERS, authUser.$id);
  } catch (error: any) {
    // Profile doesn't exist, create it with default role
    await databases.createDocument(DB_ID, COLLECTIONS.USERS, authUser.$id, {
      name: authUser.name || authUser.email,
      email: authUser.email,
      role: "citizen",
      profile_picture: undefined,
      contact_number: undefined,
    });
  }
}

export async function logout() {
  return await account.deleteSession("current");
}

export async function getCurrentUser() {
  try {
    const authUser = await account.get();
    const profile = await databases.getDocument(
      DB_ID,
      COLLECTIONS.USERS,
      authUser.$id,
    );
    return { ...authUser, role: profile.role as UserProfile["role"], profile };
  } catch {
    return null;
  }
}

export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  try {
    const doc = await databases.getDocument(DB_ID, COLLECTIONS.USERS, userId);
    return doc as unknown as UserProfile;
  } catch {
    return null;
  }
}
