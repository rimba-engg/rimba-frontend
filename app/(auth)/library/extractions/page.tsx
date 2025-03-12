'use client';
import { useState, useEffect, useMemo } from 'react';
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
  SelectLabel,
  SelectGroup,
} from '@/components/ui/select';
import { api, BASE_URL } from '@/lib/api'; // Adjust the import path as necessary
import { MONTHS as CONSTANT_MONTHS } from '@/lib/constants';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import QueryTable, { ColumnWithType } from '@/components/table/QueryTable';

interface DocumentType {
  id: string;
  name: string;
}

interface ExtractionData {
  document_id: string;
  document_name: string;
  status: string;
  [key: string]: string | number | undefined;
}

interface ApiResponseData {
  document_types: DocumentType[];
  merged_data: Record<string, ExtractionData[]>;
  MONTHS: string[];
  current_month: string;
  total_weight_oil_received: number;
  total_supplier_weight: number;
  current_year: number;
  YEARS: number[];
}

interface ApiResponse {
  status: string;
  message: string;
  data: ApiResponseData;
}

// Update the fetchExtractions function to use the real API
const fetchExtractions = async (month: number, year: number): Promise<ApiResponse> => {
  try {
    // Note: Add 1 to month since API expects a 1-indexed month.
    const response = await api.get<ApiResponse>(`/v2/extractions/?current_year=${year}&current_month=${month + 1}`);
    return response;
  } catch (error: any) {
    console.error('Error fetching extractions:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch extractions');
  }
};

export default function ExtractionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('3'); // Default to April (index 3 if months are 0-indexed)
  const [selectedYear, setSelectedYear] = useState<number>(2025); // Default to 2025
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | null>(null);
  const [extractionsData, setExtractionsData] = useState<ApiResponseData | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const [filteredRowData, setFilteredRowData] = useState<ExtractionData[]>([]);
  
  // Load extractions on mount
  useEffect(() => {
    loadExtractions();
  }, []); // Empty dependency array runs only once on mount

  const loadExtractions = async () => {
    console.log('loadExtractions: called with selectedMonth:', selectedMonth, 'selectedYear:', selectedYear);
    setLoading(true);
    try {
      const monthIndex = parseInt(selectedMonth);
      const response = await fetchExtractions(monthIndex, selectedYear);
      console.log('Fetched extractions response:', response);
      setExtractionsData(response.data);
      if (response.data.document_types.length > 0) {
        setSelectedDocType(response.data.document_types[0]);
      }
    } catch (error) {
      console.error('Error in loadExtractions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async () => {
    await loadExtractions();
  };

  // Use the merged data based on the selected document type id
  const rowData = extractionsData?.merged_data[selectedDocType?.name || ''] || [];

  const columnDefs = useMemo(() => {
    if (filteredRowData.length === 0) return [];
    const keys = Object.keys(filteredRowData[0]);
    return keys.map(key => ({ headerName: key, field: key, type: 'string' }));
  }, [filteredRowData]);

  // Added useEffect hooks for debugging state updates
  useEffect(() => {
    console.log('Extractions data updated:', extractionsData);
  }, [extractionsData]);

  useEffect(() => {
    console.log('Row data updated:', extractionsData?.merged_data[selectedDocType?.name || '']);
    setFilteredRowData(extractionsData?.merged_data[selectedDocType?.name || ''] || []);
  }, [extractionsData, selectedDocType]);

  useEffect(() => {
    // columnDefs is computed from rowData
    console.log('Column definitions updated:', columnDefs);
  }, [columnDefs]);

  return (
    <div className="space-y-6 mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Document Extractions</h1>
          <p className="text-muted-foreground mt-2">
            View and manage extracted document data and results.
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-card rounded-lg shadow">
        <div className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            {/* Only Filter Selections */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {CONSTANT_MONTHS.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => 2025 - i).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedDocType?.id} onValueChange={(value) => {
                const selectedDoc = extractionsData?.document_types.find(doc => doc.id === value);
                setSelectedDocType(selectedDoc || null);
              }}>
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {extractionsData?.document_types.map((docType) => (
                    <SelectItem key={docType.id} value={docType.id}>
                      {docType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleFilter}>
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container using QueryTable */}
      <div className="bg-card rounded-lg shadow p-4">
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="spinner" />
          </div>
        ) : (
          <QueryTable 
            key={`${selectedMonth}-${selectedYear}-${selectedDocType?.id}-${filteredRowData.length}`}
            initialRowData={filteredRowData}
            initialColumnDefs={columnDefs as ColumnWithType[]}
          />
        )}
      </div>

      <style jsx>{`
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-left-color: #10b981;
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
