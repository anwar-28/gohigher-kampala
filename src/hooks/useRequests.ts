'use client';
import { useState, useEffect, useCallback } from 'react';
import { getGarbageRequests, GarbageRequest } from '@/lib/services';

export function useRequests(userId?: string) {
  const [requests, setRequests] = useState<GarbageRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getGarbageRequests(userId);
      setRequests(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return { requests, loading, error, refresh: fetchRequests };
}
