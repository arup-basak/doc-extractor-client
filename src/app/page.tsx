"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileUpload } from "@/components/file-upload";
import { InvoiceList } from "@/components/invoice-list";
import { InvoiceDetail } from "@/components/invoice-detail";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import type { Invoice } from "@/types/invoice";

export default function Home() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const queryClient = useQueryClient();

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  const {
    data: invoices = [],
    isLoading: loading,
    error: queryError,
  } = useQuery<Invoice[]>({
    queryKey: ["invoices"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/invoices`);
      if (!response.ok) throw new Error("Failed to fetch invoices");
      return response.json();
    },
  });

  const { data: selectedInvoiceData } = useQuery<Invoice>({
    queryKey: ["invoices", selectedInvoice?.SalesOrderID],
    queryFn: async () => {
      if (!selectedInvoice) throw new Error("No invoice selected");
      const response = await fetch(
        `${API_BASE_URL}/api/invoices/${selectedInvoice.SalesOrderID}`
      );
      if (!response.ok) throw new Error("Failed to fetch invoice");
      return response.json();
    },
    enabled: !!selectedInvoice,
  });

  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : "Failed to load invoices"
    : null;

  const handleUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
  };

  const handleInvoiceSelect = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleInvoiceUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
    if (selectedInvoice) {
      queryClient.invalidateQueries({
        queryKey: ["invoices", selectedInvoice.SalesOrderID],
      });
    }
  };

  const handleCloseDetail = () => {
    setSelectedInvoice(null);
  };

  // Use fetched data when available, otherwise use selected invoice
  const displayInvoice = selectedInvoiceData || selectedInvoice;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Document Extraction App
          </h1>
          <p className="text-muted-foreground">
            Upload invoices and extract structured data using AI
          </p>
        </header>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Upload & List */}
          <div className="lg:col-span-2 space-y-6">
            <FileUpload
              onUploadSuccess={handleUploadSuccess}
              apiUrl={API_BASE_URL}
            />

            <InvoiceList
              invoices={invoices}
              loading={loading}
              onInvoiceSelect={handleInvoiceSelect}
              selectedId={displayInvoice?.SalesOrderID}
              onInvoiceUpdate={handleInvoiceUpdate}
              apiUrl={API_BASE_URL}
            />
          </div>

          {/* Right Column - Detail View */}
          <div className="lg:col-span-1">
            {displayInvoice ? (
              <InvoiceDetail
                invoice={displayInvoice}
                onUpdate={handleInvoiceUpdate}
                onClose={handleCloseDetail}
                apiUrl={API_BASE_URL}
              />
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Select an invoice to view details
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
