"use client";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DocumentType, ExtractionConfig } from '../types';
import { ApiResponse } from '../types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter
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
import { Edit } from 'lucide-react';
import DocumentTypeModal from '../components/DocumentTypeModal';
import { Badge } from '@/components/ui/badge';

interface SampleDocument {
  id: string;
  name: string;
  uploadedAt: string;
}

// New interface for the API response document
interface DocumentRecord {
  _id: string;
  customer: string;
  name: string;
  document_type: string;
  last_updated_at: string;
  metadata: Record<string, any>;
  status: string;
  is_deleted: boolean;
  for_year: number;
  for_month: number;
  review_reasons: any[];
  version: number;
  version_history: any[];
  is_sample: boolean;
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

  // New state for filtering sample documents
  const [sampleDocSearchQuery, setSampleDocSearchQuery] = useState("");

  // New state for dropdown-based extraction config selection
  const [selectedLogic, setSelectedLogic] = useState<any>(null);

  // New states for the "Run Extraction" card
  const [availableDocuments, setAvailableDocuments] = useState<SampleDocument[]>([]);
  const [extractionSearchQuery, setExtractionSearchQuery] = useState('');
  const [selectedDocumentForExtraction, setSelectedDocumentForExtraction] = useState<SampleDocument | null>(null);
  const [selectedRunExtractionLogic, setSelectedRunExtractionLogic] = useState<any>(null);

  // New states for extraction API response and loading state
  const [extractionResponse, setExtractionResponse] = useState<any>(null);
  const [extractionLoading, setExtractionLoading] = useState<boolean>(false);

  // State to control the edit modal visibility
  const [showEditModal, setShowEditModal] = useState(false);

  // New states for creating a new extraction config version
  const [creatingNewVersion, setCreatingNewVersion] = useState(false);
  const [newExtractionLogicName, setNewExtractionLogicName] = useState('');
  const [newExtractionConfigs, setNewExtractionConfigs] = useState<ExtractionConfig[]>([]);

  // Add the new activation state at the top of your component
  const [activationLoading, setActivationLoading] = useState(false);

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

  // New effect to fetch available documents via the API using the document type id (from the query params)
  useEffect(() => {
    if (id) {
      fetchAvailableDocuments(id);
    }
  }, [id]);

  // The new fetch function that calls the API and sets the availableDocuments state
  const fetchAvailableDocuments = async (documentTypeId: string) => {
    try {
      const response = await api.get<{
        message: string;
        status: string;
        data: { documents: DocumentRecord[] };
      }>(`/v2/documents/?document_type=${documentTypeId}`);
    
      if (response.status === "success") {
        const docs: SampleDocument[] = response.data.documents.map((doc) => ({
          id: doc._id,
          name: doc.name,
          // Format the last_updated_at as needed. Here we use toLocaleDateString.
          uploadedAt: new Date(doc.last_updated_at).toLocaleDateString(),
        }));
        setAvailableDocuments(docs);
      } else {
        console.error("Failed to fetch documents:", response.message);
      }
    } catch (error) {
      console.error("Error fetching available documents:", error);
    }
  };

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

  const handleCreateNewVersion = () => {
    alert('Creating a new extraction config version...');
  };

  // New function to handle running extraction from the "Run Extraction" card
  const handleExecuteExtraction = async () => {
    if (!selectedDocumentForExtraction || !selectedRunExtractionLogic) return;
    setExtractionLoading(true);
    try {
      const response = await api.post<{
        message: string;
        status: string;
        data: {
          extracted_columns: string[];
          extracted_table_body: any[];
        };
      }>(
        '/v2/extractor/extract/',
        {
          extraction_logic_id: selectedRunExtractionLogic.id,
          document_id: selectedDocumentForExtraction.id,
        }
      );

      if (response.status === 'success') {
        setExtractionResponse(response.data);
        console.log(response.data);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error running extraction:", error);
    } finally {
      setExtractionLoading(false);
    }
  };

  // New functions for managing new extraction config version creation
  const handleAddNewConfigRow = () => {
    // Note that we include the extra "undefined" property as defined in the ExtractionConfig type.
    setNewExtractionConfigs([...newExtractionConfigs, { name: '', question: '', "undefined": '' }]);
  };

  const handleNewConfigRowChange = (index: number, key: "name" | "question", value: string) => {
    const updatedRows = [...newExtractionConfigs];
    updatedRows[index] = { ...updatedRows[index], [key]: value };
    setNewExtractionConfigs(updatedRows);
  };

  const handleRemoveConfigRow = (index: number) => {
    const updatedRows = newExtractionConfigs.filter((_, idx) => idx !== index);
    setNewExtractionConfigs(updatedRows);
  };

  const handleSaveNewExtractionVersion = () => {
    if (!documentType) return;
    if (!newExtractionLogicName.trim() || newExtractionConfigs.length === 0) {
      alert("Please provide a name and at least one config row");
      return;
    }
    // Determine a new version number (using the highest version + 1)
    const currentVersions = documentType.extraction_logics.map((logic) => logic.version);
    const newVersion = currentVersions.length > 0 ? Math.max(...currentVersions) + 1 : 1;
    const newExtractionLogic = {
      id: `logic-${Date.now()}`, // simple generated ID
      name: newExtractionLogicName,
      batch_size: 1, // default batch size
      config: newExtractionConfigs,
      last_updated_at: new Date().toISOString(),
      last_updated_by: null,
      is_active: true,
      version: newVersion,
    };
    setDocumentType({
      ...documentType,
      extraction_logics: [...documentType.extraction_logics, newExtractionLogic],
    });
    // Optionally, set the newly created config as the selected one:
    setSelectedLogic(newExtractionLogic);
    // Reset creation form state
    setNewExtractionLogicName('');
    setNewExtractionConfigs([]);
    setCreatingNewVersion(false);
  };

  // New function to simulate activating the selected extraction config
  const handleActivateLogic = async () => {
    if (!selectedLogic) return;
    if (!documentType) return;
    setActivationLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Mock API success: alert the user that the logic has been activated
      alert(`Activated ${selectedLogic.name} version V${selectedLogic.version}`);

      // Optionally update the documentType state to mark the selected logic as active,
      // and ensure other logics are marked as not active.
      const updatedExtractionLogics = documentType.extraction_logics.map((logic) =>
        logic.id === selectedLogic.id ? { ...logic, is_active: true } : { ...logic, is_active: false }
      );
      setDocumentType({ ...documentType, extraction_logics: updatedExtractionLogics });
    } catch (error) {
      console.error("Error activating logic:", error);
    } finally {
      setActivationLoading(false);
    }
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
      {/* Document Type Header Section with Edit Icon */}
      <Card>
        <CardHeader className="flex-row  items-center">
          <CardTitle className="text-2xl font-bold">
            {documentType.name}
          </CardTitle>
          <Button variant="ghost" onClick={() => setShowEditModal(true)}>
            <Edit size={20} />
          </Button>
        </CardHeader>
        <CardContent>
          {documentType.description && (
            <p className="text-muted-foreground">
              {documentType.description}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Run Extraction Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Run Extraction</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Combined document select and search in a single component */}
          <div className="mb-4">
            <Label htmlFor="extraction-document-select" className="block mb-2">
              Select Document
            </Label>
            <Select
              value={selectedDocumentForExtraction ? selectedDocumentForExtraction.id : ""}
              onValueChange={(value) => {
                const foundDoc = availableDocuments.find(doc => doc.id === value);
                setSelectedDocumentForExtraction(foundDoc || null);
              }}
            >
              <SelectTrigger id="extraction-document-select" className="w-full">
                <SelectValue placeholder="Search & select a document" />
              </SelectTrigger>
              <SelectContent>
                {/* Search input embedded in the dropdown */}
                <div className="p-2">
                  <Input
                    autoFocus
                    placeholder="Type to search..."
                    value={extractionSearchQuery}
                    onChange={(e) => setExtractionSearchQuery(e.target.value)}
                  />
                </div>
                {availableDocuments
                  .filter(doc =>
                    doc.name.toLowerCase().includes(extractionSearchQuery.toLowerCase())
                  )
                  .map(doc => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          {/* Select an extraction config version */}
          <div className="mb-4">
            <Label htmlFor="extraction-config-run" className="block mb-2">
              Select Extraction Config Version
            </Label>
            <Select
              value={selectedRunExtractionLogic ? selectedRunExtractionLogic.id : ""}
              onValueChange={(value) => {
                const foundLogic = documentType.extraction_logics.find(
                  (logic: any) => logic.id === value
                );
                setSelectedRunExtractionLogic(foundLogic || null);
              }}
            >
              <SelectTrigger id="extraction-config-run" className="w-full">
                <SelectValue placeholder="-- Select a Config Version --" />
              </SelectTrigger>
              <SelectContent>
                {documentType.extraction_logics.map((logic: any) => (
                  <SelectItem key={logic.id} value={logic.id}>
                    {logic.name} - V{logic.version}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleExecuteExtraction}
            disabled={!selectedDocumentForExtraction || !selectedRunExtractionLogic || extractionLoading}
          >
            Run Extraction
          </Button>

          {/* Display extraction results */}
          <div className="mt-4">
            {extractionLoading && <div>Running extraction...</div>}
            {extractionResponse && (
              <Table className="mt-4 min-w-full">
                <TableHeader className="bg-gray-100">
                  <TableRow>
                    {extractionResponse.extracted_columns.map((col: string, idx: number) => (
                      <TableHead key={idx} className="p-2 text-left">
                        {col}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extractionResponse.extracted_table_body.map((row: any, rowIndex: number) => (
                    <TableRow key={rowIndex} className="border-t">
                      {extractionResponse.extracted_columns.map((col: string, colIndex: number) => (
                        <TableCell key={colIndex} className="p-2">
                          {row[col]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
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
          <div className="flex items-center justify-between mb-4">
            <Label htmlFor="extraction-config" className="mb-2 block">
              Select Extraction Config
            </Label>
            <Button onClick={() => setCreatingNewVersion((prev) => !prev)}>
              {creatingNewVersion ? "Cancel" : "Create New Version"}
            </Button>
          </div>

          {creatingNewVersion && (
            <div className="p-4 mb-4 border rounded">
              <div className="mb-4">
                <Label htmlFor="new-version-name" className="block mb-1">New Extraction Config Name</Label>
                <Input 
                  id="new-version-name" 
                  value={newExtractionLogicName} 
                  onChange={(e) => setNewExtractionLogicName(e.target.value)} 
                  placeholder="Enter new extraction config name" 
                />
              </div>
              <div className="mb-4">
                <Button onClick={handleAddNewConfigRow}>Add Config Row</Button>
              </div>
              {newExtractionConfigs.map((config, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <Input 
                    placeholder="Field Name" 
                    value={config.name} 
                    onChange={(e) => handleNewConfigRowChange(idx, 'name', e.target.value)}
                  />
                  <Input 
                    placeholder="Extraction Question" 
                    value={config.question} 
                    onChange={(e) => handleNewConfigRowChange(idx, 'question', e.target.value)}
                  />
                  <Button variant="destructive" size="sm" onClick={() => handleRemoveConfigRow(idx)}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button onClick={handleSaveNewExtractionVersion}>Save New Version</Button>
            </div>
          )}

          {/* Dropdown for selecting an extraction config */}
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

          {/* Show detailed information of the selected extraction config */}
          {selectedLogic && (
            <Card className="shadow-md flex mt-4">
              <CardHeader>
                <CardTitle>{selectedLogic.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 py-0 justify-center">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-muted-foreground">Version:</span>
                  <Badge variant="secondary">V{selectedLogic.version}</Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-muted-foreground">Last Updated:</span>
                  <span className="text-sm">
                    {new Date(selectedLogic.last_updated_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleActivateLogic}
                  disabled={activationLoading}
                  className="mt-2"
                >
                  {activationLoading ? "Activating..." : "Activate Logic"}
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Table display of extraction config fields */}
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
          {/* Added Search Bar for Sample Documents */}
          <div className="flex space-x-2 mb-4">
            <Input
              value={sampleDocSearchQuery}
              onChange={(e) => setSampleDocSearchQuery(e.target.value)}
              placeholder="Search sample documents"
            />
            <Button onClick={handleAddSampleDocument}>Add Document</Button>
          </div>

          {/* Filter the sample documents based on the search query */}
          {sampleDocuments.filter((doc) =>
            doc.name.toLowerCase().includes(sampleDocSearchQuery.toLowerCase())
          ).length > 0 ? (
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left p-2">Name</TableHead>
                  <TableHead className="text-left p-2">Uploaded At</TableHead>
                  <TableHead className="text-left p-2">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleDocuments
                  .filter((doc) =>
                    doc.name.toLowerCase().includes(sampleDocSearchQuery.toLowerCase())
                  )
                  .map((doc) => (
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
            <p>No sample documents found.</p>
          )}
        </CardContent>
      </Card>

      {/* Render the DocumentTypeModal when editing */}
      {showEditModal && (
        <DocumentTypeModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          docType={documentType}
          onSave={(updatedDocType: DocumentType) => {
            // Update the document type state with the new values
            setDocumentType(updatedDocType);
          }}
        />
      )}
    </div>
  );
} 