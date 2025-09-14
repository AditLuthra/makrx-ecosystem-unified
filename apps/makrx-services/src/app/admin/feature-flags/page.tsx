"use client";

import React, { useState, useEffect } from "react";
import { useKeycloak } from "@makrx/auth";
import {
  AccessLevel,
  FEATURE_FLAGS,
  FEATURE_TAGS,
  SERVICE_FEATURES,
  ADMIN_FEATURES,
  EXPERIMENTAL_FEATURES,
} from "@/lib/features/types";
import { useAdminFeatures } from "@/lib/features/context";
import { useAdminFeatureFlags } from "@/lib/features/hooks";
import { featureFlagsClient } from "@/lib/features/client";

interface FeatureFlagRowProps {
  flag: any;
  onUpdate: (key: string, level: AccessLevel) => void;
  onCreateOverride: (key: string, level: AccessLevel) => void;
  onRemoveOverride: (key: string) => void;
}

function FeatureFlagRow({
  flag,
  onUpdate,
  onCreateOverride,
  onRemoveOverride,
}: FeatureFlagRowProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleLevelChange = async (newLevel: AccessLevel) => {
    setIsUpdating(true);
    try {
      await onUpdate(flag.key, newLevel);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (level: AccessLevel, isOverride: boolean) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

    let colorClasses = "";
    switch (level) {
      case AccessLevel.ENABLED:
        colorClasses = "bg-green-100 text-green-800";
        break;
      case AccessLevel.BETA:
        colorClasses = "bg-blue-100 text-blue-800";
        break;
      case AccessLevel.PASSWORD_ONLY:
        colorClasses = "bg-yellow-100 text-yellow-800";
        break;
      case AccessLevel.ROLE_BASED:
        colorClasses = "bg-purple-100 text-purple-800";
        break;
      case AccessLevel.DISABLED:
        colorClasses = "bg-gray-100 text-gray-800";
        break;
      default:
        colorClasses = "bg-gray-100 text-gray-800";
    }

    return (
      <span className={`${baseClasses} ${colorClasses}`}>
        {level.replace("_", " ").toUpperCase()}
        {isOverride && " (O)"}
      </span>
    );
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        <div>
          <div className="font-medium">{flag.name}</div>
          <div className="text-xs text-gray-500">{flag.key}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="max-w-xs">
          <p className="truncate">{flag.description}</p>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge(flag.access_level, flag.is_override)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex flex-wrap gap-1">
          {flag.tags.slice(0, 3).map((tag: string) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-800"
            >
              {tag}
            </span>
          ))}
          {flag.tags.length > 3 && (
            <span className="text-xs text-gray-400">
              +{flag.tags.length - 3}
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(flag.updated_at).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
        <select
          value={flag.access_level}
          onChange={(e) => handleLevelChange(e.target.value as AccessLevel)}
          disabled={isUpdating}
          className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {Object.values(AccessLevel).map((level) => (
            <option key={level} value={level}>
              {level.replace("_", " ").toUpperCase()}
            </option>
          ))}
        </select>

        {flag.is_override ? (
          <button
            onClick={() => onRemoveOverride(flag.key)}
            className="text-red-600 hover:text-red-900"
          >
            Remove Override
          </button>
        ) : (
          <button
            onClick={() => onCreateOverride(flag.key, AccessLevel.ENABLED)}
            className="text-indigo-600 hover:text-indigo-900"
          >
            Override
          </button>
        )}
      </td>
    </tr>
  );
}

export default function FeatureFlagsAdminPage() {
  const { canManageFeatureFlags } = useAdminFeatures();
  const [authToken, setAuthToken] = useState<string>("");
  const { isAuthenticated, keycloak } = useKeycloak();
  const [selectedTab, setSelectedTab] = useState<
    "all" | "services" | "admin" | "experimental"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<AccessLevel | "all">("all");
  const [bulkAction, setBulkAction] = useState<AccessLevel>(
    AccessLevel.ENABLED,
  );
  const [selectedFlags, setSelectedFlags] = useState<Set<string>>(new Set());

  const {
    allFlags,
    analytics,
    isLoading,
    error,
    updateFlag,
    createOverride,
    removeOverride,
    bulkUpdate,
    refresh,
  } = useAdminFeatureFlags(authToken);

  useEffect(() => {
    const loadToken = async () => {
      try {
        await keycloak?.updateToken?.(30);
      } catch {}
      const token = keycloak?.getToken?.() || "";
      setAuthToken(token);
    };
    loadToken();
  }, [isAuthenticated, keycloak]);

  if (!canManageFeatureFlags) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You don't have permission to manage feature flags.
          </p>
        </div>
      </div>
    );
  }

  const filteredFlags =
    allFlags?.filter((flag) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !flag.key.toLowerCase().includes(query) &&
          !flag.name.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Level filter
      if (filterLevel !== "all" && flag.access_level !== filterLevel) {
        return false;
      }

      // Tab filter
      switch (selectedTab) {
        case "services":
          return Object.values(SERVICE_FEATURES).flat().includes(flag.key);
        case "admin":
          return ADMIN_FEATURES.includes(flag.key);
        case "experimental":
          return EXPERIMENTAL_FEATURES.includes(flag.key);
        default:
          return true;
      }
    }) || [];

  const handleBulkAction = async () => {
    if (selectedFlags.size === 0) return;

    const updates: Record<string, AccessLevel> = {};
    selectedFlags.forEach((key) => {
      updates[key] = bulkAction;
    });

    try {
      await bulkUpdate(updates);
      setSelectedFlags(new Set());
      // Show success message
    } catch (error) {
      console.error("Bulk update failed:", error);
      // Show error message
    }
  };

  const handleSelectAll = () => {
    if (selectedFlags.size === filteredFlags.length) {
      setSelectedFlags(new Set());
    } else {
      setSelectedFlags(new Set(filteredFlags.map((flag) => flag.key)));
    }
  };

  const handleFlagSelect = (key: string) => {
    const newSelected = new Set(selectedFlags);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedFlags(newSelected);
  };

  if (isLoading && !allFlags) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading feature flags...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Feature Flag Management
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Control feature availability across the MakrX Services platform
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button
                onClick={refresh}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          {analytics && (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                        <span className="text-green-600 text-sm font-medium">
                          EN
                        </span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Enabled
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {analytics.summary?.by_access_level?.enabled || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                        <span className="text-blue-600 text-sm font-medium">
                          β
                        </span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Beta
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {analytics.summary?.by_access_level?.beta || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                        <span className="text-yellow-600 text-sm font-medium">
                          🔒
                        </span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Password
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {analytics.summary?.by_access_level?.password_only ||
                            0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                        <span className="text-gray-600 text-sm font-medium">
                          OFF
                        </span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Disabled
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {analytics.summary?.by_access_level?.disabled || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              {/* Tabs */}
              <div className="sm:hidden">
                <select
                  value={selectedTab}
                  onChange={(e) => setSelectedTab(e.target.value as any)}
                  className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="all">All Features</option>
                  <option value="services">Services</option>
                  <option value="admin">Admin</option>
                  <option value="experimental">Experimental</option>
                </select>
              </div>
              <div className="hidden sm:block">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { key: "all", label: "All Features" },
                    { key: "services", label: "Services" },
                    { key: "admin", label: "Admin" },
                    { key: "experimental", label: "Experimental" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setSelectedTab(tab.key as any)}
                      className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                        selectedTab === tab.key
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Search and filters */}
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="flex-1 min-w-0">
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pr-10 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Search features..."
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <select
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value as any)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Levels</option>
                    {Object.values(AccessLevel).map((level) => (
                      <option key={level} value={level}>
                        {level.replace("_", " ").toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bulk actions */}
              {selectedFlags.size > 0 && (
                <div className="mt-4 p-3 bg-indigo-50 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-indigo-700">
                      {selectedFlags.size} flags selected
                    </span>
                    <div className="flex items-center space-x-3">
                      <select
                        value={bulkAction}
                        onChange={(e) =>
                          setBulkAction(e.target.value as AccessLevel)
                        }
                        className="border border-gray-300 rounded px-3 py-1 text-sm"
                      >
                        {Object.values(AccessLevel).map((level) => (
                          <option key={level} value={level}>
                            {level.replace("_", " ").toUpperCase()}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleBulkAction}
                        className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700"
                      >
                        Apply
                      </button>
                      <button
                        onClick={() => setSelectedFlags(new Set())}
                        className="text-indigo-600 hover:text-indigo-800 text-sm"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Feature flags table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedFlags.size === filteredFlags.length &&
                          filteredFlags.length > 0
                        }
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Feature
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tags
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Updated
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFlags.map((flag) => (
                    <tr key={flag.key}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedFlags.has(flag.key)}
                          onChange={() => handleFlagSelect(flag.key)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <FeatureFlagRow
                        flag={flag}
                        onUpdate={updateFlag}
                        onCreateOverride={createOverride}
                        onRemoveOverride={removeOverride}
                      />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredFlags.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  No feature flags found matching your criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
