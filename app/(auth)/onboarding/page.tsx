'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Upload, Users, Factory, Store, MapPin, FileText } from 'lucide-react';

const programs = [
  { id: 'rfs', name: 'RFS - Renewable Fuel Standard' },
  { id: 'lcfs', name: 'LCFS - Low Carbon Fuel Standard' },
  { id: 'red2', name: 'RED 2.0 - Renewable Energy Directive' },
  { id: 'sb253', name: 'SB-253 - Climate Corporate Data Accountability Act' },
];

export default function OnboardingPage() {
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [gallery, setGallery] = useState<File[]>([]);

  const handleProgramToggle = (programId: string) => {
    setSelectedPrograms(prev =>
      prev.includes(programId)
        ? prev.filter(id => id !== programId)
        : [...prev, programId]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'suppliers' | 'buyers' | 'gallery') => {
    const files = e.target.files;
    if (!files) return;

    if (type === 'gallery') {
      setGallery(prev => [...prev, ...Array.from(files)]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Company Onboarding</h1>
        <p className="text-muted-foreground mt-2">
          Complete your company profile to get started with compliance management.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-6 bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Basic Information
          </h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                placeholder="Enter your company name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Company Address</Label>
              <Input
                id="address"
                placeholder="Enter company address"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Company Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your company's operations and sustainability goals"
              className="h-32"
              required
            />
          </div>
        </div>

        {/* Business Relations */}
        <div className="space-y-6 bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Business Relations
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="suppliers">Supplier List</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="suppliers"
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={(e) => handleFileUpload(e, 'suppliers')}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                <Factory className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Upload a CSV or Excel file with your supplier list</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyers">Buyer List</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="buyers"
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={(e) => handleFileUpload(e, 'buyers')}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                <Store className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Upload a CSV or Excel file with your buyer list</p>
            </div>
          </div>
        </div>

        {/* Compliance Programs */}
        <div className="space-y-6 bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Compliance Programs
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {programs.map((program) => (
              <button
                key={program.id}
                type="button"
                onClick={() => handleProgramToggle(program.id)}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  selectedPrograms.includes(program.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-medium">{program.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Supporting Documentation */}
        <div className="space-y-6 bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Supporting Documentation
          </h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gallery">Document Gallery</Label>
              <Input
                id="gallery"
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={(e) => handleFileUpload(e, 'gallery')}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              <p className="text-sm text-muted-foreground">Upload any supporting documentation (permits, certificates, etc.)</p>
            </div>

            {gallery.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {gallery.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded-md bg-muted">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm truncate">{file.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">
            Save as Draft
          </Button>
          <Button type="submit">
            Complete Onboarding
          </Button>
        </div>
      </form>
    </div>
  );
}