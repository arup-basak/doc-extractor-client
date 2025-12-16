import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Loader2, Trash2 } from "lucide-react";
import { exportToCSV, exportToExcel } from "@/lib/export";

import { useState } from "react";
// Removed Card imports
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
import { cn } from "@/lib/utils";
import type { Invoice } from "@/types/invoice";
import { motion, AnimatePresence } from "framer-motion";

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
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
      <div className="glass-panel rounded-xl p-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground font-medium">
            Loading invoices...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-serif font-bold tracking-tight text-foreground">
          Invoices{" "}
          <span className="text-muted-foreground text-sm font-sans font-normal ml-2">
            ({invoices.length})
          </span>
        </h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 h-9 border-border/60 bg-background/50 backdrop-blur-sm hover:bg-surface-2 transition-all duration-300"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="glass-panel border-white/10"
          >
            <DropdownMenuItem
              onClick={() =>
                exportToCSV(
                  invoices.map((inv) => ({
                    "Invoice Number": inv.InvoiceNumber,
                    "Customer Name": inv.CustomerName,
                    Date: new Date(inv.OrderDate).toLocaleDateString(),
                    Status: inv.Status,
                    "Total Amount": inv.TotalAmount,
                  })),
                  "invoices"
                )
              }
            >
              Export to CSV
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                exportToExcel(
                  invoices.map((inv) => ({
                    "Invoice Number": inv.InvoiceNumber,
                    "Customer Name": inv.CustomerName,
                    Date: new Date(inv.OrderDate).toLocaleDateString(),
                    Status: inv.Status,
                    "Total Amount": inv.TotalAmount,
                  })),
                  "invoices"
                )
              }
            >
              Export to Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden border border-white/5 shadow-2xl backdrop-blur-2xl bg-background/40">
        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-secondary/30 flex items-center justify-center mb-2">
              <span className="text-2xl">📄</span>
            </div>
            <h3 className="text-lg font-medium text-foreground">
              No invoices found
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Upload your first invoice to get started managing your finances.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            <AnimatePresence initial={false} mode="popLayout">
              {invoices.map((invoice) => (
                <motion.div
                  layout
                  key={invoice.SalesOrderID}
                  onClick={() => onInvoiceSelect(invoice)}
                  initial={{ opacity: 1 }} // Ensure no mount fade-in
                  exit={{
                    opacity: 0,
                    height: 0,
                    transition: { duration: 0.2 },
                  }}
                  whileHover={{
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    scale: 1.002,
                    transition: { duration: 0.2 },
                  }}
                  whileTap={{ scale: 0.995 }}
                  className={cn(
                    "group relative p-5 cursor-pointer",
                    selectedId === invoice.SalesOrderID
                      ? "bg-white/10"
                      : "bg-transparent"
                  )}
                >
                  {/* Active Indicator Line with Layout Animation */}
                  {selectedId === invoice.SalesOrderID && (
                    <motion.div
                      layoutId="active-invoice-indicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                        <span
                          className={cn(
                            "font-mono font-medium text-base tracking-tight transition-colors duration-200",
                            selectedId === invoice.SalesOrderID
                              ? "text-primary"
                              : "text-foreground"
                          )}
                        >
                          {invoice.InvoiceNumber || `#${invoice.SalesOrderID}`}
                        </span>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "ml-auto sm:ml-0 font-normal border-0",
                            invoice.Status === "Paid"
                              ? "bg-green-500/10 text-green-500"
                              : invoice.Status === "Pending"
                              ? "bg-amber-500/10 text-amber-500"
                              : "bg-zinc-500/10 text-zinc-500"
                          )}
                        >
                          {invoice.Status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground/80">
                        <span className="font-medium text-foreground/80 truncate">
                          {invoice.CustomerName}
                        </span>
                        <span className="text-xs opacity-50">•</span>
                        <span className="text-xs">
                          {formatDate(invoice.OrderDate)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-4">
                      <div className="flex flex-col items-end">
                        <span className="font-serif font-semibold text-lg text-foreground tracking-tight">
                          {formatCurrency(invoice.TotalAmount)}
                        </span>
                      </div>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => e.stopPropagation()}
                              disabled={deletingId === invoice.SalesOrderID}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {deletingId === invoice.SalesOrderID ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </motion.div>
                        </AlertDialogTrigger>
                        <AlertDialogContent
                          onClick={(e) => e.stopPropagation()}
                          className="glass-panel border-white/10"
                        >
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete invoice{" "}
                              <span className="font-mono font-medium text-foreground">
                                {invoice.InvoiceNumber ||
                                  `#${invoice.SalesOrderID}`}
                              </span>
                              ? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5">
                              Cancel
                            </AlertDialogCancel>
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
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
