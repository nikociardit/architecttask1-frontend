import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { withAuth, usePermissions } from '../../contexts/AuthContext';
import apiClient from '../../lib/api';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  ClockIcon,
  EyeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface SecurityAlert {
  type: string;
  severity: string;
  message: string;
  timestamp?: string;
  ip_address?: string;
  count?: number;
}

const Security: React.FC = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedHours, setSelectedHours] = useState(24);
  const [showModal, setShowModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const { canViewAuditLogs } = usePermissions();

  useEffect(() => {
    if (!canViewAuditLogs()) {
      toast.error('Access denied: Security monitoring privileges required');
      return;
    }
    loadSecurityData();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(loadSecurityData, 60000);
    return () => clearInterval(interval);
  }, [selectedHours]);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      const [alertsResponse, statsResponse] = await Promise.all([
        apiClient.getSecurityAlerts(),
        apiClient.getAuditStats()
      ]);
      
      setAlerts(alertsResponse?.alerts || []);
      setStats(statsResponse);
    } catch (error) {
      console.error('Failed to load security data:', error);
      toast.error('Failed to load security data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAlert = (alert: SecurityAlert) => {
    setSelectedAlert(alert);
    setShowModal(true);
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

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <ShieldExclamationIcon className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
      default:
        return <ShieldCheckIcon className="h-5 w-5 text-blue-600" />;
    }
  };

  const getAlertTypeDisplayName = (type: string) => {
    const typeNames: { [key: string]: string } = {
      'multiple_failed_logins': 'Multiple Failed Logins',
      'security_violation': 'Security Violation',
      'unauthorized_access': 'Unauthorized Access',
      'permission_denied': 'Permission Denied',
      'suspicious_activity': 'Suspicious Activity'
    };
    
    return typeNames[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (!canViewAuditLogs()) {
    return (
      <Layout title="Security">
        <div className="text-center py-12">
          <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to view security information.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Security">
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Security Center</h1>
            <p className="mt-2 text-sm text-gray-700">
              Monitor security events and system threats
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <select
              value={selectedHours}
              onChange={(e) => setSelectedHours(Number(e.target.value))}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <option value={1}>Last Hour</option>
              <option value={24}>Last 24 Hours</option>
              <option value={168}>Last Week</option>
            </select>
            <button
              onClick={loadSecurityData}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Security Status Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShieldCheckIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Security Status</dt>
                    <dd className="text-lg font-medium text-green-600">Protected</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className={`h-6 w-6 ${alerts.length > 0 ? 'text-yellow-600' : 'text-green-600'}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Alerts</dt>
                    <dd className={`text-lg font-medium ${alerts.length > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {alerts.length}
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
                  <ShieldExclamationIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Failed Logins</dt>
                    <dd className="text-lg font-medium text-red-600">
                      {stats?.failed_logins || 0}
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
                  <ClockIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Last Updated</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {new Date().toLocaleTimeString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Alerts */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Security Alerts
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Recent security events requiring attention
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading security alerts...</p>
            </div>
          ) : alerts.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {alerts.map((alert, index) => (
                <div key={index} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {getSeverityIcon(alert.severity)}
                      </div>
                      <div className="ml-3">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            {getAlertTypeDisplayName(alert.type)}
                          </h4>
                          {getSeverityBadge(alert.severity)}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                        <div className="text-xs text-gray-500 mt-1 space-x-4">
                          {alert.ip_address && (
                            <span>IP: {alert.ip_address}</span>
                          )}
                          {alert.count && (
                            <span>Count: {alert.count}</span>
                          )}
                          {alert.timestamp && (
                            <span>Time: {new Date(alert.timestamp).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => handleViewAlert(alert)}
                        className="text-primary-600 hover:text-primary-900"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShieldCheckIcon className="mx-auto h-12 w-12 text-green-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Security Alerts</h3>
              <p className="mt-1 text-sm text-gray-500">
                No security issues detected in the selected time period.
              </p>
            </div>
          )}
        </div>

        {/* Security Recommendations */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Security Recommendations
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Suggested actions to improve system security
            </p>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <ShieldCheckIcon className="h-5 w-5 text-green-500 mt-0.5" />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">Enable Multi-Factor Authentication</h4>
                  <p className="text-sm text-gray-600">
                    Add an extra layer of security to user accounts by enabling MFA.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <ShieldCheckIcon className="h-5 w-5 text-green-500 mt-0.5" />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">Regular Password Updates</h4>
                  <p className="text-sm text-gray-600">
                    Encourage users to update passwords regularly and use strong passwords.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <ShieldCheckIcon className="h-5 w-5 text-green-500 mt-0.5" />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">Monitor VPN Connections</h4>
                  <p className="text-sm text-gray-600">
                    Regularly review VPN access logs and ensure only authorized connections.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <ShieldCheckIcon className="h-5 w-5 text-green-500 mt-0.5" />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">Keep Systems Updated</h4>
                  <p className="text-sm text-gray-600">
                    Ensure all client systems are running the latest security updates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Details Modal */}
        {showModal && selectedAlert && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)}></div>
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Security Alert Details
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Alert Type</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {getAlertTypeDisplayName(selectedAlert.type)}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Severity</label>
                      <div className="mt-1">
                        {getSeverityBadge(selectedAlert.severity)}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Message</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedAlert.message}</p>
                    </div>
                    
                    {selectedAlert.ip_address && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">IP Address</label>
                        <p className="mt-1 text-sm text-gray-900 font-mono">{selectedAlert.ip_address}</p>
                      </div>
                    )}
                    
                    {selectedAlert.count && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Occurrence Count</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedAlert.count}</p>
                      </div>
                    )}
                    
                    {selectedAlert.timestamp && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(selectedAlert.timestamp).toLocaleString()}
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

export default withAuth(Security);
