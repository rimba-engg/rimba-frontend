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
import { StatCard } from '@/components/ui/statcard';
import { api, BASE_URL } from '@/lib/api'; // Adjust the import path as necessary
import { MONTHS } from '@/lib/constants';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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
  const [selectedYear, setSelectedYear] = useState<number>(2025); // Default to 2025
  const [selectedDocType, setSelectedDocType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [extractionData, setExtractionData] = useState<ApiResponse['data'] | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  // Controls for modifying table view
  const [transpose, setTranspose] = useState(false);
  const [pivot, setPivot] = useState(false);

  // New states for custom pivot configuration
  const [pivotRowField, setPivotRowField] = useState<string>(''); // Field for rows
  const [pivotColumnField, setPivotColumnField] = useState<string>(''); // Field for columns
  const [pivotValueField, setPivotValueField] = useState<string>(''); // Field for values
  const [pivotAggregator, setPivotAggregator] = useState<string>('sum'); // "sum" or "count"

  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [selectedRowIndices, setSelectedRowIndices] = useState<number[]>([]);

  // Load extractions on mount
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
  console.log(filteredData);

  // Get all unique headers for the selected document type
  const headers = useMemo(() => {
    if (!extractionData?.merged_data[selectedDocType]) return [];
    const allKeys = extractionData.merged_data[selectedDocType].flatMap(item => 
      Object.keys(item).filter(key => key !== 'document_id')
    );
    return Array.from(new Set(allKeys));
  }, [selectedDocType, extractionData]);

  // For transposed view, compute the union of keys from only filtered data (excluding document_id and document_name)
  const transposedHeaders = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];
    const allKeys = filteredData.flatMap(item =>
      Object.keys(item).filter(key => key !== 'document_id' && key !== 'document_name')
    );
    return Array.from(new Set(allKeys));
  }, [filteredData]);

  // Compute pivot data for the simple pivot view (grouped by status)
  const pivotData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return {};
    return filteredData.reduce((acc, doc) => {
      const key = doc.status || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [filteredData]);

  // Compute custom pivot data using the selected pivot configuration
  const customPivotData = useMemo(() => {
    if (!pivot || !filteredData || !pivotRowField || !pivotColumnField) return null;
    // The result will be an object where each key is a unique row value and its value is an object (columns with aggregated values)
    const result: Record<string, Record<string, number>> = {};

    filteredData.forEach(item => {
      // Use optional chaining to safely call toString() if item[pivotRowField] is defined.
      const rowKey = item[pivotRowField]?.toString() ?? 'Unknown';
      const colKey = item[pivotColumnField]?.toString() ?? 'Unknown';

      if (!result[rowKey]) result[rowKey] = {};

      if (pivotAggregator === 'sum' && pivotValueField) {
        const value = Number(item[pivotValueField]) || 0;
        result[rowKey][colKey] = (result[rowKey][colKey] || 0) + value;
      } else if (pivotAggregator === 'count') {
        result[rowKey][colKey] = (result[rowKey][colKey] || 0) + 1;
      }
    });
    return result;
  }, [pivot, filteredData, pivotRowField, pivotColumnField, pivotValueField, pivotAggregator]);

  // Get pivot table columns based on the custom pivot data
  const pivotTableColumns = useMemo(() => {
    if (!customPivotData) return [];
    const columnsSet = new Set<string>();
    Object.values(customPivotData).forEach(rowData => {
      Object.keys(rowData).forEach(col => {
        columnsSet.add(col);
      });
    });
    return Array.from(columnsSet);
  }, [customPivotData]);

  // Filtering for normal view
  const displayedRows = filteredData.filter((row, idx) =>
    selectedRowIndices.length > 0 ? selectedRowIndices.includes(idx) : true
  );

  const displayedHeaders =
    selectedColumns.length > 0 ? headers.filter(h => selectedColumns.includes(h)) : headers;

  // Filtering for transposed view
  const displayedDocs = filteredData.filter((doc, idx) =>
    selectedRowIndices.length > 0 ? selectedRowIndices.includes(idx) : true
  );

  const displayedTransposedHeaders =
    selectedColumns.length > 0 ? transposedHeaders.filter(h => selectedColumns.includes(h)) : transposedHeaders;

  // Render table body rows (normal view)
  const renderTableBody = () => {
    return extractionData?.merged_data[selectedDocType]?.map((item, index) => (
      <TableRow 
        key={index}
        onClick={() => handleDocumentClick(item.document_id)}
        className="hover:bg-gray-50 cursor-pointer"
      >
        {displayedHeaders.map(header => (
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

      {/* Stat Cards */}
      {extractionData && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <StatCard
            title="Total Weight Oil Received"
            value={`${extractionData.total_weight_oil_received.toLocaleString()} MT`}
          />
          <StatCard
            title="Total Supplier Weight"
            value={`${extractionData.total_supplier_weight.toLocaleString()} MT`}
          />
        </div>
      )}

      {/* Filter & Search Section */}
      <div className="bg-card rounded-lg shadow">
        <div className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            {/* Filter Selections */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
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
                  {Array.from({ length: 5 }, (_, i) => 2025 - i).map((year) => (
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
            {/* Edit View Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Edit View</Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4">
                <div className="space-y-4">
                  {/* Transpose and Pivot Toggles */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="transpose-toggle-pop"
                        checked={transpose}
                        onChange={(e) => setTranspose(e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="transpose-toggle-pop" className="cursor-pointer">
                        Transpose Table
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="pivot-toggle-pop"
                        checked={pivot}
                        onChange={(e) => setPivot(e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="pivot-toggle-pop" className="cursor-pointer">
                        Pivot Table
                      </label>
                    </div>
                  </div>
                  {/* Pivot Configuration (shown only when pivot is enabled) */}
                  {pivot && (
                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="flex flex-col gap-1">
                        <label htmlFor="pivot-row-select" className="text-sm font-semibold">
                          Row Field
                        </label>
                        <Select  value={pivotRowField} onValueChange={setPivotRowField}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select row field" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Row Field</SelectLabel>
                              {headers.map(header => (
                                <SelectItem key={`pivot-row-pop-${header}`} value={header}>
                                  {header}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label htmlFor="pivot-column-select" className="text-sm font-semibold">
                          Column Field
                        </label>
                        <Select value={pivotColumnField} onValueChange={setPivotColumnField}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select column field" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Column Field</SelectLabel>
                              {headers.map(header => (
                                <SelectItem key={`pivot-col-pop-${header}`} value={header}>
                                  {header}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label htmlFor="pivot-value-select" className="text-sm font-semibold">
                          Value Field
                        </label>
                        <Select value={pivotValueField} onValueChange={setPivotValueField}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select value field" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Value Field</SelectLabel>
                              {headers.map(header => (
                                <SelectItem key={`pivot-val-pop-${header}`} value={header}>
                                  {header}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>

                      <Select value={pivotAggregator} onValueChange={setPivotAggregator}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Aggregator" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sum">Sum</SelectItem>
                          <SelectItem value="count">Count</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {/* Column Selector */}
                  <div>
                    <label className="block font-semibold mb-1">Select Columns:</label>
                    <div className="flex flex-wrap gap-2">
                      {headers.map(header => (
                        <label key={`col-pop-${header}`} className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={selectedColumns.includes(header)}
                            onChange={(e) => {
                              const { checked } = e.target;
                              if (checked) {
                                setSelectedColumns(prev => [...prev, header]);
                              } else {
                                setSelectedColumns(prev => prev.filter(h => h !== header));
                              }
                            }}
                          />
                          {header}
                        </label>
                      ))}
                    </div>
                  </div>
                  {/* Row Selector */}
                  <div className='hidden' >
                    <label className="block font-semibold mb-1">Select Rows (Documents):</label>
                    <div className="flex flex-wrap gap-2">
                      {filteredData.map((doc, index) => (
                        <label key={`row-pop-${index}`} className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={selectedRowIndices.includes(index)}
                            onChange={(e) => {
                              const { checked } = e.target;
                              if (checked) {
                                setSelectedRowIndices(prev => [...prev, index]);
                              } else {
                                setSelectedRowIndices(prev => prev.filter(i => i !== index));
                              }
                            }}
                          />
                          {doc.document_name || `Row ${index + 1}`}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
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

        {/* Table Rendering */}
        <div className="overflow-x-auto px-4">
          {pivot && customPivotData ? (
            // Custom Pivot View based on user-selected configuration
            <Table>
              <TableHeader className="bg-white">
                <TableRow>
                  <TableHead>{pivotRowField || 'Row'}</TableHead>
                  {pivotTableColumns.map(col => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(customPivotData).map(([rowKey, rowData]) => (
                  <TableRow key={rowKey}>
                    <TableCell>{rowKey}</TableCell>
                    {pivotTableColumns.map(col => (
                      <TableCell key={col} className="min-w-[200px]">
                        {rowData[col] !== undefined ? rowData[col] : '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : pivot ? (
            // If pivot is enabled but configuration is incomplete
            <p>Please select row and column fields (and value field if using sum aggregator) to pivot.</p>
          ) : transpose ? (
            // Transposed Table View
            <Table>
              <TableHeader className="bg-white">
                <TableRow>
                  <TableHead>&nbsp;</TableHead>
                  {displayedDocs.map((doc, idx) => (
                    <TableHead
                      key={idx}
                      onClick={() => handleDocumentClick(doc.document_id)}
                      className="min-w-[200px] cursor-pointer hover:bg-gray-50"
                    >
                      {doc['Document Name'] || doc.document_id}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedTransposedHeaders.map(header => (
                  <TableRow key={header}>
                    <TableCell className="font-medium">{header}</TableCell>
                    {displayedDocs.map((doc, idx) => (
                      <TableCell key={idx} className="min-w-[200px]">
                        {doc[header as keyof ExtractionData] || '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            // Normal Table View
            <Table>
              <TableHeader className="bg-white">
                <TableRow>
                  {displayedHeaders.map(header => (
                    <TableHead key={header} className="min-w-[200px] bg-white sticky top-0">
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedRows.map((row, index) => (
                  <TableRow 
                    key={index}
                    onClick={() => handleDocumentClick(row.document_id)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    {displayedHeaders.map(header => (
                      <TableCell key={header} className="min-w-[200px]">
                        {row[header as keyof typeof row] || '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
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
