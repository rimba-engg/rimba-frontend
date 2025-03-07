'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ToastContainer, toast } from 'react-toastify';
import { Download } from 'lucide-react'
import { BASE_URL } from '@/lib/api' 

export default function AirPermitsPage() {
  const [loading, setLoading] = useState<boolean>(false)
  
  const downloadReport = async () => {
    try {
      setLoading(true);

            
      const response = await fetch(`${BASE_URL}/reporting/v2/air-permits/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) throw new Error('Export failed');

      // Create download link and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Air-Permits-Report.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      toast.success('Report downloaded successfully!')
    } catch (error) {
      toast.error('Failed to download report. Please try again.')
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Download Air Permits Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-end">
              <Button
                onClick={downloadReport}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {loading && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      )}
      <ToastContainer />
    </div>
  )
}
