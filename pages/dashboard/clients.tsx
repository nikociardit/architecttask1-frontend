import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { withAuth, usePermissions } from '../../contexts/AuthContext';
import apiClient, { Client } from '../../lib/api';
import { useForm } from 'react-hook-form';
import {
  ComputerDesktopIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  EyeIcon,
  WifiIcon,
  ShieldCheckIcon,
  XMarkIcon,
  ClockIcon,
  CpuChipIcon,
  ServerIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface ClientForm {
  hostname?: string;
  location?: string;
  assigned_user_id?: number;
  rdp_enabled?: boolean;
  screen_access_enabled?: boolean;
  task_execution_enabled?: boolean;
}

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [page, setPage] = useState(1);
  const [totalClients, setTotalClients] = useState(0);
  const { canManageClients } = usePermissions();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientForm>();

  useEffect(() => {
    loadClients();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadClients, 30000);
    return () => clearInterval(interval);
  }, [page, searchTerm, statusFilter]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getClients(
        page, 
        50, 
        searchTerm || undefined, 
        statusFilter || undefined
      );
      setClients(response.data);
      setTotalClients(response.total || 0);
    } catch (error) {
      console.error('Failed to load clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const handleViewClient = async (client: Client) => {
    try {
      const fullClient = await apiClient.getClient(client.id);
      setSelectedClient(fullClient);
      setShowModal(true);
    } catch (error) {
      console.error('Failed to load client details:', error);
      toast.error('Failed to load client details');
    }
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    reset({
      hostname: client.hostname,
      location: client.location || '',
      rdp_enabled: client.rdp_enabled,
      screen_access_enabled: client.screen_access_enabled,
      task_execution_enabled: client.task_execution_enabled
    });
    setShowModal(true);
  };

  const onSubmit = async (data: ClientForm) => {
    if (!selectedClient) return;

    try {
      await apiClient.updateClient(selectedClient.id, data);
      toast.success('Client updated successfully');
      setShowModal(false);
      loadClients();
    } catch (error: any) {
      console.error('Failed to update client:', error);
      toast.error(error.response?.data?.detail || 'Failed to update client');
    }
  };

  const getStatusBadge = (client: Client) => {
    const isOnline = client.status === 'online';
    const lastSeen = client.last_heartbeat ? new Date(client.last_heartbeat) : null;
    const isRecent = lastSeen && (Date.now() - lastSeen.getTime()) < 5 * 60 * 1000; // 5 minutes

    if (isOnline && isRecent) {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Online</span>;
    } else {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Offline</span>;
    }
  };

  const getClientTypeIcon = (type: string) => {
    switch (type) {
      case 'server':
        return <ServerIcon className="h-5 w-5 text-purple-600" />;
      case 'laptop':
        return <ComputerDesktopIcon className="h-5 w-5 text-blue-600" />;
      default:
        return <ComputerDesktopIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  if (!canManageClients()) {
    return (
      <Layout title="Clients">
        <div className="text-center py-12">
          <ComputerDesktopIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to manage clients.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Clients">
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
            <p className="mt-2 text-sm text-gray-700">
              Monitor and manage connected endpoints
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={loadClients}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Search</label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  placeholder="Search clients..."
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
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="">All Status</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            <div className="flex items-end">
              <span className="text-sm text-gray-500">
                {totalClients} client{totalClients !== 1 ? 's' : ''} total
              </span>
            </div>
          </div>
        </div>

        {/* Clients Grid */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading clients...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 p-6">
              {clients.map((client) => (
                <div key={client.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      {getClientTypeIcon(client.client_type)}
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-900">{client.hostname}</h3>
                        <p className="text-xs text-gray-500">{client.client_id}</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      {client.vpn_connected && (
                        <ShieldCheckIcon className="h-4 w-4 text-green-500" title="VPN Connected" />
                      )}
                      {client.status === 'online' && (
                        <WifiIcon className="h-4 w-4 text-green-500" title="Online" />
                      )}
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Status:</span>
                      {getStatusBadge(client)}
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">OS:</span>
                      <span className="text-xs text-gray-900">{client.os_version || 'Unknown'}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">IP:</span>
                      <span className="text-xs text-gray-900">{client.ip_address || 'Unknown'}</span>
                    </div>
                    
                    {client.last_heartbeat && (
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Last Seen:</span>
                        <span className="text-xs text-gray-900">
                          {formatDistanceToNow(new Date(client.last_heartbeat), { addSuffix: true })}
                        </span>
                      </div>
                    )}
                    
                    {client.location && (
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Location:</span>
                        <span className="text-xs text-gray-900">{client.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => handleViewClient(client)}
                      className="text-primary-600 hover:text-primary-900"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditClient(client)}
                      className="text-gray-600 hover:text-gray-900"
                      title="Edit Client"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {clients.length === 0 && !loading && (
            <div className="text-center py-12">
              <ComputerDesktopIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No clients found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Clients will appear here once they connect to the system.
              </p>
            </div>
          )}
        </div>

        {/* Client Details/Edit Modal */}
        {showModal && selectedClient && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)}></div>
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Client Details: {selectedClient.hostname}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Basic Information</h4>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Client ID:</span>
                          <span className="text-gray-900 font-mono">{selectedClient.client_id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Hostname:</span>
                          <span className="text-gray-900">{selectedClient.hostname}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Status:</span>
                          {getStatusBadge(selectedClient)}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Type:</span>
                          <span className="text-gray-900 capitalize">{selectedClient.client_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">OS Version:</span>
                          <span className="text-gray-900">{selectedClient.os_version || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">IP Address:</span>
                          <span className="text-gray-900">{selectedClient.ip_address || 'Unknown'}</span>
                        </div>
                        {selectedClient.vpn_ip_address && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">VPN IP:</span>
                            <span className="text-gray-900">{selectedClient.vpn_ip_address}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Settings */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Settings</h4>
                      
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Location</label>
                          <input
                            {...register('location')}
                            type="text"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            placeholder="Office, Building, etc."
                          />
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center">
                            <input
                              {...register('rdp_enabled')}
                              type="checkbox"
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                              Enable RDP Access
                            </label>
                          </div>

                          <div className="flex items-center">
                            <input
                              {...register('screen_access_enabled')}
                              type="checkbox"
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                              Enable Screen Access
                            </label>
                          </div>

                          <div className="flex items-center">
                            <input
                              {...register('task_execution_enabled')}
                              type="checkbox"
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                              Enable Task Execution
                            </label>
                          </div>
                        </div>

                        <div className="pt-4">
                          <button
                            type="submit"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
                          >
                            Update Client
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Additional Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Created:</span>
                        <span className="ml-2 text-gray-900">
                          {new Date(selectedClient.created_at).toLocaleString()}
                        </span>
                      </div>
                      {selectedClient.last_heartbeat && (
                        <div>
                          <span className="text-gray-500">Last Heartbeat:</span>
                          <span className="ml-2 text-gray-900">
                            {new Date(selectedClient.last_heartbeat).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default withAuth(Clients);
