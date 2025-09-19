'use client';

import { useEffect, useState, useMemo } from 'react';
import { withAuth } from '@/contexts/AuthContext';
import { storeApi } from '@/services/storeApi';
import { Button } from '@/components/ui/Button';

interface AdminNotification {
  id: string;
  user_id?: string;
  email?: string;
  type: string;
  status: string;
  subject?: string;
  message: string;
  timestamp?: string;
  read?: boolean;
  related_type?: string;
  related_id?: string;
  provider?: string;
}

function AdminNotificationsPage() {
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  // Filters
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [read, setRead] = useState<string>(''); // "" | "true" | "false"
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page, per_page: perPage };
      if (userId) params.user_id = userId;
      if (email) params.email = email;
      if (type) params.type = type;
      if (status) params.status = status;
      if (read === 'true') params.read = true;
      if (read === 'false') params.read = false;
      if (dateFrom) params.date_from = new Date(dateFrom).toISOString();
      if (dateTo) params.date_to = new Date(dateTo).toISOString();

      const res = await storeApi.getAdminNotifications(params);
      setItems(res.notifications || []);
      setTotal(res.total);
      setPages(res.pages);
    } catch (e: any) {
      setError(e?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage]);

  const resetAndSearch = () => {
    setPage(1);
    load();
  };

  const seed = async () => {
    try {
      setLoading(true);
      await storeApi.seedAdminNotifications(userId || undefined, 5);
      await load();
      alert('Seeded sample notifications');
    } catch (e: any) {
      alert(e?.message || 'Failed to seed notifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Notifications</h1>
            <p className="text-gray-600">Browse and filter system notifications</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={seed}>
              Seed Sample
            </Button>
            <Button variant="outline" size="sm" onClick={load}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">User ID</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="user-uuid"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Email</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Type</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="info, email, push"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Status</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                placeholder="pending, sent, delivered"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Read</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={read}
                onChange={(e) => setRead(e.target.value)}
              >
                <option value="">Any</option>
                <option value="true">Read</option>
                <option value="false">Unread</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-700 mb-1">From</label>
                <input
                  type="date"
                  className="w-full border rounded px-3 py-2"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">To</label>
                <input
                  type="date"
                  className="w-full border rounded px-3 py-2"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Button onClick={resetAndSearch}>Apply Filters</Button>
            <Button
              variant="ghost"
              onClick={() => {
                setUserId('');
                setEmail('');
                setType('');
                setStatus('');
                setRead('');
                setDateFrom('');
                setDateTo('');
                setPage(1);
              }}
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <Th>Time</Th>
                <Th>User</Th>
                <Th>Type</Th>
                <Th>Status</Th>
                <Th>Subject</Th>
                <Th>Message</Th>
                <Th>Read</Th>
                <Th>Provider</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-gray-500">
                    No notifications found
                  </td>
                </tr>
              ) : (
                items.map((n) => (
                  <tr key={n.id} className="hover:bg-gray-50">
                    <Td>{n.timestamp ? new Date(n.timestamp).toLocaleString() : '-'}</Td>
                    <Td>
                      <div className="text-sm text-gray-900">{n.user_id || '-'}</div>
                      <div className="text-xs text-gray-500">{n.email || ''}</div>
                    </Td>
                    <Td>{n.type}</Td>
                    <Td>{n.status}</Td>
                    <Td className="max-w-xs truncate" title={n.subject || ''}>
                      {n.subject || '-'}
                    </Td>
                    <Td className="max-w-md truncate" title={n.message}>
                      {n.message}
                    </Td>
                    <Td>{n.read ? 'Yes' : 'No'}</Td>
                    <Td>{n.provider || '-'}</Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            Page {page} of {pages} • {total} total
          </div>
          <div className="flex items-center gap-2">
            <select
              className="border rounded px-2 py-1"
              value={perPage}
              onChange={(e) => {
                setPerPage(parseInt(e.target.value));
                setPage(1);
              }}
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}/page
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page >= pages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Th({ children, className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap ${className || ''}`}
      {...props}
    >
      {children}
    </th>
  );
}

function Td({ children, className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`px-4 py-3 text-sm text-gray-900 align-top ${className || ''}`} {...props}>
      {children}
    </td>
  );
}

export default withAuth(AdminNotificationsPage, ['admin']);
