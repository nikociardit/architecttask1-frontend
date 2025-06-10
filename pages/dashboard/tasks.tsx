import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { withAuth, usePermissions } from '../../contexts/AuthContext';
import apiClient, { Task, Client } from '../../lib/api';
import { useForm } from 'react-hook-form';
import {
  CommandLineIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  XMarkIcon,
  StopIcon,
  PlayIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface TaskForm {
  name: string;
  description?: string;
  task_type: string;
  command: string;
  arguments?: string;
  timeout_seconds: number;
  priority: string;
  client_id: number;
  run_as_admin: boolean;
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [page, setPage] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const { canExecuteTasks } = usePermissions();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskForm>();

  useEffect(() => {
    if (!canExecuteTasks()) {
      toast.error('Access denied: Task execution privileges required');
      return;
    }
    loadTasks();
    loadClients();
    
    // Auto-refresh every 15 seconds
    const interval = setInterval(loadTasks, 15000);
    return () => clearInterval(interval);
  }, [page, searchTerm, statusFilter]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getTasks(
        page, 
        50, 
        statusFilter || undefined,
        undefined
      );
      setTasks(response.data);
      setTotalTasks(response.total || 0);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const response = await apiClient.getClients(1, 100);
      setClients(response.data);
    } catch (error) {
      console.error('Failed to load clients:', error);
    }
  };

  const handleCreateTask = () => {
    reset({
      name: '',
      description: '',
      task_type: 'powershell',
      command: '',
      arguments: '',
      timeout_seconds: 300,
      priority: 'normal',
      client_id: 0,
      run_as_admin: false
    });
    setViewingTask(null);
    setShowModal(true);
  };

  const handleViewTask = async (task: Task) => {
    try {
      const fullTask = await apiClient.getTask(task.id);
      setViewingTask(fullTask);
      setShowModal(true);
    } catch (error) {
      console.error('Failed to load task details:', error);
      toast.error('Failed to load task details');
    }
  };

  const handleCancelTask = async (task: Task) => {
    if (!confirm(`Are you sure you want to cancel task "${task.name}"?`)) {
      return;
    }

    try {
      await apiClient.cancelTask(task.id);
      toast.success('Task cancelled successfully');
      loadTasks();
    } catch (error: any) {
      console.error('Failed to cancel task:', error);
      toast.error(error.response?.data?.detail || 'Failed to cancel task');
    }
  };

  const onSubmit = async (data: TaskForm) => {
    try {
      await apiClient.createTask(data);
      toast.success('Task created successfully');
      setShowModal(false);
      loadTasks();
    } catch (error: any) {
      console.error('Failed to create task:', error);
      toast.error(error.response?.data?.detail || 'Failed to create task');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      running: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${badges[status as keyof typeof badges] || badges.pending}`}>
        {status}
      </span>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <PlayIcon className="h-4 w-4 text-blue-600" />;
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircleIcon className="h-4 w-4 text-red-600" />;
      case 'cancelled':
        return <StopIcon className="h-4 w-4 text-gray-600" />;
      default:
        return <ClockIcon className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      low: 'bg-gray-100 text-gray-800',
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${badges[priority as keyof typeof badges] || badges.normal}`}>
        {priority}
      </span>
    );
  };

  const getClientName = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.hostname : `Client ${clientId}`;
  };

  if (!canExecuteTasks()) {
    return (
      <Layout title="Tasks">
        <div className="text-center py-12">
          <CommandLineIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to execute tasks.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Tasks">
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <p className="mt-2 text-sm text-gray-700">
              Create and monitor task execution on endpoints
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={loadTasks}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Refresh
            </button>
            <button
              onClick={handleCreateTask}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Task
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
                  placeholder="Search tasks..."
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
                <option value="pending">Pending</option>
                <option value="running">Running</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-end">
              <span className="text-sm text-gray-500">
                {totalTasks} task{totalTasks !== 1 ? 's' : ''} total
              </span>
            </div>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading tasks...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {getStatusIcon(task.status)}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {task.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {task.task_type} • {task.task_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getClientName(task.client_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(task.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPriorityBadge(task.priority || 'normal')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewTask(task)}
                            className="text-primary-600 hover:text-primary-900"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          {(task.status === 'pending' || task.status === 'running') && (
                            <button
                              onClick={() => handleCancelTask(task)}
                              className="text-red-600 hover:text-red-900"
                              title="Cancel Task"
                            >
                              <StopIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {tasks.length === 0 && (
                <div className="text-center py-12">
                  <CommandLineIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating a new task.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Task Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)}></div>
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                {viewingTask ? (
                  // View Task Details
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Task Details: {viewingTask.name}
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
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Task Information</h4>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Task ID:</span>
                            <span className="text-gray-900 font-mono">{viewingTask.task_id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Type:</span>
                            <span className="text-gray-900 capitalize">{viewingTask.task_type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Status:</span>
                            {getStatusBadge(viewingTask.status)}
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Client:</span>
                            <span className="text-gray-900">{getClientName(viewingTask.client_id)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Created:</span>
                            <span className="text-gray-900">
                              {new Date(viewingTask.created_at).toLocaleString()}
                            </span>
                          </div>
                          {viewingTask.started_at && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Started:</span>
                              <span className="text-gray-900">
                                {new Date(viewingTask.started_at).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {viewingTask.completed_at && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Completed:</span>
                              <span className="text-gray-900">
                                {new Date(viewingTask.completed_at).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {viewingTask.exit_code !== null && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Exit Code:</span>
                              <span className={`text-sm font-mono ${viewingTask.exit_code === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {viewingTask.exit_code}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Command</h4>
                        <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                          {viewingTask.command}
                        </div>
                        
                        {viewingTask.description && (
                          <>
                            <h4 className="font-medium text-gray-900">Description</h4>
                            <p className="text-sm text-gray-600">{viewingTask.description}</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Output Section */}
                    {(viewingTask.stdout || viewingTask.stderr) && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-3">Output</h4>
                        
                        {viewingTask.stdout && (
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Standard Output</label>
                            <div className="bg-green-50 border border-green-200 p-3 rounded text-sm font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                              {viewingTask.stdout}
                            </div>
                          </div>
                        )}
                        
                        {viewingTask.stderr && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Standard Error</label>
                            <div className="bg-red-50 border border-red-200 p-3 rounded text-sm font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                              {viewingTask.stderr}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  // Create Task Form
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Create New Task</h3>
                        <button
                          type="button"
                          onClick={() => setShowModal(false)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <XMarkIcon className="h-6 w-6" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Task Name</label>
                            <input
                              {...register('name', { required: 'Task name is required' })}
                              type="text"
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                              placeholder="e.g., System Update"
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">Client</label>
                            <select
                              {...register('client_id', { required: 'Client is required', valueAsNumber: true })}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            >
                              <option value="">Select a client...</option>
                              {clients.filter(c => c.status === 'online').map((client) => (
                                <option key={client.id} value={client.id}>
                                  {client.hostname} ({client.ip_address})
                                </option>
                              ))}
                            </select>
                            {errors.client_id && <p className="mt-1 text-sm text-red-600">{errors.client_id.message}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">Task Type</label>
                            <select
                              {...register('task_type', { required: 'Task type is required' })}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            >
                              <option value="powershell">PowerShell</option>
                              <option value="cmd">Command Prompt</option>
                              <option value="executable">Executable</option>
                              <option value="script">Script</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">Priority</label>
                            <select
                              {...register('priority')}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            >
                              <option value="low">Low</option>
                              <option value="normal">Normal</option>
                              <option value="high">High</option>
                              <option value="urgent">Urgent</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">Timeout (seconds)</label>
                            <input
                              {...register('timeout_seconds', { valueAsNumber: true, min: 1, max: 3600 })}
                              type="number"
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            />
                          </div>

                          <div className="flex items-center">
                            <input
                              {...register('run_as_admin')}
                              type="checkbox"
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                              Run as Administrator
                            </label>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Command</label>
                            <textarea
                              {...register('command', { required: 'Command is required' })}
                              rows={8}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-mono"
                              placeholder="Enter the command to execute..."
                            />
                            {errors.command && <p className="mt-1 text-sm text-red-600">{errors.command.message}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">Arguments (optional)</label>
                            <input
                              {...register('arguments')}
                              type="text"
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                              placeholder="Command arguments..."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
                            <textarea
                              {...register('description')}
                              rows={3}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                              placeholder="Brief description of what this task does..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                      <button
                        type="submit"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                      >
                        Create Task
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default withAuth(Tasks);
