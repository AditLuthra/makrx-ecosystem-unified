import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatDateRelative(date: string | Date): string {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(date);
}

export function validateSTLFile(file: File): { isValid: boolean; error?: string } {
  // Check file type
  if (!file.type.includes('octet-stream') && !file.name.toLowerCase().endsWith('.stl')) {
    return { isValid: false, error: 'Please upload a valid STL file' };
  }

  // Check file size (max 100MB)
  if (file.size > 100 * 1024 * 1024) {
    return { isValid: false, error: 'File size must be less than 100MB' };
  }

  return { isValid: true };
}

export function validateSVGFile(file: File): { isValid: boolean; error?: string } {
  // Check file type
  if (!file.type.includes('svg') && !file.name.toLowerCase().endsWith('.svg')) {
    return { isValid: false, error: 'Please upload a valid SVG file' };
  }

  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { isValid: false, error: 'File size must be less than 10MB' };
  }

  return { isValid: true };
}

export function getServiceTypeFromFile(file: File): 'printing' | 'engraving' | null {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.stl') || fileName.endsWith('.obj') || fileName.endsWith('.3mf')) {
    return 'printing';
  }
  
  if (fileName.endsWith('.svg') || fileName.endsWith('.dxf') || fileName.endsWith('.ai')) {
    return 'engraving';
  }
  
  return null;
}

export function calculateEstimatedPrice(serviceType: 'printing' | 'engraving', material: string, quantity: number, volume?: number, area?: number): number {
  const basePrices = {
    printing: {
      PLA: 150, // per kg
      ABS: 180,
      PETG: 220,
      TPU: 350,
      Resin: 2500, // per liter
    },
    engraving: {
      Wood: 50, // per cm²
      Acrylic: 30,
      Metal: 80,
      Leather: 40,
    }
  };

  let basePrice = 0;
  let materialCost = 0;
  const setupFee = serviceType === 'printing' ? 100 : 50;

  if (serviceType === 'printing' && volume) {
    const density = material === 'Resin' ? 1.2 : 1.24; // kg/liter or kg/dm³
    const materialUsage = (volume / 1000) * density; // Convert mm³ to dm³ then to kg/liters
    const pricePerUnit = basePrices.printing[material as keyof typeof basePrices.printing] || 150;
    materialCost = materialUsage * pricePerUnit;
    basePrice = Math.max(200, materialCost); // Minimum base price
  }

  if (serviceType === 'engraving' && area) {
    const pricePerCm2 = basePrices.engraving[material as keyof typeof basePrices.engraving] || 50;
    materialCost = (area / 100) * pricePerCm2; // Convert mm² to cm²
    basePrice = Math.max(150, materialCost); // Minimum base price
  }

  const quantityMultiplier = quantity > 1 ? 1 + (quantity - 1) * 0.8 : 1; // Bulk discount
  const totalPrice = (basePrice + setupFee) * quantityMultiplier;

  return Math.round(totalPrice);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending': return 'bg-gray-100 text-gray-800';
    case 'quoted': return 'bg-blue-100 text-blue-800';
    case 'confirmed': return 'bg-green-100 text-green-800';
    case 'dispatched': return 'bg-purple-100 text-purple-800';
    case 'accepted': return 'bg-indigo-100 text-indigo-800';
    case 'in_progress': return 'bg-yellow-100 text-yellow-800';
    case 'completed': return 'bg-emerald-100 text-emerald-800';
    case 'delivered': return 'bg-teal-100 text-teal-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'pending': return 'Pending Review';
    case 'quoted': return 'Quote Ready';
    case 'confirmed': return 'Order Confirmed';
    case 'dispatched': return 'Finding Provider';
    case 'accepted': return 'Provider Assigned';
    case 'in_progress': return 'In Production';
    case 'completed': return 'Ready for Pickup';
    case 'delivered': return 'Delivered';
    default: return status.replace('_', ' ').toUpperCase();
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Cross-platform integration utilities
export function createStoreOrderPayload(serviceOrder: any) {
  return {
    id: serviceOrder.store_order_id || `service_${serviceOrder.id}`,
    user_id: serviceOrder.user_id,
    type: 'service',
    service_type: serviceOrder.service_type,
    status: mapServiceStatusToStoreStatus(serviceOrder.status),
    items: [{
      id: serviceOrder.id,
      name: `${serviceOrder.service_type === 'printing' ? '3D Print' : 'Laser Engrave'} - ${serviceOrder.material}`,
      description: `Custom ${serviceOrder.service_type} service`,
      quantity: serviceOrder.quantity,
      price: serviceOrder.total_price,
      image: serviceOrder.preview_url,
      service_order_id: serviceOrder.id,
    }],
    total: serviceOrder.total_price,
    created_at: serviceOrder.created_at,
    updated_at: serviceOrder.updated_at,
    tracking: {
      service_order_id: serviceOrder.id,
      provider_id: serviceOrder.provider_id,
      provider_name: serviceOrder.provider_name,
      estimated_completion: serviceOrder.estimated_completion,
      status_updates: serviceOrder.status_updates,
    }
  };
}

function mapServiceStatusToStoreStatus(serviceStatus: string): string {
  const statusMap: { [key: string]: string } = {
    'pending': 'pending',
    'quoted': 'processing',
    'confirmed': 'confirmed',
    'dispatched': 'processing',
    'accepted': 'processing',
    'in_progress': 'processing',
    'completed': 'ready',
    'delivered': 'completed',
  };

  return statusMap[serviceStatus] || 'pending';
}