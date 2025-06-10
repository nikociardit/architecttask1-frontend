import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { withAuth } from '../../contexts/AuthContext';
import apiClient, { Statistics } from '../../lib/api';
import {
  UsersIcon,
  ComputerDesktopIcon,
  CommandLineIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  WifiIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

interface DashboardStats {
  users: Statistics;
  clients: Statistics;
  tasks: Statistics;
  audit: any;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, change }) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                {change && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    change.type === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {change.type === 'increase' ? '+' : '-'}{change.value}%
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [userStats, clientStats, taskStats, auditStats, alerts] = await Promise.all([
        apiClient.getUserStats(),
        apiClient.getClientStats(),
        apiClient.getTaskStats(),
        apiClient.getAuditStats(),
        apiClient.getSecurityAlerts().catch(() => null)
      ]);

      setStats({
        users: userStats,
        clients: clientStats,
        tasks: taskStats,
        audit: auditStats
      });
      
      setSecurityAlerts(alerts);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  // Prepare chart data
  const clientStatusData = [
    { name: 'Online', value: stats?.clients.online_clients || 0, color: '#10B981' },
    { name: 'Offline', value: (stats?.clients.total_clients || 0) - (stats?.clients.online_clients || 0), color: '#EF4444' }
  ];

  const taskStatusData = [
    { name: 'Completed', value: stats?.tasks.completed_tasks || 0, color: '#10B981' },
    { name: 'Running', value: stats?.tasks.running_tasks || 0, color: '#F59E0B' },
    { name: 'Pending', value: stats?.tasks.pending_tasks || 0, color: '#6B7280' },
    { name: 'Failed', value: stats?.tasks.failed_tasks || 0, color: '#EF4444' }
  ];

  const dailyActivity = stats?.audit?.daily_activity || [];

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* Security Alerts */}
        {securityAlerts && securityAlerts.alert_count > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>{securityAlerts.alert_count} security alert{securityAlerts.alert_count > 1 ? 's' : ''}</strong> require attention.
                  <a href="/dashboard/security" className="font-medium underline text-yellow-700 hover:text-yellow-600 ml-2">
                    View details →
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={stats?.users.total_users || 0}
            icon={UsersIcon}
            color="text-blue-600"
          />
          <StatCard
            title="Online Clients"
            value={`${stats?.clients.online_clients || 0} / ${stats?.clients.total_clients || 0}`}
            icon={ComputerDesktopIcon}
            color="text-green-600"
          />
          <StatCard
            title="Running Tasks"
            value={stats?.tasks.running_tasks || 0}
            icon={CommandLineIcon}
            color="text-yellow-600"
          />
          <StatCard
            title="VPN Connected"
            value={stats?.clients.vpn_connected_clients || 0}
            icon={ShieldCheckIcon}
            color="text-purple-600"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client Status Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Client Status</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={clientStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {clientStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              {clientStatusData.map((item) => (
                <div key={item.name} className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Task Status Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Task Status</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Activity Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Activity (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="text-sm font-medium text-green-600">
                  {stats?.tasks.success_rate || 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="text-sm font-medium">{stats?.users.active_users || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Workstations</span>
                <span className="text-sm font-medium">{stats?.clients.workstations || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Servers</span>
                <span className="text-sm font-medium">{stats?.clients.servers || 0}</span>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm text-gray-600">API Status: Online</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm text-gray-600">Database: Connected</span>
              </div>
              <div className="flex items-center">
                <WifiIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm text-gray-600">VPN Server: Active</span>
              </div>
              <div className="flex items-center">
                <ShieldCheckIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm text-gray-600">Security: Protected</span>
              </div>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Alerts</h3>
            {securityAlerts && securityAlerts.alerts?.length > 0 ? (
              <div className="space-y-2">
                {securityAlerts.alerts.slice(0, 4).map((alert: any, index: number) => (
                  <div key={index} className="text-sm">
                    <div className={`inline-block px-2 py-1 rounded text-xs ${
                      alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.type}
                    </div>
                    <div className="text-gray-600 mt-1">{alert.message}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No recent alerts</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default withAuth(Dashboard);
