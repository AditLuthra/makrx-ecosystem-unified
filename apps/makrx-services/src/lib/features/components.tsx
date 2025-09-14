/**
 * React components for feature flag functionality
 */

'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import { 
  FeatureFlagValue, 
  AccessLevel,
  FEATURE_FLAGS,
  EXPERIMENTAL_FEATURES 
} from './types';
import { useFeatureFlags, useFeature, useAdminFeatures } from './context';
import { usePasswordProtectedFeature, useFeatureFlagDebug } from './hooks';

// Feature Gate Component
interface FeatureGateProps {
  feature: FeatureFlagValue;
  fallback?: ReactNode;
  children: ReactNode;
  requireAuth?: boolean;
  className?: string;
}

export function FeatureGate({ 
  feature, 
  fallback = null, 
  children, 
  requireAuth = false,
  className 
}: FeatureGateProps) {
  const { isEnabled } = useFeature(feature);
  const { userContext } = useFeatureFlags();

  // Check authentication requirement
  if (requireAuth && !userContext.is_authenticated) {
    return <>{fallback}</>;
  }

  // Check feature availability
  if (!isEnabled) {
    return <>{fallback}</>;
  }

  return <div className={className}>{children}</div>;
}

// Beta Feature Badge
interface BetaFeatureBadgeProps {
  feature: FeatureFlagValue;
  className?: string;
}

export function BetaFeatureBadge({ feature, className = '' }: BetaFeatureBadgeProps) {
  const { isBeta } = useFeature(feature);

  if (!isBeta) return null;

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ${className}`}>
      Beta
    </span>
  );
}

// Password Protected Feature Component
interface PasswordProtectedFeatureProps {
  feature: FeatureFlagValue;
  children: ReactNode;
  onUnlock?: () => void;
  className?: string;
}

export function PasswordProtectedFeature({
  feature,
  children,
  onUnlock,
  className = ''
}: PasswordProtectedFeatureProps) {
  const [inputPassword, setInputPassword] = useState('');
  const { 
    isUnlocked, 
    isVerifying, 
    error, 
    verifyPassword, 
    clearPassword 
  } = usePasswordProtectedFeature(feature);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyPassword(inputPassword);
    if (onUnlock) onUnlock();
  };

  if (isUnlocked) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`feature-password-gate ${className}`}>
      <div className="max-w-md mx-auto p-6 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center mb-4">
          <div className="w-12 h-12 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Password Required</h3>
          <p className="text-sm text-gray-500 mt-1">
            This feature requires a password to access.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="feature-password" className="sr-only">
              Feature Password
            </label>
            <input
              id="feature-password"
              type="password"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter password"
              disabled={isVerifying}
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
              {error}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={!inputPassword || isVerifying}
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? 'Verifying...' : 'Unlock Feature'}
            </button>
            <button
              type="button"
              onClick={clearPassword}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Service Availability Indicator
interface ServiceAvailabilityProps {
  serviceType: 'printing' | 'laser' | 'cnc' | 'injection';
  showBadge?: boolean;
  className?: string;
}

export function ServiceAvailability({ 
  serviceType, 
  showBadge = true,
  className = '' 
}: ServiceAvailabilityProps) {
  const { isServiceEnabled } = useFeatureFlags();
  const isEnabled = isServiceEnabled(serviceType);

  const serviceNames = {
    printing: '3D Printing',
    laser: 'Laser Engraving',
    cnc: 'CNC Machining',
    injection: 'Injection Molding'
  };

  if (!showBadge) {
    return null;
  }

  return (
    <span 
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        isEnabled 
          ? 'bg-green-100 text-green-800' 
          : 'bg-gray-100 text-gray-800'
      } ${className}`}
    >
      <div 
        className={`w-2 h-2 rounded-full mr-1 ${
          isEnabled ? 'bg-green-400' : 'bg-gray-400'
        }`}
      />
      {serviceNames[serviceType]} {isEnabled ? 'Available' : 'Unavailable'}
    </span>
  );
}

// Feature Flag Admin Panel
interface FeatureFlagAdminPanelProps {
  authToken: string;
  className?: string;
}

export function FeatureFlagAdminPanel({ authToken, className = '' }: FeatureFlagAdminPanelProps) {
  const { canManageFeatureFlags } = useAdminFeatures();
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<AccessLevel>(AccessLevel.ENABLED);

  if (!canManageFeatureFlags) {
    return (
      <div className="text-center py-8 text-gray-500">
        You don't have permission to manage feature flags.
      </div>
    );
  }

  return (
    <div className={`feature-flag-admin ${className}`}>
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Feature Flag Management
          </h3>
          
          {/* Bulk Actions */}
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Bulk Actions</h4>
            <div className="flex items-center space-x-4">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value as AccessLevel)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value={AccessLevel.ENABLED}>Enable</option>
                <option value={AccessLevel.DISABLED}>Disable</option>
                <option value={AccessLevel.BETA}>Beta Only</option>
                <option value={AccessLevel.PASSWORD_ONLY}>Password Only</option>
              </select>
              <button 
                disabled={selectedFlags.length === 0}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                Apply to {selectedFlags.length} flags
              </button>
            </div>
          </div>

          {/* Feature Flags List would go here */}
          <div className="text-sm text-gray-500">
            Feature flags management interface would be implemented here with full CRUD operations.
          </div>
        </div>
      </div>
    </div>
  );
}

// Experimental Feature Warning
interface ExperimentalFeatureWarningProps {
  feature: FeatureFlagValue;
  children: ReactNode;
  className?: string;
}

export function ExperimentalFeatureWarning({ 
  feature, 
  children, 
  className = '' 
}: ExperimentalFeatureWarningProps) {
  const isExperimental = EXPERIMENTAL_FEATURES.includes(feature);
  const [acknowledged, setAcknowledged] = useState(false);

  if (!isExperimental) {
    return <>{children}</>;
  }

  if (!acknowledged) {
    return (
      <div className={`experimental-warning ${className}`}>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Experimental Feature
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  This feature is experimental and may not work as expected. 
                  Use at your own risk. Data may be lost or corrupted.
                </p>
              </div>
              <div className="mt-4">
                <div className="-mx-2 -my-1.5 flex">
                  <button
                    type="button"
                    onClick={() => setAcknowledged(true)}
                    className="bg-yellow-50 px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
                  >
                    I Understand, Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Feature Flag Debug Panel (Development only)
export function FeatureFlagDebugPanel() {
  const {
    debugMode,
    testContext,
    debugFeatures,
    toggleDebugMode,
    testAsBetaUser,
    testAsProvider,
    testAsAdmin,
  } = useFeatureFlagDebug();

  if (!debugMode) {
    return (
      <button
        onClick={toggleDebugMode}
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-full text-sm hover:bg-gray-700 shadow-lg z-50"
      >
        Debug Features
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white shadow-xl rounded-lg border border-gray-200 z-50">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Feature Debug</h3>
          <button
            onClick={toggleDebugMode}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Test as:</p>
            <div className="flex space-x-2">
              <button
                onClick={testAsBetaUser}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200"
              >
                Beta User
              </button>
              <button
                onClick={testAsProvider}
                className="px-3 py-1 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200"
              >
                Provider
              </button>
              <button
                onClick={testAsAdmin}
                className="px-3 py-1 bg-purple-100 text-purple-800 rounded text-xs hover:bg-purple-200"
              >
                Admin
              </button>
            </div>
          </div>

          {debugFeatures && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Enabled Features: {debugFeatures.enabled.length}
              </p>
              <div className="max-h-32 overflow-y-auto text-xs text-gray-600">
                {debugFeatures.enabled.map(feature => (
                  <div key={feature} className="py-1">{feature}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}