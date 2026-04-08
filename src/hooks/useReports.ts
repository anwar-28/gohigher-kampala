"use client";
import { useState, useEffect, useCallback } from "react";
import { getReports, Report } from "@/lib/reports";
import client, { DB_ID, COLLECTIONS } from "@/lib/appwrite";

export function useReports(userId?: string) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getReports(userId);
      setReports(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchReports();

    // Real-time subscription
    const channel = `databases.${DB_ID}.collections.${COLLECTIONS.REPORTS}.documents`;
    const unsubscribe = client.subscribe(channel, (response) => {
      if (
        response.events.includes(
          "databases.*.collections.*.documents.*.create",
        ) ||
        response.events.includes(
          "databases.*.collections.*.documents.*.update",
        ) ||
        response.events.includes("databases.*.collections.*.documents.*.delete")
      ) {
        fetchReports();
      }
    });

    return () => unsubscribe();
  }, [fetchReports]);

  return { reports, loading, error, refresh: fetchReports };
}
