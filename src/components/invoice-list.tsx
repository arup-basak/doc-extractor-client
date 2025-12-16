"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Invoice } from "@/types/invoice";

interface InvoiceListProps {
  invoices: Invoice[];
  loading: boolean;
  onInvoiceSelect: (invoice: Invoice) => void;
  selectedId?: number;
  onInvoiceUpdate: () => void;
  apiUrl: string;
}

export function InvoiceList({
  invoices,
  loading,
  onInvoiceSelect,
  selectedId,
  onInvoiceUpdate,
  apiUrl,
}: InvoiceListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      const response = await fetch(`${apiUrl}/api/invoices/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Delete failed");
      onInvoiceUpdate();
    } catch (err) {
      alert("Failed to delete invoice");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusVariant = (status: string) => {
    if (status === "Pending") return "secondary";
    if (status === "Paid") return "default";
    return "outline";
  };

  if (loading && invoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading invoices...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices ({invoices.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {invoices.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            No invoices yet. Upload your first invoice to get started.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {invoices.map((invoice) => (
              <div
                key={invoice.SalesOrderID}
                onClick={() => onInvoiceSelect(invoice)}
                className={cn(
                  "p-4 hover:bg-accent cursor-pointer transition-colors",
                  selectedId === invoice.SalesOrderID &&
                    "bg-accent border-l-4 border-l-primary"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-foreground">
                        {invoice.InvoiceNumber || `#${invoice.SalesOrderID}`}
                      </span>
                      <Badge variant={getStatusVariant(invoice.Status)}>
                        {invoice.Status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {invoice.CustomerName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(invoice.OrderDate)}
                    </p>
                  </div>
                  <div className="text-right flex items-start gap-2">
                    <div>
                      <p className="font-semibold text-foreground">
                        {formatCurrency(invoice.TotalAmount)}
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => e.stopPropagation()}
                          disabled={deletingId === invoice.SalesOrderID}
                          className="text-destructive hover:text-destructive"
                        >
                          {deletingId === invoice.SalesOrderID ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete invoice{" "}
                            {invoice.InvoiceNumber ||
                              `#${invoice.SalesOrderID}`}
                            ? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(invoice.SalesOrderID)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
