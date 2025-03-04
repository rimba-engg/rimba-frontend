import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { api } from '@/lib/api';

export interface Product {
  id: string;
  name: string;
}

// New interface for Bill of Lading documents.
export interface BillOfLading {
  id: string;
  bill_of_lading: string;
}

const AddContractModal = () => {
  const [contractNumber, setContractNumber] = useState('');
  const [product, setProduct] = useState('');
  const [products, setProducts] = useState<Product[]>([]);

  // New state to store Bill of Lading options
  const [billOfLadingOptions, setBillOfLadingOptions] = useState<BillOfLading[]>([]);
  // State for the selected Bill Of Lading (storing the id).
  const [billOfLading, setBillOfLading] = useState('');

  const fetchProducts = async () => {
    try {
      const response = await api.get<Product[]>('/v2/products/');
      if ((response as any).status === 'success') {
        const doc = (response as any).data;
        const Products: Product[] = doc.map((product: Product) => ({
          id: product.id,
          name: product.name,
        }));
        setProducts(Products);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  // New function to fetch Bill of Lading documents.
  const fetchBillOfLading = async () => {
    try {
      const response = await api.get<BillOfLading[]>('/v2/bill-of-lading/');
      if ((response as any).status === 'success') {
        const data = (response as any).data;
        const bills: BillOfLading[] = data.map((doc: any) => ({
          id: doc.id,
          bill_of_lading: doc.bill_of_lading,
        }));
        setBillOfLadingOptions(bills);
      }
    } catch (error) {
      console.error('Failed to fetch Bill of Lading:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchBillOfLading();
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission here. For example, post the data to your API.
    console.log({ contractNumber, product, billOfLading });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Upload className="w-4 h-4 mr-2" />
          New Contract
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Outgoing Contract</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* Contract Number Field */}
          <div className="grid gap-2">
            <Label htmlFor="contractNumber">Contract Number</Label>
            <Input
              id="contractNumber"
              placeholder="Enter contract number"
              value={contractNumber}
              onChange={(e) => setContractNumber(e.target.value)}
            />
          </div>
          
          {/* Updated Product Dropdown */}
          <div className="grid gap-2">
            <Label htmlFor="product">Product</Label>
            <Select value={product} onValueChange={setProduct}>
              <SelectTrigger id="product" className="w-full">
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.length > 0 ? (
                  products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-products">No products available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          {/* Bill Of Lading Dropdown */}
          <div className="grid gap-2">
            <Label htmlFor="billOfLading">Bill Of Lading</Label>
            <Select value={billOfLading} onValueChange={setBillOfLading}>
              <SelectTrigger id="billOfLading" className="w-full">
                <SelectValue placeholder="Select a bill of lading" />
              </SelectTrigger>
              <SelectContent>
                {billOfLadingOptions.length > 0 ? (
                  billOfLadingOptions.map((bol) => (
                    <SelectItem key={bol.id} value={bol.id}>
                      {bol.bill_of_lading}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-bol">No Bill of Lading available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save Contract</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddContractModal;