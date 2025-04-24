"use client"

import React, { useState } from 'react';
import IntegrationCard from './components/IntegrationCard';
import SearchInput from './components/SearchInput';
import FilterButton from '@/components/ui/FilterButton';
import { Button } from '@/components/ui/button';

const Integrations = () => {
  const [showModal, setShowModal] = useState(false);

  const handleButtonClick = () => {
    setShowModal(true);
  };

  // Add error handling for any fetch calls
  // const fetchData = async () => {
  //   try {
  //     const response = await fetch('/your-api-endpoint');
  //     if (!response.ok) throw new Error('Network response was not ok');
  //     const data = await response.json();
  //     return data;
  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //     return null;
  //   }
  // };

  return (
    <div className="min-h-screen bg-gray-50 p-8 relative">
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
            <h2 className="text-xl font-semibold mb-4">Integration Request Received</h2>
            <p className="text-gray-700 mb-6">We will be integrating the app and will notify you when it's live.</p>
            <Button 
              className="bg-green-600 text-gray-100 hover:bg-green-700"
              onClick={() => setShowModal(false)}
            >
              Got it
            </Button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-semibold">Integrations</h1>
              <div className="text-gray-400 hover:text-gray-600 cursor-help">ⓘ</div>
            </div>
            <p className="text-gray-600 max-w-3xl">
              Connect your supply chain systems to automate compliance workflows and data integration. Rimba securely connects to your existing platforms to streamline reporting, monitor supplier compliance, and generate automated documentation from your <span className="text-purple-600">supply chain data</span>.
            </p>
          </div>
          <Button 
            className="bg-green-600 text-gray-100 hover:bg-green-700"
            onClick={handleButtonClick}
          >
            Missing an integration? Let us know!
          </Button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="text-sm font-medium">
            <span className="text-purple-600 border-b-2 border-purple-600 pb-2 mr-4">Available (368)</span>
            <span className="text-gray-600">Connected (4)</span>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <div className="w-64">
            <SearchInput label={''} />
          </div>
          <FilterButton label="Category" />
          <FilterButton label="Creator" />
          <FilterButton label="Status" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <IntegrationCard
            title="13 Penetration Testing & Scanning"
            icon="/lovable-uploads/13-pen.png"
            features={["Access", "Document upload", "Vulnerabilities"]}
            isPartner={true}
            onButtonClick={handleButtonClick}
          />
          <IntegrationCard
            title="1Password"
            icon="/lovable-uploads/1password.png"
            features={["Access"]}
            onButtonClick={handleButtonClick}
          />
          <IntegrationCard
            title="4me"
            icon="/lovable-uploads/4me.png"
            features={["Access"]}
          />
          <IntegrationCard
            title="7shifts"
            icon="/lovable-uploads/7shifts.png"
            features={["Get notified when this integration becomes available."]}
            isComingSoon={true}
          />
          <IntegrationCard
            title="8x8"
            icon="/lovable-uploads/8x8.png"
            features={["Access"]}
          />
          <IntegrationCard
            title="AccessOwl"
            icon="/lovable-uploads/access-owl.png"
            features={["Document upload"]}
            isPartner={true}
          />
          <IntegrationCard
            title="Acunetix360"
            icon="/lovable-uploads/acunetix.png"
            features={["Access"]}
          />
          <IntegrationCard
            title="Adaptive Security"
            icon="/lovable-uploads/adaptive.png"
            features={["Inventory", "People", "Security awareness training"]}
            isPartner={true}
          />
          <IntegrationCard
            title="Addigy"
            icon="/lovable-uploads/addigy.png"
            features={["Computers", "Inventory"]}
          />
          <IntegrationCard
            title="ADP Workforce Now"
            icon="/lovable-uploads/adp.png"
            features={["People"]}
          />
          <IntegrationCard
            title="AgencyMDR"
            icon="/lovable-uploads/agency.png"
            features={["Access", "Computers", "Document upload", "Inventory"]}
            isPartner={true}
          />
          <IntegrationCard
            title="Aha"
            icon="/lovable-uploads/aha.png"
            features={["Access", "Task tracking"]}
          />
        </div>
      </div>
    </div>
  );
};

export default Integrations;