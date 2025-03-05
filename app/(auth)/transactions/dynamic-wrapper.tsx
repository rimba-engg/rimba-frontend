"use client";
import { api } from "@/lib/api";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Loader } from "@/components/ui/loader";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export interface Transaction {
  _id: string;
  contract_number: string;
  transfer_date: string;
  month: number;
  year: number;
  product: string;
  document: string;
  supplier: string;
  quantity: number;
  carbon_emission: number;
  created_at: string;
  warehouse: string;
  document_name: string;
}

export interface TransactionsResponseData {
  transactions: Transaction[];
  net: number;
}

export interface TransactionsResponse {
  status: string;
  message: string;
  data: TransactionsResponseData;
}

export default function TransactionsList() {
  // Get the search parameters from the URL.
  const searchParams = useSearchParams();

  // Build URLSearchParams from the incoming query parameters.
  const params = new URLSearchParams();
  const setParam = (key: string) => {
    const value = searchParams.get(key);
    if (value) {
      params.set(key, value);
    }
  };

  setParam("product");
  setParam("month");
  setParam("year");
  setParam("warehouses");
  setParam("transaction_type");

  // Use state to store transactions, net, error messages, and loading status.
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [net, setNet] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      console.log(params.toString());
      const result: TransactionsResponse = await api.get(
        `/reporting/v2/transactions?${params.toString()}`
      );
      if (result.status === "success") {
        setTransactions(result.data.transactions);
        setNet(result.data.net);
        setErrorMsg("");
      } else {
        setErrorMsg(result.message);
        console.error("API Error:", result.message);
      }
    } catch (error: any) {
      setErrorMsg(error.message);
      console.error("Request failed:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Define the column order and filter out unwanted columns
  const getOrderedColumns = (transaction: Transaction) => {
    const allColumns = Object.keys(transaction);
    const filteredColumns = allColumns.filter(col => col !== '_id' && col !== 'document');
    // Remove document_name from its current position and add it to the beginning
    const withoutDocName = filteredColumns.filter(col => col !== 'document_name');
    return ['document_name', ...withoutDocName];
  };

  // Replace the existing tableColumns definition with:
  const tableColumns = transactions.length > 0 ? getOrderedColumns(transactions[0]) : [];

  return (
    <div className="w-[85vw] p-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Transactions</CardTitle>
            <div className="bg-secondary/20 rounded-lg px-4 py-2">
              <div className="text-sm font-medium text-muted-foreground">Total Net Quantity</div>
              <div className="text-2xl font-bold">{net}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <Loader text="Loading transactions..." size="default" />
            </div>
          ) : errorMsg ? (
            <p className="text-red-500 p-4">Error: {errorMsg}</p>
          ) : transactions.length === 0 ? (
            <p className="text-muted-foreground p-4">No transactions found.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {tableColumns.map((col) => (
                      <TableHead key={col}>
                        {col.charAt(0).toUpperCase() + col.slice(1)}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx, index) => (
                    <TableRow key={index}>
                      {tableColumns.map((col) => (
                        <TableCell key={col}>
                          {tx[col as keyof Transaction]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
