'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddCustomerModalProps {
  onClose: () => void;
  onCustomerCreated: (customer: any) => void;
}

export default function AddCustomerModal({ onClose, onCustomerCreated }: AddCustomerModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [departments, setDepartments] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [certification, setCertification] = useState('');
  const [scopesOfCertification, setScopesOfCertification] = useState('');
  const [products, setProducts] = useState('');
  const [buyers, setBuyers] = useState('');
  const [suppliers, setSuppliers] = useState('');
  const [geoCoordinates, setGeoCoordinates] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [ghgType, setGhgType] = useState('');
  const [isRngCustomer, setIsRngCustomer] = useState(false);
  const [applicationInfo, setApplicationInfo] = useState('');
  const [processFlow, setProcessFlow] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    // Prepare payload converting comma-separated fields to arrays and parsing JSON if provided
    const payload = {
      name,
      description,
      address,
      departments: departments.split(',').map(item => item.trim()).filter(item => item),
      billing_address: billingAddress,
      certification,
      scopes_of_certification: scopesOfCertification.split(',').map(item => item.trim()).filter(item => item),
      products: products.split(',').map(item => item.trim()).filter(item => item),
      buyers: buyers.split(',').map(item => item.trim()).filter(item => item),
      suppliers: suppliers.split(',').map(item => item.trim()).filter(item => item),
      geo_coordinates: geoCoordinates,
      warehouse: warehouse.split(',').map(item => item.trim()).filter(item => item),
      ghg_type: ghgType,
      is_rng_customer: isRngCustomer,
      application_info: applicationInfo ? JSON.parse(applicationInfo) : {},
      process_flow: processFlow.split(',').map(item => item.trim()).filter(item => item),
    };

    setError('');
    setLoading(true);
    try {
      const response: any = await api.post('/user-mgt/v2/customer/', payload);
      if (response.success) {
        // Pass the returned customer data to the parent callback
        onCustomerCreated(response.data);
        onClose();
      } else {
        setError(response.message || 'Failed to create customer');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      {/* Modal box */}
      <div className="bg-white p-6 rounded shadow-md z-10 w-full max-w-md overflow-y-auto max-h-full">
        <h2 className="text-xl font-bold mb-4">Add New Customer</h2>
        {error && <p className="mb-2 text-red-500">{error}</p>}
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-4">
            <Label htmlFor="name">Name*</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Customer Name"
              required
            />
          </div>
          {/* Description */}
          <div className="mb-4">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter description (optional)"
            />
          </div>
          {/* Address */}
          <div className="mb-4">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address"
            />
          </div>
          {/* Departments */}
          {/* <div className="mb-4">
            <Label htmlFor="departments">Departments (comma separated)</Label>
            <Input
              id="departments"
              type="text"
              value={departments}
              onChange={(e) => setDepartments(e.target.value)}
              placeholder="e.g., Sales, Marketing"
            />
          </div> */}
          {/* Billing Address */}
          <div className="mb-4">
            <Label htmlFor="billingAddress">Billing Address</Label>
            <Input
              id="billingAddress"
              type="text"
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
              placeholder="Enter billing address"
            />
          </div>
          {/* Certification */}
          {/* <div className="mb-4">
            <Label htmlFor="certification">Certification (ID or empty)</Label>
            <Input
              id="certification"
              type="text"
              value={certification}
              onChange={(e) => setCertification(e.target.value)}
              placeholder="Enter certification ID"
            />
          </div> */}
          {/* Scopes of Certification */}
          {/* <div className="mb-4">
            <Label htmlFor="scopesOfCertification">Scopes of Certification (comma separated)</Label>
            <Input
              id="scopesOfCertification"
              type="text"
              value={scopesOfCertification}
              onChange={(e) => setScopesOfCertification(e.target.value)}
              placeholder="e.g., Scope 1, Scope 2"
            />
          </div> */}
          {/* Products */}
          {/* <div className="mb-4">
            <Label htmlFor="products">Products (comma separated)</Label>
            <Input
              id="products"
              type="text"
              value={products}
              onChange={(e) => setProducts(e.target.value)}
              placeholder="e.g., Product A, Product B"
            />
          </div> */}
          {/* Buyers */}
          {/* <div className="mb-4">
            <Label htmlFor="buyers">Buyers (comma separated)</Label>
            <Input
              id="buyers"
              type="text"
              value={buyers}
              onChange={(e) => setBuyers(e.target.value)}
              placeholder="e.g., Buyer A, Buyer B"
            />
          </div> */}
          {/* Suppliers */}
          {/* <div className="mb-4">
            <Label htmlFor="suppliers">Suppliers (comma separated)</Label>
            <Input
              id="suppliers"
              type="text"
              value={suppliers}
              onChange={(e) => setSuppliers(e.target.value)}
              placeholder="e.g., Supplier A, Supplier B"
            />
          </div> */}
          {/* Geo Coordinates */}
          {/* <div className="mb-4">
            <Label htmlFor="geoCoordinates">Geo Coordinates</Label>
            <Input
              id="geoCoordinates"
              type="text"
              value={geoCoordinates}
              onChange={(e) => setGeoCoordinates(e.target.value)}
              placeholder="Enter geo coordinates"
            />
          </div> */}
          {/* Warehouse */}
          <div className="mb-4">
            <Label htmlFor="warehouse">Warehouse (comma separated)</Label>
            <Input
              id="warehouse"
              type="text"
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
              placeholder="e.g., Warehouse A, Warehouse B"
            />
          </div>
          {/* GHG Type */}
          {/* <div className="mb-4">
            <Label htmlFor="ghgType">GHG Type</Label>
            <Input
              id="ghgType"
              type="text"
              value={ghgType}
              onChange={(e) => setGhgType(e.target.value)}
              placeholder="Enter GHG Type"
            />
          </div> */}
          {/* Is RNG Customer */}
          <div className="mb-4 flex items-center">
            <input
              id="isRngCustomer"
              type="checkbox"
              checked={isRngCustomer}
              onChange={(e) => setIsRngCustomer(e.target.checked)}
              className="mr-2"
            />
            <Label htmlFor="isRngCustomer">Is RNG Customer</Label>
          </div>
          {/* Application Info */}
          {/* <div className="mb-4">
            <Label htmlFor="applicationInfo">Application Info (JSON)</Label>
            <textarea
              id="applicationInfo"
              value={applicationInfo}
              onChange={(e) => setApplicationInfo(e.target.value)}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder='{"key": "value"}'
            />
          </div> */}
          {/* Process Flow */}
          {/* <div className="mb-4">
            <Label htmlFor="processFlow">Process Flow (comma separated)</Label>
            <Input
              id="processFlow"
              type="text"
              value={processFlow}
              onChange={(e) => setProcessFlow(e.target.value)}
              placeholder="e.g., Step1, Step2"
            />
          </div> */}
          <div className="flex justify-end gap-3">
            <Button type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 