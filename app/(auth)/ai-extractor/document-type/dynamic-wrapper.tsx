"use client";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DocumentType } from '../types';
import { ApiResponse } from '../types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

interface SampleDocument {
  id: string;
  name: string;
  uploadedAt: string;
}

export default function DocumentTypeDetailClient() {
//   const router = useRouter();
//   const { id } = router.query;
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [documentType, setDocumentType] = useState<DocumentType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State management for sample documents
  const [sampleDocuments, setSampleDocuments] = useState<SampleDocument[]>([]);
  const [newSampleName, setNewSampleName] = useState('');

  // New state for dropdown-based extraction config selection
  // Each extraction config (logic) has at least: id, name, version, last_updated_at, optionally content,
  // and a "config" array holding extraction fields with a name and question.
  const [selectedLogic, setSelectedLogic] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchDocumentType(id as string);
    }
  }, [id]);
  useEffect(() => {
    console.log(documentType);
  }, [documentType]);

  const fetchDocumentType = async (docTypeId: string) => {
    try {
      setLoading(true);
      const response = await api.get<ApiResponse>(`/v2/extractor/logic/list/${docTypeId}/`);
      if (response.status === 'success') {
        setDocumentType(response.data[0]);
        setError(null);
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      setError('Failed to load document type');
      console.error('Error fetching document type:', err);
    } finally {
      setLoading(false);

    }
  };

  useEffect(() => {
    // Simulate fetching sample documents from an AI service
    setSampleDocuments([
      { id: 'sdoc-1', name: 'Sample Invoice 1', uploadedAt: '2023-09-20' },
      { id: 'sdoc-2', name: 'Sample Invoice 2', uploadedAt: '2023-09-25' }
    ]);
  }, []);

  const handleAddSampleDocument = () => {
    if (newSampleName.trim() === '') return;
    const newDoc: SampleDocument = {
      id: `sdoc-${Date.now()}`,
      name: newSampleName,
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    setSampleDocuments((prev) => [...prev, newDoc]);
    setNewSampleName('');
  };

  const handleRemoveSampleDocument = (id: string) => {
    setSampleDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  // Extraction config actions
  const handleRunExtraction = (version: number) => {
    alert(`Running extraction using version V${version}`);
    // Replace this alert with your API call to run extraction.
  };

  const handleCreateNewVersion = () => {
    alert('Creating a new extraction config version...');
    // Add your modal or creation logic here.
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!documentType) {
    return <div>Document type not found</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Document Type Header Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {documentType.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documentType.description && (
            <p className="text-muted-foreground">
              {documentType.description}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Extraction Config Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Extraction Config Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Dropdown for selecting an extraction config */}
          <div className="mb-4">
            <Label htmlFor="extraction-config" className="mb-2 block">
              Select Extraction Config
            </Label>
            <Select
              value={selectedLogic ? selectedLogic.id : ""}
              onValueChange={(value) => {
                const foundLogic = documentType.extraction_logics.find(
                  (logic) => logic.id === value
                );
                setSelectedLogic(foundLogic || null);
              }}
            >
              <SelectTrigger id="extraction-config" className="w-full">
                <SelectValue placeholder="-- Select a Config --" />
              </SelectTrigger>
              <SelectContent>
                {documentType.extraction_logics.map((logic) => (
                  <SelectItem key={logic.id} value={logic.id}>
                    {logic.name} - V{logic.version}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Show detailed content of the selected extraction config */}
          {selectedLogic && (
            <div className="p-4 mb-4 border flex gap-8 border-gray-200 rounded">
              <p>
                <strong>Name:</strong> {selectedLogic.name}
              </p>
              <p>
                <strong>Version:</strong> V{selectedLogic.version}
              </p>
              <p>
                <strong>Last Updated:</strong> {selectedLogic.last_updated_at}
              </p>
            </div>
          )}

          {/* New Table: Display extraction config fields (name and extraction question) */}
          {selectedLogic && selectedLogic.config && selectedLogic.config.length > 0 && (
            <Table className="mt-4 border">
              <TableHeader className="bg-gray-100">
                <TableRow>
                  <TableHead className="p-2 text-left">Field Name</TableHead>
                  <TableHead className="p-2 text-left">Extraction Question</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedLogic.config.map((field: any, idx: number) => (
                  <TableRow key={idx} className="border-t">
                    <TableCell className="p-2">{field.name}</TableCell>
                    <TableCell className="p-2">{field.question}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}


        </CardContent>
      </Card>

      {/* Sample Documents Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Sample Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            <Input
              value={newSampleName}
              onChange={(e) => setNewSampleName(e.target.value)}
              placeholder="Enter sample document name"
            />
            <Button onClick={handleAddSampleDocument}>Add Document</Button>
          </div>
          {sampleDocuments.length > 0 ? (
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left p-2">Name</TableHead>
                  <TableHead className="text-left p-2">Uploaded At</TableHead>
                  <TableHead className="text-left p-2">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleDocuments.map((doc) => (
                  <TableRow key={doc.id} className="border-t">
                    <TableCell className="p-2">{doc.name}</TableCell>
                    <TableCell className="p-2">{doc.uploadedAt}</TableCell>
                    <TableCell className="p-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveSampleDocument(doc.id)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>No sample documents available.</p>
          )}
        </CardContent>
      </Card>

      
    </div>
  );
} 