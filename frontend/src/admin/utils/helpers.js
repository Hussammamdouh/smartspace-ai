// Utility function to export data to CSV
export const exportToCSV = (data, filename = 'export.csv', headers = null) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    csvHeaders.join(','), // Header row
    ...data.map(row => 
      csvHeaders.map(header => {
        const value = row[header];
        // Handle nested objects and arrays
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        // Escape commas and quotes
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Utility function to export data to Excel (using CSV format with .xlsx extension)
export const exportToExcel = (data, filename = 'export.xlsx', headers = null) => {
  // For now, we'll use CSV format. For true Excel, you'd need a library like xlsx
  exportToCSV(data, filename.replace('.xlsx', '.csv'), headers);
};

// Format date for display
export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format date and time
export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Calculate percentage change
export const calculatePercentageChange = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous * 100).toFixed(1);
};

// Debounce function for search
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Format order status for display
export const formatOrderStatus = (status) => {
  const statusMap = {
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  return statusMap[status] || status;
};

// Get status color class
export const getStatusColor = (status) => {
  const colorMap = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    processing: 'bg-blue-500/20 text-blue-400',
    shipped: 'bg-purple-500/20 text-purple-400',
    delivered: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400',
    active: 'bg-green-500/20 text-green-400',
    blocked: 'bg-red-500/20 text-red-400',
    available: 'bg-green-500/20 text-green-400',
    unavailable: 'bg-red-500/20 text-red-400',
  };
  return colorMap[status] || 'bg-gray-500/20 text-gray-400';
};





