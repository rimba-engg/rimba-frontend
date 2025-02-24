'use client';
import { useState, useEffect, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Search, Filter, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatCard } from '@/components/ui/statcard';
import { api,BASE_URL } from '@/lib/api'; // Adjust the import path as necessary
import { MONTHS } from '@/lib/constants';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ExtractionData {
  document_id: string;
  document_name: string;
  status: string;
  [key: string]: string | number | undefined;
}

interface ApiResponse {
  status: string;
  message: string;
  data: {
    document_types: string[];
    merged_data: Record<string, ExtractionData[]>;
    MONTHS: string[];
    current_month: string;
    total_weight_oil_received: number;
    total_supplier_weight: number;
    current_year: number;
    YEARS: number[];
  };
}

// Update the fetchExtractions function to use the real API
const fetchExtractions = async (month: number, year: number): Promise<ApiResponse> => {
  try {
    month = month + 1;
    const response = await api.get<ApiResponse>(`/v2/extractions/?current_year=${year}&current_month=${month}`);
    return response;
  } catch (error: any) {
    console.error('Error fetching extractions:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch extractions');
  }
};

export default function ExtractionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('3'); // Default to APRIL
  const [selectedYear, setSelectedYear] = useState<number>(2024); // Default to 2024
  const [selectedDocType, setSelectedDocType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [extractionData, setExtractionData] = useState<ApiResponse['data'] | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Add useEffect hook to load data on mount
  useEffect(() => {
    loadExtractions();
  }, []); // Empty dependency array runs only once on mount

  const loadExtractions = async () => {
    try {
      setLoading(true);
      const monthIndex = parseInt(selectedMonth);
      const response = await fetchExtractions(monthIndex, selectedYear);
      setExtractionData(response.data);
      if (response.data.document_types.length > 0) {
        setSelectedDocType(response.data.document_types[0]);
      }
    } catch (error) {
      console.error('Failed to fetch extractions:', error);
    } finally {
      setLoading(false);
    }
  };
  

  const handleFilter = async () => {
    await loadExtractions();
  };

  

  const handleDocumentClick = (documentId: string) => {
    router.push(`/library/document?document_id=${documentId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'RECONCILED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredData =
    extractionData?.merged_data[selectedDocType]?.filter((item) =>
      Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    ) || [];

  // Get all unique headers for the selected document type
  const headers = useMemo(() => {
    if (!extractionData?.merged_data[selectedDocType]) return [];
    const allKeys = extractionData.merged_data[selectedDocType].flatMap(item => 
      Object.keys(item).filter(key => key !== 'document_id')
    );
    return Array.from(new Set(allKeys));
  }, [selectedDocType, extractionData]);

  // Render table body rows
  const renderTableBody = () => {
    return extractionData?.merged_data[selectedDocType]?.map((item, index) => (
      <TableRow 
        key={index}
        onClick={() => handleDocumentClick(item.document_id)}
        className="hover:bg-gray-50 cursor-pointer"
      >
        {headers.map(header => (
          <TableCell key={header} className="min-w-[200px]">
            {item[header as keyof typeof item] || '-'}
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      console.log('Exporting data for:', selectedDocType, selectedMonth, selectedYear);
      
      const response = await fetch(`${BASE_URL}/v2/extractions/download/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          month: Number(selectedMonth) + 1,
          year: selectedYear,
          document_type: selectedDocType
        })
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedDocType}_${MONTHS[Number(selectedMonth)]}_${selectedYear}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Document Extractions</h1>
          <p className="text-muted-foreground mt-2">
            View and manage extracted document data and results.
          </p>
        </div>
        <Button 
          onClick={handleExportData}
          variant="outline" 
          className="ml-auto h-8"
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin text-green-500" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </>
          )}
        </Button>
      </div>

      {/* Filter & Search Section */}
      <div className="bg-card rounded-lg shadow">
        <div className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            {/* Filter Selections */}
            <div className="flex flex-col md:flex-row gap-4">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedYear?.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({length: 10}, (_, i) => 2024 - i).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {extractionData?.document_types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={handleFilter}>
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search extractions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full md:w-[300px]"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="relative max-w-[calc(100vw-2rem)] -mx-4">
            {loading && (
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                <div className="flex justify-center items-center">
                  <div className="spinner"></div>
                  <span className="ml-2">Loading extractions...</span>
                </div>
              </div>
            )}

            {/* Scrollable Table Section */}
            <div className="overflow-x-auto px-4">
              <Table>
                <TableHeader className="bg-white">
                  <TableRow>
                    {headers.map(header => (
                      <TableHead 
                        key={header} 
                        className="min-w-[200px] bg-white sticky top-0"
                      >
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {renderTableBody()}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-left-color: #10b981; /* Changed from #4f46e5 to green-400 */
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
