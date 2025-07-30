'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';

export default function NewSupportTicketPage() {
  const router = useRouter();
  const [type, setType] = useState<'bug' | 'feature' | 'praise' | 'other'>('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/v2/supportTicket/', {
        type,
        title,
        description,
        priority,
        environment: 'prod',
      });
      router.push('/support');
    } catch (err: any) {
      alert(err?.message || 'Failed to create ticket');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Create Support Ticket</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <Select value={type} onValueChange={(v) => setType(v as any)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bug">Bug</SelectItem>
              <SelectItem value="feature">Feature</SelectItem>
              <SelectItem value="praise">Praise</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Summary</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <Textarea rows={6} value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
} 