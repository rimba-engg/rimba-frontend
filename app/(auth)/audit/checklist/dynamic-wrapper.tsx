// components/ChecklistPageClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ChecklistClient from './components/checklist-client';
import { api } from '@/lib/api';
import { type Checklist } from '@/lib/types';

interface ChecklistResponse {
  data: Checklist;
}

export default function ChecklistPageClient() {
  const searchParams = useSearchParams();
  const checklistId = searchParams.get('id');
  const checklistItemId = searchParams.get('checklist_item_id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checklistData, setChecklistData] = useState<Checklist | null>(null);

  useEffect(() => {
    if (checklistId) {
      fetchChecklistDetails();
    }
  }, [checklistId]);

  const fetchChecklistDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get<ChecklistResponse>(`/audit/v2/checklist/${checklistId}/`);
      console.log('Checklist details:', response);
      setChecklistData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load checklist details');
      console.error('Error fetching checklist details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!checklistId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground">No checklist ID provided</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground">Loading checklist details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  if (!checklistData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground">No checklist data found</div>
      </div>
    );
  }

  return (
    <ChecklistClient
      checklistData={checklistData}
      refreshChecklist={fetchChecklistDetails}
      checklistItemId={checklistItemId}
    />
  );
}
