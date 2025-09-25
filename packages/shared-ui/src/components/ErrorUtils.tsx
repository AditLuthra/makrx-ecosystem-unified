// shared error utility for consistent API and UI error handling
export interface NormalizedError {
  code: string;
  message: string;
  status?: number;
  details?: any;
}

export function normalizeApiError(error: any): NormalizedError {
  if (error instanceof Error) {
    return {
      code: 'INTERNAL_ERROR',
      message: error.message,
    };
  }
  if (typeof error === 'object' && error !== null) {
    return {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      status: error.status,
      details: error.details,
    };
  }
  return {
    code: 'UNKNOWN_ERROR',
    message: String(error),
  };
}

// Example: error display component for frontends
import React from 'react';

export const ErrorMessage: React.FC<{ error: NormalizedError }> = ({ error }) => (
  <div style={{ color: 'red', padding: 8 }}>
    <strong>Error:</strong> {error.message}
    {error.code && <div>Code: {error.code}</div>}
    {error.status && <div>Status: {error.status}</div>}
  </div>
);
