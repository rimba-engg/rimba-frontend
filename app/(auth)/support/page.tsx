'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

interface SupportTicket {
  id: string;
  customer_id?: string;
  submitted_by: {
    user_id?: string;
    name?: string;
    email?: string;
    [key: string]: any;
  };
  type: 'bug' | 'feature' | 'praise' | 'other';
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'new' | 'triaged' | 'in_progress' | 'shipped' | 'closed';
  environment?: 'prod' | 'staging';
  page_context?: string;
  triaged_by?: {
    user_id?: string;
    name?: string;
    [key: string]: any;
  };
  shipped_at?: string;
  internal_notes?: string;
  public_notes?: string;
  labels?: string[];
  comments: Array<{
    user?: string;
    comment: string;
    created_at: string;
    updated_at?: string;
  }>;
  created_at: string;
  updated_at?: string;
}

interface SupportTicketResponse {
  status: string;
  message: string;
  data: {
    supportTicket: SupportTicket[];
  };
}

interface SupportTicketCommentResponse {
  status: string;
  message: string;
  data: SupportTicket;
}

export default function SupportDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ticket_id = searchParams.get('ticket') as string | null;

  const [supportTickets, setSupportTickets] = useState<SupportTicket[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    type: 'feature',
  });

  console.log('supportTickets', supportTickets);
  console.log('ticket_id', ticket_id);

  const fetchSupportTickets = async () => {
    console.log('fetching support tickets');
    try {

      const response = await api.get<SupportTicketResponse>('/v2/supportTicket/');
      console.log('response', response);

      if (response.status === 'success') {
        setSupportTickets(response.data.supportTicket);
      } else {
        console.log('Error fetching support tickets', response.message);
      }
    } catch (err) {
      setError('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupportTickets();
  }, []);

  useEffect(() => {
    if (ticket_id && supportTickets && supportTickets.length > 0) {
      const found = supportTickets.find((t) => t.id === ticket_id);
      setSelectedTicket(found || null);
    } else {
      setSelectedTicket(null);
    }
  }, [ticket_id, supportTickets]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedTicket) return;
    setPosting(true);
    try {
      const res = await api.post<SupportTicketCommentResponse>(`/v2/supportTicket/${selectedTicket.id}/comment/`, {
        comment: newComment,
      });
      if (res.status === 'success') {
        setSelectedTicket(res.data);
        // update in the list as well
        setSupportTickets((prev) =>
          prev?.map((t) => (t.id === selectedTicket.id ? (res.data as SupportTicket) : t)) || null
        );
        setNewComment('');
      } else {
        alert(res.message || 'Failed to add comment');
      }
    } catch (err: any) {
      alert(err?.message || 'Error adding comment');
    } finally {
      setPosting(false);
    }
  };

  // Add create ticket handler
  const handleCreateTicket = async () => {
    if (!createForm.title.trim() || !createForm.description.trim()) return;
    setCreateLoading(true);
    setCreateError('');
    try {
      const res: any = await api.post('/v2/supportTicket/', {
        title: createForm.title,
        description: createForm.description,
        priority: createForm.priority,
        type: createForm.type,
      });
      if (res.status === 'success') {
        setShowCreate(false);
        setCreateForm({ title: '', description: '', priority: 'medium', type: 'other' });
        // refetch tickets
        const ticketsRes = await api.get<{ status: string; message: string; data: { support_tickets: SupportTicket[] } }>('/v2/supportTicket/');
        if (ticketsRes.status === 'success') {
          setSupportTickets(ticketsRes.data.support_tickets as SupportTicket[]);
        }
      } else {
        setCreateError(res.message || 'Failed to create ticket');
      }
    } catch (err: any) {
      setCreateError(err?.message || 'Error creating ticket');
    } finally {
      setCreateLoading(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-muted-foreground/10 text-muted-foreground';
    }
  };

  if (loading) {
    return <p className="p-6">Loading...</p>;
  }
  if (error) {
    return <p className="p-6 text-destructive-foreground">{error}</p>;
  }

  // If ticket_id is present, show only that ticket in an accordion
  if (ticket_id && selectedTicket) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Button variant="outline" className="mb-4" onClick={() => router.push('/support')}>Back to all tickets</Button>
        <Accordion type="single" collapsible defaultValue={selectedTicket.id}>
          <AccordionItem value={selectedTicket.id}>
            <AccordionTrigger>
              <div className="flex items-center gap-4">
                <span className="font-semibold">{selectedTicket.title}</span>
                <Badge className={statusColor(selectedTicket.status)}>{selectedTicket.status}</Badge>
                <span className="text-xs text-muted-foreground">{new Date(selectedTicket.created_at).toLocaleString()}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="mb-4">
                <p className="whitespace-pre-line text-sm">{selectedTicket.description}</p>
              </div>
              <div className="mb-4">
                <h2 className="font-medium mb-2">Comments</h2>
                <div className="space-y-4">
                  {selectedTicket.comments && selectedTicket.comments.length > 0 ? (
                    selectedTicket.comments.map((c, idx) => (
                      <div key={idx} className="border rounded p-3 text-sm">
                        <div className="flex justify-between text-xs mb-1 text-muted-foreground">
                          <span>{c.user}</span>
                          <span>{new Date(c.created_at).toLocaleString()}</span>
                        </div>
                        <p>{c.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No comments yet.</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Textarea
                  rows={4}
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button onClick={handleAddComment} disabled={posting || !newComment.trim()}>
                  {posting ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  }

  // Otherwise, show a table of all tickets
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Support Tickets</h1>
      <div className="mb-4 flex gap-2">
        <Button onClick={() => setShowCreate((v) => !v)} variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90">
          {showCreate ? 'Cancel' : 'Create Ticket'}
        </Button>
      </div>

      {showCreate && (
        <div className="mb-6 border rounded-lg p-4 bg-card max-w-xl">
          <div className="mb-2">
            <input
              className="w-full border rounded px-2 py-1 mb-2"
              placeholder="Title"
              value={createForm.title}
              onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))}
            />
            <Textarea
              className="mb-2"
              rows={3}
              placeholder="Description"
              value={createForm.description}
              onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
            />
            <div className="flex gap-2 mb-2">
              <select
                className="border rounded px-2 py-1"
                value={createForm.priority}
                onChange={e => setCreateForm(f => ({ ...f, priority: e.target.value }))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <select
                className="border rounded px-2 py-1"
                value={createForm.type}
                onChange={e => setCreateForm(f => ({ ...f, type: e.target.value }))}
              >
                <option value="bug">Bug</option>
                <option value="feature">Feature</option>
                <option value="praise">Praise</option>
                <option value="other">Other</option>
              </select>
            </div>
            <Button onClick={handleCreateTicket} disabled={createLoading || !createForm.title.trim() || !createForm.description.trim()}>
              {createLoading ? 'Creating...' : 'Submit'}
            </Button>
            {createError && <div className="text-destructive-foreground text-sm mt-2">{createError}</div>}
          </div>
        </div>
      )}

      {supportTickets && supportTickets.length === 0 && (
        <div className="p-6 max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[40vh]">
          <h2 className="text-xl font-semibold mb-4">No support tickets found!</h2>
          <div className="bg-card border rounded-lg p-4 text-center">
            <p className="text-lg mb-2">Here's a joke while you wait:</p>
            <p className="italic text-muted-foreground">
              Looks like you're the first one to submit a support ticket!
            </p>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-lg">
          <thead>
            <tr className="bg-muted-foreground/10">
              <th className="p-2 text-left">Title</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Priority</th>
              <th className="p-2 text-left">Created</th>
              <th className="p-2 text-left">Type</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(supportTickets) && supportTickets.map(ticket => (
              <tr key={ticket.id} className="border-b hover:bg-accent cursor-pointer">
                <td className="p-2 font-medium" onClick={() => router.push(`/support?ticket=${ticket.id}`)}>{ticket.title}</td>
                <td className="p-2"><Badge className={statusColor(ticket.status)}>{ticket.status}</Badge></td>
                <td className="p-2">{
                  ticket.priority === 'low' ? <Badge className="bg-green-100 text-green-800">Low</Badge> : ticket.priority === 'medium' ? <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge> : <Badge className="bg-red-100 text-red-800">High</Badge>
                }</td>
                <td className="p-2 text-xs">{new Date(ticket.created_at).toLocaleString()}</td>
                <td className="p-2">
                  <Button size="sm" variant="outline" onClick={() => router.push(`/support?ticket=${ticket.id}`)}>
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 