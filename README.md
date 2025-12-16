# Document Extraction App - Frontend

React/Next.js frontend application for uploading invoices and viewing/managing extracted structured data.

## Overview

This frontend application provides a user-friendly interface for:
- Uploading invoice documents (drag-and-drop or click to upload)
- Viewing extracted invoice data in a clean, organized layout
- Editing invoice metadata and line items
- Real-time updates and seamless user experience

## Features

- **Modern UI**: Clean, responsive design with dark mode support
- **Drag & Drop Upload**: Intuitive file upload with visual feedback
- **Real-time Processing**: Instant feedback during document processing
- **Invoice Management**: View, edit, and delete invoices
- **Inline Editing**: Edit invoice fields and line items directly
- **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

- Node.js 18+ or Bun
- Backend API server running on `http://localhost:8080` (or configure via environment variable)

## Installation

1. Navigate to the client-app directory:
```bash
cd client-app
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Configure API URL (optional):
Create a `.env.local` file:
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

If not set, defaults to `http://localhost:8080`

## Running the Application

### Development Mode
```bash
npm run dev
# or
bun run dev
```

The application will start on `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

## Project Structure

```
client-app/
├── src/
│   └── app/
│       ├── components/
│       │   ├── FileUpload.tsx      # File upload component
│       │   ├── InvoiceList.tsx     # Invoice list view
│       │   └── InvoiceDetail.tsx   # Invoice detail/edit view
│       ├── page.tsx                # Main page component
│       ├── layout.tsx              # Root layout
│       └── globals.css             # Global styles
├── public/                         # Static assets
├── package.json
└── next.config.ts
```

## Components

### FileUpload
Handles document upload with:
- Drag and drop support
- File type validation
- Upload progress indication
- Error handling and success feedback

### InvoiceList
Displays all invoices in a scrollable list:
- Invoice summary cards
- Status badges
- Click to select invoice
- Delete functionality
- Real-time updates

### InvoiceDetail
Shows detailed invoice information:
- View mode: Read-only display of all fields
- Edit mode: Inline editing of header and line items
- Save/Cancel actions
- Formatted currency and dates

## API Integration

The frontend communicates with the backend API:

- **Base URL**: Configured via `NEXT_PUBLIC_API_URL` environment variable
- **Endpoints Used**:
  - `POST /api/upload` - Upload document
  - `GET /api/invoices` - Get all invoices
  - `GET /api/invoices/:id` - Get single invoice
  - `PUT /api/invoices/:id` - Update invoice
  - `PUT /api/invoices/:id/items/:itemId` - Update invoice item
  - `DELETE /api/invoices/:id` - Delete invoice

## Usage

### Uploading an Invoice

1. Click the upload area or drag and drop a file
2. Supported formats: PDF, PNG, JPG, JPEG, TXT
3. Wait for processing (AI extraction happens automatically)
4. Invoice appears in the list once processed

### Viewing Invoices

- Click any invoice in the list to view details
- Details panel shows on the right (desktop) or below (mobile)
- All invoice fields and line items are displayed

### Editing Invoices

1. Select an invoice to view details
2. Click "Edit" button
3. Modify fields directly:
   - Invoice number, dates, customer info
   - Status dropdown
   - Line items (product name, quantity, price)
4. Click "Save" to persist changes
5. Click "Cancel" to discard changes

### Deleting Invoices

1. Click the "Delete" link on any invoice card
2. Confirm deletion
3. Invoice is removed from the list

## Styling

The application uses:
- **Tailwind CSS** for styling
- **Dark mode** support (follows system preference)
- **Responsive design** with mobile-first approach

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API URL (default: `http://localhost:8080`)

## Development

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format
```

### Key Technologies
- **Next.js 16**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS framework

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Performance Considerations

- **Code Splitting**: Next.js automatically splits code
- **Image Optimization**: Uses Next.js Image component
- **API Caching**: Consider implementing SWR or React Query for better caching
- **Lazy Loading**: Components load on demand

## Scaling Strategies

For production deployment:

1. **API Client**: Implement a centralized API client with:
   - Request/response interceptors
   - Error handling
   - Retry logic
   - Request cancellation

2. **State Management**: Consider adding:
   - Zustand or Redux for global state
   - React Query for server state management

3. **Caching**: Implement:
   - Service Worker for offline support
   - Browser caching for static assets
   - API response caching

4. **Performance**:
   - Implement virtual scrolling for large invoice lists
   - Add pagination or infinite scroll
   - Optimize bundle size with code splitting
   - Use React.memo for expensive components

5. **Error Handling**:
   - Global error boundary
   - Toast notifications for user feedback
   - Retry mechanisms for failed requests

6. **Testing**:
   - Unit tests (Jest, React Testing Library)
   - Integration tests
   - E2E tests (Playwright, Cypress)

7. **Monitoring**:
   - Error tracking (Sentry)
   - Analytics (Google Analytics, Mixpanel)
   - Performance monitoring

8. **Accessibility**:
   - ARIA labels
   - Keyboard navigation
   - Screen reader support
   - Focus management

## Troubleshooting

**Issue**: Cannot connect to backend
- Verify backend server is running on port 8080
- Check `NEXT_PUBLIC_API_URL` environment variable
- Check browser console for CORS errors

**Issue**: Upload fails
- Verify file type is supported
- Check file size (max 16MB)
- Ensure backend is running and accessible

**Issue**: Styling issues
- Clear `.next` cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

**Issue**: Build errors
- Check Node.js version (requires 18+)
- Clear cache and rebuild
- Verify all dependencies are installed

## Future Enhancements

- Bulk upload support
- Advanced filtering and search
- Export to CSV/Excel
- Invoice templates
- Multi-language support
- Advanced analytics dashboard
- User authentication and multi-tenancy
