"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, X, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Invoice, InvoiceItem } from "@/types/invoice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToCSV, exportToExcel } from "@/lib/export";
import { motion, AnimatePresence } from "framer-motion";

interface InvoiceDetailProps {
  invoice: Invoice;
  onUpdate: () => void;
  onClose: () => void;
  apiUrl: string;
}

export function InvoiceDetail({
  invoice,
  onUpdate,
  onClose,
  apiUrl,
}: InvoiceDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    invoiceNumber: invoice.InvoiceNumber,
    orderDate: invoice.OrderDate.split("T")[0],
    dueDate: invoice.DueDate ? invoice.DueDate.split("T")[0] : "",
    customerName: invoice.CustomerName,
    customerAddress: invoice.CustomerAddress,
    status: invoice.Status,
  });

  const [editingItems, setEditingItems] = useState<
    Record<number, Partial<InvoiceItem>>
  >({});

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update header
      const response = await fetch(
        `${apiUrl}/api/invoices/${invoice.SalesOrderID}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invoiceNumber: formData.invoiceNumber,
            orderDate: formData.orderDate,
            dueDate: formData.dueDate || null,
            customerName: formData.customerName,
            customerAddress: formData.customerAddress,
            status: formData.status,
            subTotal: invoice.SubTotal ?? 0,
            taxAmount: invoice.TaxAmount ?? 0,
            totalAmount: invoice.TotalAmount,
          }),
        }
      );

      if (!response.ok) throw new Error("Update failed");

      // Update items
      for (const [itemId, itemData] of Object.entries(editingItems)) {
        const item = invoice.items?.find(
          (i) => i.SalesOrderDetailID === Number(itemId)
        );
        if (item && itemData) {
          await fetch(
            `${apiUrl}/api/invoices/${invoice.SalesOrderID}/items/${itemId}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                productName: itemData.ProductName ?? item.ProductName,
                productDescription:
                  itemData.ProductDescription ?? item.ProductDescription,
                quantity: itemData.Quantity ?? item.Quantity,
                unitPrice: itemData.UnitPrice ?? item.UnitPrice,
                lineTotal: itemData.LineTotal ?? item.LineTotal,
              }),
            }
          );
        }
      }

      setIsEditing(false);
      setEditingItems({});
      onUpdate();
    } catch (err) {
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleItemChange = (
    itemId: number,
    field: keyof InvoiceItem,
    value: any
  ) => {
    setEditingItems((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
      },
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingItems({});
    setFormData({
      invoiceNumber: invoice.InvoiceNumber,
      orderDate: invoice.OrderDate.split("T")[0],
      dueDate: invoice.DueDate ? invoice.DueDate.split("T")[0] : "",
      customerName: invoice.CustomerName,
      customerAddress: invoice.CustomerAddress ?? "",
      status: invoice.Status,
    });
  };

  return (
    <motion.div
      layout
      className="glass-panel sticky top-6 rounded-xl border border-white/5 bg-background/40 backdrop-blur-2xl shadow-2xl overflow-hidden"
    >
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-md">
        <h2 className="text-xl font-serif font-bold text-foreground tracking-tight">
          Invoice Details
        </h2>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-transparent border-white/10 hover:bg-white/10 transition-colors"
              >
                <Download className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="glass-panel border-white/10"
            >
              <DropdownMenuItem
                onClick={() =>
                  exportToCSV(
                    (invoice.items ?? []).map((item) => ({
                      "Product Name": item.ProductName,
                      Description: item.ProductDescription,
                      Quantity: item.Quantity,
                      "Unit Price": item.UnitPrice,
                      "Line Total": item.LineTotal,
                    })),
                    `invoice-${invoice.InvoiceNumber}-items`
                  )
                }
              >
                Export Items to CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  exportToExcel(
                    (invoice.items ?? []).map((item) => ({
                      "Product Name": item.ProductName,
                      Description: item.ProductDescription,
                      Quantity: item.Quantity,
                      "Unit Price": item.UnitPrice,
                      "Line Total": item.LineTotal,
                    })),
                    `invoice-${invoice.InvoiceNumber}-items`
                  )
                }
              >
                Export Items to Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 hover:bg-white/10 hover:text-destructive transition-colors"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Header Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Invoice Number
            </label>
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="editing-invoice-number"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                >
                  <Input
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        invoiceNumber: e.target.value,
                      })
                    }
                    className="bg-white/5 border-white/10 focus:border-primary/50"
                  />
                </motion.div>
              ) : (
                <motion.p
                  key="view-invoice-number"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="text-lg font-mono font-medium text-foreground"
                >
                  {formData.invoiceNumber || "N/A"}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Order Date
            </label>
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="editing-date"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                >
                  <Input
                    type="date"
                    value={formData.orderDate}
                    onChange={(e) =>
                      setFormData({ ...formData, orderDate: e.target.value })
                    }
                    className="bg-white/5 border-white/10 focus:border-primary/50"
                  />
                </motion.div>
              ) : (
                <motion.p
                  key="view-date"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="text-lg font-mono text-foreground"
                >
                  {new Date(formData.orderDate).toLocaleDateString()}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Customer Name
            </label>
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="editing-customer"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                >
                  <Input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                    className="bg-white/5 border-white/10 focus:border-primary/50"
                  />
                </motion.div>
              ) : (
                <motion.p
                  key="view-customer"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="text-lg font-serif text-foreground"
                >
                  {formData.customerName}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Status
            </label>
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="editing-status"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                >
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 focus:border-primary/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
              ) : (
                <motion.div
                  key="view-status"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="flex"
                >
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-sm font-medium",
                      formData.status === "Paid"
                        ? "bg-green-500/10 text-green-500"
                        : formData.status === "Pending"
                        ? "bg-amber-500/10 text-amber-500"
                        : "bg-zinc-500/10 text-zinc-500"
                    )}
                  >
                    {formData.status}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground border-b border-white/5 pb-2">
            Line Items
          </h3>
          <div className="space-y-3">
            {(invoice.items ?? []).map((item) => {
              const editedItem = editingItems[item.SalesOrderDetailID] || {};
              return (
                <motion.div
                  layout
                  key={item.SalesOrderDetailID}
                  className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                >
                  <AnimatePresence mode="wait">
                    {isEditing ? (
                      <motion.div
                        key="editing-item"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-3"
                      >
                        <Input
                          type="text"
                          value={editedItem.ProductName ?? item.ProductName}
                          onChange={(e) =>
                            handleItemChange(
                              item.SalesOrderDetailID,
                              "ProductName",
                              e.target.value
                            )
                          }
                          placeholder="Product Name"
                          className="text-sm bg-transparent border-white/10"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            type="number"
                            value={editedItem.Quantity ?? item.Quantity}
                            onChange={(e) =>
                              handleItemChange(
                                item.SalesOrderDetailID,
                                "Quantity",
                                Number(e.target.value)
                              )
                            }
                            placeholder="Qty"
                            className="text-sm bg-transparent border-white/10"
                          />
                          <Input
                            type="number"
                            step="0.01"
                            value={editedItem.UnitPrice ?? item.UnitPrice}
                            onChange={(e) =>
                              handleItemChange(
                                item.SalesOrderDetailID,
                                "UnitPrice",
                                Number(e.target.value)
                              )
                            }
                            placeholder="Price"
                            className="text-sm bg-transparent border-white/10"
                          />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="view-item"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex justify-between items-start"
                      >
                        <div>
                          <p className="font-medium text-base text-foreground mb-1">
                            {item.ProductName}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {item.Quantity} × {formatCurrency(item.UnitPrice)}
                          </p>
                        </div>
                        <p className="font-mono font-medium text-foreground">
                          {formatCurrency(item.LineTotal)}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Totals */}
        <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-mono text-foreground">
              {formatCurrency(invoice.SubTotal ?? 0)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span className="font-mono text-foreground">
              {formatCurrency(invoice.TaxAmount ?? 0)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-white/10">
            <span className="font-serif font-bold text-lg text-foreground">
              Total
            </span>
            <span className="font-mono font-bold text-xl text-primary">
              {formatCurrency(invoice.TotalAmount)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={resetForm}
                className="border-white/10 hover:bg-white/5"
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              Edit Invoice
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
