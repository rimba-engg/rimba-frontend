'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  Share2,
  MoreVertical,
  FileText,
  Calendar,
  User,
  Tag,
  Clock,
  Save,
  Plus,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { MONTHS } from '@/lib/constants';

interface Comment {
  id: number;
  user: string;
  avatar: string;
  text: string;
  timestamp: string;
}

interface VersionHistoryEntry {
  version: number;
  updated_at: string;
  updated_by: string;
  extracted_data: Record<string, any>[];
}


interface DocumentDetails {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  uploadedBy: string;
  status: string;
  tags: string[];
  description: string;
  version: number; // numeric version
  lastModified: string;
  document_preview_url: string;
  comments: Comment[];
  review_reasons: string[];
  extracted_data: Record<string, any>[];
  version_history: VersionHistoryEntry[];
  for_year: number;
  for_month: number;
}

export default function DocumentClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [documentDetails, setDocumentDetails] = useState<DocumentDetails | null>(
    null
  );
  const [newComment, setNewComment] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedRows, setEditedRows] = useState<Array<Record<string, any>>>([]);

  
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [selectedVersionData, setSelectedVersionData] = useState<
    Array<Record<string, any>>
  >([]);

  const [compareCurrent, setCompareCurrent] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const [isUpdating, setIsUpdating] = useState(false);

  const [isLoading, setIsLoading] = useState(true);  // Add loading state

  const [selectedType, setSelectedType] = useState<string>(documentDetails?.type || "");

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      console.log('fetching document details');
      const documentId = searchParams.get('document_id');
      if (documentId) {
        try {
          const response = await api.get(`/v2/document/detail/${documentId}/`);
          console.log(response);

          if ((response as any).status === 'success') {
            const doc = (response as any).data.document;
            console.log(doc.for_month);
            console.log(doc.for_year);
            // Build DocumentDetails object
            const docDetails: DocumentDetails = {
              id: doc.id,
              name: doc.name,
              for_year: parseInt(doc.for_year, 10),
              for_month: doc.for_month - 1,
              type: doc.document_type,
              uploadDate: doc.last_updated_at,
              uploadedBy: doc.last_uploaded_by,
              status: doc.status,
              tags: doc.metadata.contract_numbers ?? [],
              description: '', // If your API returns a description, map it here
              version: doc.version, // numeric
              lastModified: doc.last_updated_at,
              document_preview_url: doc.preview_url,
              comments: [], // If your API returns comments, map them
              review_reasons: doc.review_reasons ?? [],
              extracted_data: doc.extracted_data ?? [],
              version_history: doc.version_history ?? [],
            };
            setDocumentDetails(docDetails);
            setSelectedType(doc.document_type);
            // Initialize selected year/month with document's values
            setSelectedYear(doc.for_year?.toString() ?? null);
            setSelectedMonth(doc.for_month ?? null);
            setEditedRows(docDetails.extracted_data);
          } else {
            console.error(
              'Error fetching document details:',
              (response as any).message
            );
            setDocumentDetails(null);
          }
        } catch (error) {
          console.error('Error fetching document details:', error);
          setDocumentDetails(null);
        } finally {  // Add finally block
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchDocumentDetails();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="spinner mr-2"></div>
        <p className="text-muted-foreground mt-4">Loading document...</p>
      </div>
    );
  }

  if (!documentDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <FileText className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Document Not Found</h1>
        <p className="text-muted-foreground mb-4">
          The document couldn't be loaded. It may not exist or you don't have permission to view it.
        </p>
        <Button onClick={() => router.push('/documents')}>Back to Documents</Button>
      </div>
    );
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setNewComment('');
  };


  const handleBack = () => {
    router.back();
  };

  const openModal = () => {
    setIsModalOpen(true);
    setSelectedVersion(documentDetails.version);
    setSelectedVersionData(documentDetails.extracted_data);
    setSelectedYear(documentDetails.for_year.toString());
    setSelectedMonth(documentDetails.for_month);
    setCompareCurrent(false);
    setIsEditing(false);
  };

  const closeModal = () => {
    if (isEditing) {
      setEditedRows(documentDetails.extracted_data);
    }
    setIsModalOpen(false);
    setIsEditing(false);
    setSelectedYear(null);
    setSelectedMonth(null);
  };

  // -----------------------------------------------------------
  // Building the version list for the modal
  // -----------------------------------------------------------
  // The doc's version is the newest. The version_history are older ones.
  // We'll create an array with doc.version first => then older versions in descending order
  // Or ascending. Up to you. We'll do ascending for clarity: 1,2,..., doc.version
  // But the doc's version data is not in version_history. It's the "document's extracted_data".
  const allVersions = [
    ...documentDetails.version_history.map((v) => v.version),
    documentDetails.version, // The last item is the *current* version
  ].sort((a, b) => a - b); // ensures ascending order

  // -----------------------------------------------------------
  // Version selection logic
  // -----------------------------------------------------------
  const handleSelectVersion = (versionNum: number) => {
    // If user tries to pick an older version while editing the current version, confirm:
    if (isEditing && versionNum !== documentDetails.version) {
      const proceed = confirm(
        'You have unsaved changes to the current version. Selecting another version discards them. Proceed?'
      );
      if (!proceed) return;
    }

    setSelectedVersion(versionNum);

    // If it's the doc's current version => data is doc.extracted_data
    if (versionNum === documentDetails.version) {
      setSelectedVersionData(documentDetails.extracted_data);
      // user can edit only the current version
      setIsEditing(false); // they must click "Edit Data" again to actually edit
    } else {
      // It's an older version => find it in version_history
      const older = documentDetails.version_history.find(
        (v) => v.version === versionNum
      );
      if (older) {
        setSelectedVersionData(older.extracted_data);
      }
      // older version => read-only (disable editing)
      setIsEditing(false);
    }
    setCompareCurrent(false);
    setSelectedYear(null);
    setSelectedMonth(null);
  };

  // If we want to compare side-by-side older version + current version, we toggle compareCurrent:
  const handleToggleCompare = () => {
    setCompareCurrent(!compareCurrent);
  };

  // -----------------------------------------------------------
  // Build a set of all keys across whichever "selectedVersionData" we show
  // plus "editedRows" if we are comparing. That ensures columns from both sets:
  // -----------------------------------------------------------
  const buildKeySet = () => {
    let combinedRows = selectedVersionData;
    if (compareCurrent && selectedVersion !== documentDetails.version) {
      combinedRows = [...combinedRows, ...editedRows];
    }
    const keys = combinedRows.reduce((acc: Set<string>, row: Record<string, any>) => {
      Object.keys(row).forEach((k) => acc.add(k));
      return acc;
    }, new Set<string>());
    return Array.from(keys);
  };
  const allKeys = buildKeySet();

  // -----------------------------------------------------------
  // Editing logic (only for current version)
  // -----------------------------------------------------------
  const toggleEdit = () => {
    if (!isEditing) {
      // Only allow if selectedVersion is doc.version
      if (selectedVersion === documentDetails.version) {
        // going to edit mode, ensure editedRows matches the doc's extracted_data
        setEditedRows(documentDetails.extracted_data);
        setIsEditing(true);
      } else {
        alert('You can only edit the latest version');
      }
    } else {
      // Cancel editing
      setEditedRows(documentDetails.extracted_data);
      setIsEditing(false);
    }
  };

  const handleCellChange = (rowIndex: number, key: string, value: string) => {
    setEditedRows((prev) => {
      const updated = [...prev];
      updated[rowIndex] = {
        ...updated[rowIndex],
        [key]: value,
      };
      return updated;
    });
  };

  const handleDeleteRow = (rowIndex: number) => {
    setEditedRows(prev => prev.filter((_, index) => index !== rowIndex));
  };

  const handleAddRow = () => {
    setEditedRows(prev => {
      // Create a new empty row with all keys initialized to empty string
      const newRow = allKeys.reduce((acc, key) => ({ ...acc, [key]: '' }), {});
      return [...prev, newRow];
    });
  };

const handleUpdateData = async () => {
  const documentId = searchParams.get('document_id');
  console.log(documentId);
  console.log(editedRows);
  
  if (!documentId) {
    alert('Document ID not found');
    return;
  }

  setIsUpdating(true);  // Start loading
  try {
    const payload = {
      document_id: documentId,
      extracted_data: editedRows,
      document_type: selectedType,
      document_year: selectedYear,
      document_month: selectedMonth !== null ? MONTHS[selectedMonth] : null
    };

    const response = await api.post('/v2/document/update/', payload);


    console.log(response);

    if ((response as any).status === 'success') {
      // Update local state with new data
      setDocumentDetails(prev => 
        prev ? {...prev, extracted_data: editedRows} : null
      );
      setSelectedVersionData(editedRows);
      setIsEditing(false);
      alert('Data updated successfully');
    } else {
      console.error('Update failed:', (response as any).message);
      alert('Failed to update data');
    }
  } catch (error) {
    console.error('Error updating data:', error);
    alert('Error updating data. Please try again.');
  } finally {
    setIsUpdating(false);  // End loading regardless of success/error
  }
};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold">{documentDetails.name}</h1>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left/Middle Column */}
        <div className="col-span-2 space-y-6">
          {/* Document Preview */}
          <div className="bg-card rounded-lg shadow p-6 min-h-[600px] flex flex-col relative">
            {documentDetails.document_preview_url ? (
              <>
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                    documentDetails.document_preview_url
                  )}&embedded=true`}
                  className="flex-1 w-full h-full"
                  title="Document Preview"
                  style={{ border: 'none' }}
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      window.open(documentDetails.document_preview_url, '_blank')
                    }
                    className="bg-green-50"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Document preview not available
                </p>
              </div>
            )}
          </div>

          {/* Extracted Data Button (to open modal) */}
          <div className="bg-card rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-2">Extracted Data</h2>
            <p className="text-sm text-muted-foreground mb-4">
              View or edit the extracted data for Version {documentDetails.version}.
            </p>
            <Button onClick={openModal} className="bg-primary hover:bg-primary/90">
              View Extracted Data
            </Button>
          </div>

          {/* Comments Section */}
          <div className="bg-card rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Comments</h2>
            <div className="space-y-4">
              {documentDetails.comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <img
                    src={comment.avatar}
                    alt={comment.user}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <span className="font-medium">{comment.user}</span>
                        <span className="text-xs text-muted-foreground">
                          {comment.timestamp}
                        </span>
                      </div>
                      <p className="mt-1 text-sm">{comment.text}</p>
                    </div>
                  </div>
                </div>
              ))}
              {/* Add new comment */}
              <div className="flex gap-4">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop"
                  alt="Current user"
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="mb-2"
                  />
                  <Button onClick={handleAddComment}>Add Comment</Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Document Details Sidebar */}
        <div className="space-y-6">
          {/* Document Info Card */}
          <div className="bg-card rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-lg font-semibold">Document Details</h2>
              <div className="flex gap-2">
                {/* Removed Share2 and MoreVertical buttons */}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Upload Date:</span>
                <span>{documentDetails.uploadDate}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Uploaded By:</span>
                <span>{documentDetails.uploadedBy}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Type:</span>
                <span>{documentDetails.type}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Status:</span>
                <span>{documentDetails.status}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Last Modified:</span>
                <span>{documentDetails.lastModified}</span>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {documentDetails.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Review reasons (if any) */}
              {documentDetails.review_reasons.length > 0 && (
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium mb-2" style={{ color: 'red' }}>
                    Review Reasons
                  </h3>
                  <p className="text-sm text-muted-foreground" style={{ color: 'red' }}>
                    {documentDetails.review_reasons.join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Version History */}
          <div className="bg-card rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Version History</h2>
            <div className="space-y-2">
              {/* List out versions in ascending order */}
              {allVersions.map((v) => (
                <div key={v} className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      v === documentDetails.version ? 'bg-primary' : 'bg-muted-foreground'
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium">
                      Version {v}{' '}
                      {v === documentDetails.version && <span>(current)</span>}
                    </p>
                    {/* If we find a match in version_history, show updated_at */}
                    {v !== documentDetails.version ? (
                      <p className="text-xs text-muted-foreground">
                        Updated At:
                        {
                          documentDetails.version_history.find(
                            (hist) => hist.version === v
                          )?.updated_at
                        }
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Last Modified: {documentDetails.lastModified}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Extracted Data, showing selected version + optional compare */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative bg-white w-11/12 max-w-7xl p-4 rounded-lg shadow-lg">
            {/* Close Button */}
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl leading-none"
              onClick={closeModal}
            >
              &times;
            </button>

            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              {/* Version Selector */}
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold mr-2">Extracted Data</h2>
                <span className="text-sm">Select Version:</span>
                <select
                  className="border rounded p-1 text-sm"
                  value={selectedVersion ?? documentDetails.version}
                  onChange={(e) => handleSelectVersion(Number(e.target.value))}
                >
                  {allVersions.map((v) => (
                    <option key={v} value={v}>
                      Version {v}
                    </option>
                  ))}
                </select>
                
                {/* Add Year/Month selector */}
                <div className="ml-4 flex gap-2">
                  {/* Document Type Dropdown */}
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="border rounded p-1 text-sm"
                    disabled={!isEditing}
                  >
                    {[
                      "Bill Of Lading",
                      "Business Document",
                      "Delivery Note",
                      "SD INS",
                      "SD ISCC",
                      "SD ISCC Outgoing",
                      "WB Ticket",
                      "WeighBridge Ticket"
                    ].map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>

                  <select
                    value={selectedYear ?? documentDetails.for_year}
                    onChange={(e) => setSelectedYear((e.target.value))}
                    className="border rounded p-1 text-sm"
                  >
                    {Array.from({length: 11}, (_, i) => 2020 + i).map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  
                  <select
                    value={selectedMonth ?? documentDetails.for_month}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="border rounded p-1 text-sm"
                  >
                    {MONTHS.map((month, index) => (
                      <option key={month} value={index}>{month}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* If the selectedVersion is not the doc's current version and
                  the doc has multiple versions, we can compare with the current. */}
              {documentDetails.version_history.length > 0 && selectedVersion !== documentDetails.version && (
                <label className="flex items-center gap-1 ml-4">
                  <input
                    type="checkbox"
                    checked={compareCurrent}
                    onChange={handleToggleCompare}
                  />
                  <span className="text-sm">Compare with Version {documentDetails.version}</span>
                </label>
              )}

              {/* Edit / Save Buttons (only if selectedVersion == doc.version) */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={toggleEdit}>
                  {isEditing ? 'Cancel Edit' : 'Edit Data'}
                </Button>
                {isEditing && (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={handleAddRow}
                      className="ml-2"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Row
                    </Button>
                    <Button 
                      onClick={handleUpdateData} 
                      className="bg-primary hover:bg-primary/90"
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <div className="flex items-center">
                          <div className="spinner mr-2"></div>
                          Updating...
                        </div>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Update Data
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Build the table(s) with smaller row spacing, horizontally scrollable */}
            <div className="overflow-auto max-h-[70vh]">
              {/* Table for the SELECTED version */}
              <h3 className="mb-2 text-sm font-medium">
                Showing Version {selectedVersion}
                {selectedVersion === documentDetails.version ? ' (current)' : ''}
              </h3>
              <table className="w-full border-collapse text-sm table-auto whitespace-nowrap mb-8">
                <thead>
                  <tr className="border-b border-gray-300">
                    {allKeys.map((key) => (
                      <th 
                        key={key} 
                        className="py-2 px-3 text-left font-semibold min-w-[150px] whitespace-nowrap"
                      >
                        {key}
                      </th>
                    ))}
                    {isEditing && <th className="py-2 px-3 text-left font-semibold min-w-[100px]">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {(selectedVersion === documentDetails.version && isEditing
                    ? editedRows
                    : selectedVersionData
                  ).map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                    >
                      {allKeys.map((key) => {
                        const cellValue = row[key] !== undefined ? row[key] : '';
                        return (
                          <td 
                            key={key} 
                            className="py-2 px-3 align-top min-w-[150px] whitespace-nowrap"
                          >
                            {selectedVersion === documentDetails.version && isEditing ? (
                              <Input
                                value={cellValue}
                                onChange={(e) =>
                                  handleCellChange(rowIndex, key, e.target.value)
                                }
                                className="text-sm"
                              />
                            ) : (
                              cellValue
                            )}
                          </td>
                        );
                      })}
                      {isEditing && (
                        <td className="py-2 px-3 align-top">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteRow(rowIndex)}
                          >
                            Delete
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* If "compareCurrent" is true, show the doc.version side-by-side in a second table */}
              {compareCurrent && (
                <>
                  <h3 className="mb-2 text-sm font-medium">
                    Comparing with Version {documentDetails.version} (current)
                  </h3>
                  <table className="w-full border-collapse text-sm table-auto whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-gray-300">
                        {allKeys.map((key) => (
                          <th key={key} className="py-2 px-3 text-left font-semibold">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {documentDetails.extracted_data.map((row, rowIndex) => (
                        <tr
                          key={rowIndex}
                          className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                        >
                          {allKeys.map((key) => {
                            const cellValue = row[key] !== undefined ? row[key] : '';
                            // No editing for compare view
                            return (
                              <td key={key} className="py-2 px-3 align-top">
                                {cellValue}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-left-color: #4f46e5; /* Primary color */
          border-radius: 50%;
          width: 24px;
          height: 24px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}