import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { withAuth, usePermissions } from '../../contexts/AuthContext';
import apiClient, { AuditLog } from '../../lib/api';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  EyeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const Audit: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [page, setPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [availableActions, setAvailableActions] = useState<string[]>([]);
  const { canViewAuditLogs, canExportData } = usePermissions();

  useEffect(() => {
    if (!canViewAuditLogs()) {
      toast.error('Access denied: Audit log viewing privileges required');
      return;
    }
    loadLogs();
    loadAvailableActions();
  }, [page, searchTerm, actionFilter, severityFilter, startDate, endDate]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (searchTerm) filters.search = searchTerm;
      if (actionFilter) filters.action = actionFilter;
      if (severityFilter) filters.severity = severityFilter;
      if (startDate) filters.start_date = startDate;
      if (endDate) filters.end_date = endDate;

      const response = await apiClient.getAuditLogs(page, 100, filters);
      setLogs(response.data);
      setTotalLogs(response.total || 0);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableActions = async () => {
    try {
      const response = await apiClient.getAuditStats();
      // Extract actions from the response - this might need adjustment based on actual API response
      setAvailableActions([
        'login', 'logout', 'login_failed', 'user_created', 'user_updated', 'user_deleted',
        'client_registered', 'client_updated', 'task_created', 'task_executed',
        'unauthorized_access', 'permission_denied', 'security_violation'
      ]);
    } catch (error) {
      console.error('Failed to load available actions:', error);
    }
  };

  const handleViewLog = (log: AuditLog) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  const handleExport = async () => {
    if (!canExportData()) {
      toast.error('Access denied: Data export privileges required');
      return;
    }

    try {
      const filters: any = {};
      if (searchTerm) filters.search = searchTerm;
      if (actionFilter) filters.action = actionFilter;
      if (severityFilter) filters.severity = severityFilter;
      if (startDate) filters.start_date = startDate;
      if (endDate) filters.end_date = endDate;

      const blob = await apiClient.exportAuditLogs(filters);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Audit logs exported successfully');
    } catch (error) {
      console.error('Failed to export audit logs:', error);
      toast.error('Failed to export audit logs');
    }
  };

  const getSeverityBadge = (severity: string) => {
    const badges = {
      info: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      critical: 'bg-red-200 text-red-900'
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${badges[severity as keyof typeof badges] || badges.info}`}>
        {severity}
      </span>
    );
  };

  const getActionBadge = (action: string) => {
    const securityActions = ['login_failed', 'unauthorized_access', 'permission_denied', 'security_violation'];
    const isSecurityAction = securityActions.includes(action);
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
        isSecurityAction ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {action.replace(/_/g, ' ')}
      </span>
    );
  };

  if (!canViewAuditLogs()) {
    return (
      <Layout title="Audit Logs">
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to view audit logs.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Audit Logs">
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
            <p className="mt-2 text-sm text-gray-700">
              Monitor system activity and security events
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            {canExportData() && (
              <button
                onClick={handleExport}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export CSV
              </button>
            )}
            <button
              onClick={loadLogs}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Search</label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Action</label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="">All Actions</option>
                {availableActions.map((action) => (
                  <option key={action} value={action}>
                    {action.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Severity</label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="">All Severities</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {totalLogs} log{totalLogs !== 1 ? 's' : ''} found
            </span>
            {(searchTerm || actionFilter || severityFilter || startDate || endDate) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setActionFilter('');
                  setSeverityFilter('');
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-sm text-primary-600 hover:text-primary-900"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading audit logs...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          {new Date(log.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                        {log.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getSeverityBadge(log.severity)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.ip_address || 'System'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewLog(log)}
                          className="text-primary-600 hover:text-primary-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {logs.length === 0 && (
                <div className="text-center py-12">
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No audit logs found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search criteria or date range.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Log Details Modal */}
        {showModal && selectedLog && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)}></div>
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Audit Log Details
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(selectedLog.timestamp).toLocaleString()}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Action</label>
                        <div className="mt-1">
                          {getActionBadge(selectedLog.action)}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Severity</label>
                        <div className="mt-1">
                          {getSeverityBadge(selectedLog.severity)}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">IP Address</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedLog.ip_address || 'Not available'}
                        </p>
                      </div>
                      
                      {selectedLog.user_id && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">User ID</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedLog.user_id}</p>
                        </div>
                      )}
                      
                      {selectedLog.client_id && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Client ID</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedLog.client_id}</p>
                        </div>
                      )}
                      
                      {selectedLog.task_id && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Task ID</label>
                          <p className="mt-1 text-sm text-gray-900 font-mono">{selectedLog.task_id}</p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedLog.description}</p>
                    </div>
                    
                    {selectedLog.user_agent && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">User Agent</label>
                        <p className="mt-1 text-sm text-gray-900 font-mono break-all">
                          {selectedLog.user_agent}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:w-auto sm:text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default withAuth(Audit);
