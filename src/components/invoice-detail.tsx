'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Invoice } from '@/types/invoice';

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
    orderDate: invoice.OrderDate.split('T')[0],
    dueDate: invoice.DueDate ? invoice.DueDate.split('T')[0] : '',
    customerName: invoice.CustomerName,
    customerAddress: invoice.CustomerAddress,
    status: invoice.Status,
  });

  const [editingItems, setEditingItems] = useState<Record<number, Partial<InvoiceItem>>>({});

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update header
      const response = await fetch(`${apiUrl}/api/invoices/${invoice.SalesOrderID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
      });

      if (!response.ok) throw new Error('Update failed');

      // Update items
      for (const [itemId, itemData] of Object.entries(editingItems)) {
        const item = invoice.items?.find((i) => i.SalesOrderDetailID === Number(itemId));
        if (item && itemData) {
          await fetch(`${apiUrl}/api/invoices/${invoice.SalesOrderID}/items/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productName: itemData.productName ?? item.ProductName,
              productDescription: itemData.productDescription ?? item.ProductDescription,
              quantity: itemData.quantity ?? item.Quantity,
              unitPrice: itemData.unitPrice ?? item.UnitPrice,
              lineTotal: itemData.lineTotal ?? item.LineTotal,
            }),
          });
        }
      }

      setIsEditing(false);
      setEditingItems({});
      onUpdate();
    } catch (err) {
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleItemChange = (itemId: number, field: keyof InvoiceItem, value: any) => {
    setEditingItems((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
      },
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingItems({});
    setFormData({
      invoiceNumber: invoice.InvoiceNumber,
      orderDate: invoice.OrderDate.split('T')[0],
      dueDate: invoice.DueDate ? invoice.DueDate.split('T')[0] : '',
      customerName: invoice.CustomerName,
      customerAddress: invoice.CustomerAddress ?? '',
      status: invoice.Status,
    });
  };

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Invoice Details</CardTitle>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Header Fields */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Invoice Number</label>
          {isEditing ? (
            <Input
              type="text"
              value={formData.invoiceNumber}
              onChange={(e) =>
                setFormData({ ...formData, invoiceNumber: e.target.value })
              }
            />
          ) : (
            <p className="text-foreground">{formData.invoiceNumber || 'N/A'}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Order Date</label>
          {isEditing ? (
            <Input
              type="date"
              value={formData.orderDate}
              onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
            />
          ) : (
            <p className="text-foreground">
              {new Date(formData.orderDate).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Customer Name</label>
          {isEditing ? (
            <Input
              type="text"
              value={formData.customerName}
              onChange={(e) =>
                setFormData({ ...formData, customerName: e.target.value })
              }
            />
          ) : (
            <p className="text-foreground">{formData.customerName}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Status</label>
          {isEditing ? (
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <p className="text-foreground">{formData.status}</p>
          )}
        </div>

        {/* Items */}
        <div className="border-t border-border pt-4 space-y-3">
          <h3 className="font-semibold text-foreground">Items</h3>
          <div className="space-y-3">
            {(invoice.items ?? []).map((item) => {
              const editedItem = editingItems[item.SalesOrderDetailID] || {};
              return (
                <div
                  key={item.SalesOrderDetailID}
                  className="p-3 bg-muted rounded-lg"
                >
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        type="text"
                        value={editedItem.productName ?? item.ProductName}
                        onChange={(e) =>
                          handleItemChange(item.SalesOrderDetailID, 'productName', e.target.value)
                        }
                        placeholder="Product Name"
                        className="text-sm"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          value={editedItem.quantity ?? item.Quantity}
                          onChange={(e) =>
                            handleItemChange(
                              item.SalesOrderDetailID,
                              'quantity',
                              Number(e.target.value)
                            )
                          }
                          placeholder="Qty"
                          className="text-sm"
                        />
                        <Input
                          type="number"
                          step="0.01"
                          value={editedItem.unitPrice ?? item.UnitPrice}
                          onChange={(e) =>
                            handleItemChange(
                              item.SalesOrderDetailID,
                              'unitPrice',
                              Number(e.target.value)
                            )
                          }
                          placeholder="Price"
                          className="text-sm"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="font-medium text-sm text-foreground">
                        {item.ProductName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.Quantity} × {formatCurrency(item.UnitPrice)} ={' '}
                        {formatCurrency(item.LineTotal)}
                      </p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Totals */}
        <div className="border-t border-border pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="text-foreground">{formatCurrency(invoice.SubTotal ?? 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax:</span>
            <span className="text-foreground">{formatCurrency(invoice.TaxAmount ?? 0)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg border-t border-border pt-2">
            <span className="text-foreground">Total:</span>
            <span className="text-foreground">{formatCurrency(invoice.TotalAmount)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-border">
          {isEditing ? (
            <>
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="w-full">
              Edit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

