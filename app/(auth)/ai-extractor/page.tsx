'use client';

import { useState, useEffect } from 'react';
import { Plus, X, FileText, Upload, Settings, ChevronRight, Trash2, Edit2, MoreVertical, Grid } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ExtractionConfig {
  name: string;
  question: string;
  undefined: string;
}

interface ExtractionLogic {
  id: string;
  name: string;
  batch_size: number;
  config: ExtractionConfig[];
  last_updated_at: string;
  last_updated_by: string | null;
}

interface DocumentType {
  id: string;
  name: string;
  description: string | null;
  code: string;
  extraction_logic: ExtractionLogic | null;
}

interface ApiResponse {
  status: string;
  message: string;
  data: DocumentType[];
}

export default function AIExtractorPage() {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocumentTypes();
  }, []);

  const fetchDocumentTypes = async () => {
    try {
      setLoading(true);
      const response = await api.get<ApiResponse>('/v2/extractor/logic/list/');
      
      if (response.status === 'success') {
        setDocumentTypes(response.data);
        setError(null);
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      setError('Failed to load document types');
      console.error('Error fetching document types:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground">Loading document types...</div>
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI Extractor</h1>
          <p className="text-muted-foreground mt-2">
            Configure document types and extraction rules for automated data processing.
          </p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Document Type
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documentTypes.map((docType) => (
          <div
            key={docType.id}
            className="bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {docType.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {docType.description || 'No description available'}
                  </p>
                  <div className="mt-2">
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                      {docType.code}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {docType.extraction_logic ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Logic: {docType.extraction_logic.name}</span>
                    <span>Batch Size: {docType.extraction_logic.batch_size}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Extraction Fields</h4>
                    <div className="space-y-1">
                      {docType.extraction_logic.config.map((field, index) => (
                        <div
                          key={index}
                          className="text-sm p-2 bg-muted rounded-lg"
                        >
                          <div className="font-medium">{field.name}</div>
                          <div className="text-muted-foreground text-xs mt-1">
                            {field.question}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Last updated: {new Date(docType.extraction_logic.last_updated_at).toLocaleString()}
                  </div>
                </div>
              ) : (
                <div className="bg-muted/50 rounded-lg p-4 text-center text-muted-foreground">
                  No extraction logic configured
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}