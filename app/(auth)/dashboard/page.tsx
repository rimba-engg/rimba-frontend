'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, FileText } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { api } from '@/lib/api';
import { Loader } from '@/components/ui/loader';

const programs = [
  { id: 'rfs', name: 'RFS - Renewable Fuel Standard', description: 'Federal program requiring renewable fuel to be blended into transportation fuel' },
  { id: 'lcfs', name: 'LCFS - Low Carbon Fuel Standard', description: 'California program designed to decrease carbon intensity of transportation fuel' },
  { id: 'red2', name: 'RED 2.0 - Renewable Energy Directive', description: 'EU framework for promoting renewable energy production and use' },
  { id: 'sb253', name: 'SB-253 - Climate Corporate Data Accountability Act', description: 'California law requiring disclosure of greenhouse gas emissions' },
  { id: 'iscc', name: 'ISCC - International Sustainability & Carbon Certification', description: 'Global certification system for sustainable and traceable supply chains' },
  { id: 'ins', name: 'INS - Italian National Scheme', description: 'National standard system for quality assurance and certification for sustainable biofuels/bioliquids sold to Italy' }
];

export default function DashboardPage() {
  type CustomerData = {
    description: string;
    websites: string[];
    name: string;
  };

  type CustomerResponse = {
    message: string;
    data: CustomerData;
    status: string;
  };

  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [websites, setWebsites] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchCustomer = async () => {
    try {
      const response = await api.get<CustomerResponse>('/v2/customer/');
      if (response?.data) {
        setDescription(response.data.description || '');
        setWebsites(response.data.websites || []);
        setName(response.data.name || '');
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, []);

  const handleProgramToggle = (programId: string) => {
    setSelectedPrograms(prev =>
      prev.includes(programId)
        ? prev.filter(id => id !== programId)
        : [...prev, programId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await api.post('/v2/customer/', { description, websites });
      console.log('Customer updated successfully:', response);
      await fetchCustomer();
    } catch (error) {
      console.error('Error updating customer:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
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
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="address">Company Address</Label>
              <Input
                id="address"
                placeholder="Enter company address"
              />
            </div> */}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Company Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your company's operations and sustainability goals"
              className="h-32"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Websites</Label>
            {websites.map((website, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  id={`website-${index}`}
                  placeholder="Enter website URL"
                  value={website}
                  onChange={(e) => {
                    const updatedWebsites = [...websites];
                    updatedWebsites[index] = e.target.value;
                    setWebsites(updatedWebsites);
                  }}
                />
                <Button
                  variant="destructive"
                  type="button"
                  onClick={() => setWebsites(websites.filter((_, i) => i !== index))}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button onClick={() => setWebsites([...websites, ''])} type="button">
              Add Website
            </Button>
          </div>
        </div>

        {/* Compliance Programs */}
        <div className="space-y-6 bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Compliance Programs
          </h2>
          
          <div className="space-y-2">
            <Label>Select the compliance programs you're interested in:</Label>
            <div className="grid gap-4">
              {programs.map((program) => (
                <div
                  key={program.id}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    selectedPrograms.includes(program.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={program.id}
                      checked={selectedPrograms.includes(program.id)}
                      onCheckedChange={() => handleProgramToggle(program.id)}
                    />
                    <div className="space-y-1">
                      <label
                        htmlFor={program.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {program.name}
                      </label>
                      <p className="text-sm text-muted-foreground">
                        {program.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          {isSaving ? (
            <Loader size="sm" text="Saving..." className="px-6 py-2" />
          ) : (
            <Button type="submit">
              Save
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}