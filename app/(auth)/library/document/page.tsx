'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Download, Share2, MoreVertical, FileText, Calendar, User, Tag, Clock, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';

interface Comment {
  id: number;
  user: string;
  avatar: string;
  text: string;
  timestamp: string;
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
  version: string;
  lastModified: string;
  document_preview_url: string;
  comments: Comment[];
  review_reasons: string[];
  extracted_data: [];
}


export default function DocumentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [documentDetails, setDocumentDetails] = useState<DocumentDetails | null>(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      console.log('fetching document details');
      const documentId = searchParams.get('document_id');
      console.log(documentId);
      if (documentId) {
        try {
          const response = await api.get(`/v2/document/${documentId}/`);
          console.log(response);

          if ((response as any).status === 'success') {
            const document = (response as any).data.document;
            const documentDetails: DocumentDetails = {
              id: document.id,
              name: document.name,
              type: document.document_type,
              uploadDate: document.last_updated_at,
              uploadedBy: document.last_uploaded_by,
              status: document.status,
              tags: document.metadata.contract_numbers, // Assuming tags are contract numbers
              description: '', // Add description if available in the response
              version: document.version.toString(),
              lastModified: document.last_updated_at,
              document_preview_url: document.preview_url,
              comments: [], // Add comments if available in the response
              review_reasons: document.review_reasons,
              extracted_data: document.extracted_data,
            };
            setDocumentDetails(documentDetails);
          } else {
            console.error('Error fetching document details:', (response as any).message);
            setDocumentDetails(null);
          }
        } catch (error) {
          console.error('Error fetching document details:', error);
          setDocumentDetails(null);
        }
      }
    };

    fetchDocumentDetails();
  }, [searchParams]);

  if (!documentDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <FileText className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Document Not Found</h1>
        <p className="text-muted-foreground mb-4">
          The document you're looking for doesn't exist or has been moved.
        </p>
        <Button onClick={() => router.push('/documents')}>
          Back to Documents
        </Button>
      </div>
    );
  }

  const handleBack = () => {
    router.back();
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    // Add comment logic here
    setNewComment('');
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold">{documentDetails.name}</h1>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Document Preview */}
          <div className="bg-card rounded-lg shadow p-6 min-h-[600px] flex flex-col relative">
            {documentDetails.document_preview_url ? (
              <>
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(documentDetails.document_preview_url)}&embedded=true`}
                  className="flex-1 w-full h-full"
                  title="Document Preview"
                  style={{ border: 'none' }}
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(documentDetails.document_preview_url, '_blank')}
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
          <div className="bg-card rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-lg font-semibold">Document Details</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
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

              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium mb-2" style={{ color: 'red' }}>Review Reasons</h3>
                <p className="text-sm text-muted-foreground" style={{ color: 'red' }}>
                  {documentDetails.review_reasons.join(', ')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Version History</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <div>
                  <p className="text-sm font-medium">Version {documentDetails.version}</p>
                  <p className="text-xs text-muted-foreground">Current version</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                <div>
                  <p className="text-sm font-medium">Version 1.1</p>
                  <p className="text-xs text-muted-foreground">2024-03-15 10:30</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                <div>
                  <p className="text-sm font-medium">Version 1.0</p>
                  <p className="text-xs text-muted-foreground">2024-03-15 09:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}