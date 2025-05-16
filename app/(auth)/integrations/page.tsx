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

  return (
    <div className="min-h-screen p-8 relative">
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
              Connect your cloud storage, document management, and industrial data systems to automate compliance workflows. Rimba securely integrates with platforms like GCP, Azure, SharePoint, and industrial solutions to streamline document access, enhance data visibility, and generate automated compliance documentation from your <span className="text-purple-600">enterprise systems</span>.
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
            <span className="text-purple-600 border-b-2 border-purple-600 pb-2 mr-4">Available (10)</span>
            <span className="text-gray-600">Connected (0)</span>
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
            title="Google Cloud Platform (GCP)"
            imageSource="https://static-00.iconduck.com/assets.00/google-cloud-icon-2048x1646-7admxejz.png"
            features={["Cloud storage", "Data integration", "Scalability"]}
            isPartner={true}
            onButtonClick={handleButtonClick}
          />
          <IntegrationCard
            title="Aveva"
            imageSource="https://www.seeq.com/wp-content/uploads/2023/10/AVEVA-3.png"
            features={["Industrial data", "Document management"]}
            onButtonClick={handleButtonClick}
          />
          <IntegrationCard
            title="Siemens"
            imageSource="https://www.mothersontechnology.com/wp-content/uploads/2025/03/siemens-logo.png"
            features={["Industrial IoT", "Document access"]}
            onButtonClick={handleButtonClick}
          />
          <IntegrationCard
            title="Dropbox"
            imageSource="https://1000logos.net/wp-content/uploads/2023/01/Dropbox-logo.png"
            features={["File sharing", "Document storage", "Collaboration"]}
            isPartner={true}
            onButtonClick={handleButtonClick}
          />
          <IntegrationCard
            title="Google Drive"
            imageSource="https://www.logo.wine/a/logo/Google_Drive/Google_Drive-Logo.wine.svg"
            features={["File sharing", "Collaboration", "Document access"]}
            onButtonClick={handleButtonClick}
          />
          <IntegrationCard
            title="Microsoft SharePoint"
            imageSource="https://logos-world.net/wp-content/uploads/2022/12/SharePoint-Symbol.png"
            features={["Document management", "Collaboration", "Workflow"]}
            isPartner={true}
            onButtonClick={handleButtonClick}
          />
          <IntegrationCard
            title="Amazon S3"
            imageSource="https://miro.medium.com/v2/resize:fit:1280/0*_CD9Y48TkqWYPB1q.png"
            features={["Cloud storage", "Scalability", "Data archiving"]}
            onButtonClick={handleButtonClick}
          />
          <IntegrationCard
            title="Microsoft Azure"
            imageSource="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Microsoft_Azure_Logo.svg/1280px-Microsoft_Azure_Logo.svg.png"
            features={["Cloud storage", "Data integration", "Security"]}
            isPartner={true}
            onButtonClick={handleButtonClick}
          />
          <IntegrationCard
            title="Seeq"
            imageSource="https://upload.wikimedia.org/wikipedia/commons/d/de/Seeq_Logo.png"
            features={["Industrial data", "Analytics", "Visualization"]}
            onButtonClick={handleButtonClick}
          />
          <IntegrationCard
            title="CDF"
            imageSource="https://www.bindeleddet.no/uploads/companies/2533/logo/medium_LOGO-Cognite-Logo-Light.jpg"
            features={["Data integration", "Collaboration"]}
            onButtonClick={handleButtonClick}
          />
        </div>
      </div>
    </div>
  );
};

export default Integrations;