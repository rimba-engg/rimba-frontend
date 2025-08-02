'use client';

import { useState, useEffect } from 'react';
import { getStoredCustomer } from '@/lib/auth';
import { ToastContainer, toast } from 'react-toastify';
import { ClockIcon, Factory, Calendar, Upload, X } from 'lucide-react';
import { InsightLoader } from '@/components/ui/loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DataSubstitutionEntry {
  start_timestamp: string;
  end_timestamp: string;
  missing_duration: number;
  missing_sensors: string[];
  substitution_method: string;
  substituted_by: string;
}

// Mock data for Demo-RNG
const MOCK_DATA: DataSubstitutionEntry[] = [
  {
    start_timestamp: '2024-03-20 14:00:00',
    end_timestamp: '2024-03-20 16:00:00',
    missing_duration: 120,
    missing_sensors: ['Tox(ppb)'],
    substitution_method: 'Pending',
    substituted_by: '-'
  },
  {
    start_timestamp: '2024-03-21 09:00:00',
    end_timestamp: '2024-03-21 11:00:00',
    missing_duration: 120,
    missing_sensors: ['Tox(ppb)'],
    substitution_method: 'Pending',
    substituted_by: '-'
  }
];

export default function DataSubstitutionPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [isDemo, setIsDemo] = useState(false);
  const [data, setData] = useState<DataSubstitutionEntry[]>([]);
  const [substituteModalOpen, setSubstituteModalOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const customer = getStoredCustomer();
    setIsDemo(customer?.name === 'Demo-RNG');
    if (customer?.name === 'Demo-RNG') {
      setData(MOCK_DATA);
    }
  }, []);

  useEffect(() => {
    const storedSite = localStorage.getItem('selected_site');
    if (storedSite) {
      try {
        const siteData = JSON.parse(storedSite);
        if (siteData.name) {
          setSelectedSite(siteData.name);
        }
      } catch (e) {
        console.error('Error parsing stored site:', e);
      }
    }

    const handleSiteChange = (event: any) => {
      const { site } = event.detail;
      setSelectedSite(site.name);
    };
    
    window.addEventListener('siteChange', handleSiteChange);
    return () => window.removeEventListener('siteChange', handleSiteChange);
  }, []);

  // Helper function to format duration
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Handle substitute button click
  const handleSubstituteClick = (rowIndex: number) => {
    setSelectedRowIndex(rowIndex);
    setSubstituteModalOpen(true);
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  // Handle form submission
  const handleSubmitSubstitution = async () => {
    if (!uploadedFile || selectedRowIndex === null) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);
    try {
      // Mock successful upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update mock data
      const newData = [...data];
      newData[selectedRowIndex] = {
        ...newData[selectedRowIndex],
        substitution_method: 'File Upload',
        substituted_by: 'Current User'
      };
      setData(newData);
      
      toast.success('Data substituted successfully');
      setSubstituteModalOpen(false);
      setUploadedFile(null);
      setSelectedRowIndex(null);
    } catch (error) {
      toast.error('Failed to substitute data');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="flex flex-row items-center gap-4 bg-white p-8 rounded-lg shadow-lg">
          <InsightLoader size="default" />
          <div className="text-lg font-medium">Loading data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Data Substitution</h1>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Substitution Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-white">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Start Time</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>End Time</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                    <div className="flex items-center justify-center space-x-2">
                      <Factory className="h-4 w-4" />
                      <span>Missing Sensors</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                    <div className="flex items-center justify-center space-x-2">
                      <ClockIcon className="h-4 w-4" />
                      <span>Missing Duration</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                    Substitution Method
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                    Substituted By
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isDemo ? (
                  data.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.start_timestamp}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.end_timestamp}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-900">
                        {item.missing_sensors.join(', ')}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-900">
                        {formatDuration(item.missing_duration)}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-900">
                        {item.substitution_method}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-900">
                        {item.substituted_by}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.substitution_method === 'Pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSubstituteClick(index)}
                            className="bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Substitute
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* File Upload Modal */}
      <Dialog open={substituteModalOpen} onOpenChange={setSubstituteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload Substitution Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Select file to upload</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                disabled={uploading}
              />
              {uploadedFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Selected: {uploadedFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUploadedFile(null)}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>Accepted formats: CSV, Excel (.xlsx, .xls)</p>
              <p>File should contain the substitution data values.</p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSubstituteModalOpen(false);
                  setUploadedFile(null);
                  setSelectedRowIndex(null);
                }}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitSubstitution}
                disabled={!uploadedFile || uploading}
              >
                {uploading ? (
                  <>
                    <InsightLoader size="default" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload & Substitute
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ToastContainer />
    </div>
  );
} 