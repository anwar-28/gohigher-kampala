import { ID, Query } from 'appwrite';
import { databases, storage, DB_ID, STORAGE_ID, COLLECTIONS } from './appwrite';

export interface Report {
  $id: string;
  user_id: string;
  description: string;
  image?: string;
  location: string;
  status: 'pending' | 'in_progress' | 'resolved';
  $createdAt: string;
}

export async function createReport(
  userId: string,
  description: string,
  location: string,
  imageFile?: File
) {
  let imageId: string | undefined;

  if (imageFile) {
    const uploaded = await storage.createFile(STORAGE_ID, ID.unique(), imageFile);
    imageId = uploaded.$id;
  }

  return await databases.createDocument(DB_ID, COLLECTIONS.REPORTS, ID.unique(), {
    user_id: userId,
    description,
    location,
    image: imageId,
    status: 'pending',
  });
}

export async function getReports(userId?: string) {
  const queries = userId ? [Query.equal('user_id', userId), Query.orderDesc('$createdAt')] : [Query.orderDesc('$createdAt'), Query.limit(50)];
  const res = await databases.listDocuments(DB_ID, COLLECTIONS.REPORTS, queries);
  return res.documents as unknown as Report[];
}

export async function updateReportStatus(reportId: string, status: Report['status']) {
  return await databases.updateDocument(DB_ID, COLLECTIONS.REPORTS, reportId, { status });
}

export async function deleteReport(reportId: string) {
  return await databases.deleteDocument(DB_ID, COLLECTIONS.REPORTS, reportId);
}

export function getImageUrl(fileId: string): string {
  return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${STORAGE_ID}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
}
