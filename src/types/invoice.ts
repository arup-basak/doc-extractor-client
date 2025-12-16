export interface InvoiceItem {
  SalesOrderDetailID: number;
  ProductName: string;
  ProductDescription: string;
  Quantity: number;
  UnitPrice: number;
  LineTotal: number;
}

export interface Invoice {
  SalesOrderID: number;
  OrderDate: string;
  DueDate: string | null;
  CustomerName: string;
  CustomerAddress?: string;
  InvoiceNumber: string;
  SubTotal?: number;
  TaxAmount?: number;
  TotalAmount: number;
  Status: string;
  CreatedAt: string;
  UpdatedAt?: string;
  DocumentPath?: string;
  items?: InvoiceItem[];
}

