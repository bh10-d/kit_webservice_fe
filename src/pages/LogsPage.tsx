import { useState, useEffect } from 'react';
import { Card, Button, LoadingSpinner } from '../components';
import type { Log } from '../types';

interface LogsResponse {
  logs: Log[];
}

function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://10.24.191.38:5000';
      const response = await fetch(`${apiBaseUrl}/get-logs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      
      const data: LogsResponse = await response.json();
      console.log('Logs API Response:', data);
      setLogs(data.logs || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch logs';
      setError(`Không thể kết nối đến API: ${errorMessage}`);
      console.error('Error fetching logs:', err);
      
      // Mock data fallback
      const mockData: LogsResponse = {
        logs: [
          {
            msg_id: "be038f31-e67f-495c-a04d-f3660d349030",
            runner_id: "493bf9e80adb294d2c3fe6dfdd711e96",
            logs: "Starting website check for test.com.vn\nConnecting to server...\nHTTP Status: 200 OK\nResponse time: 245ms\nCheck completed successfully",
            status: "success",
            message: "Website check completed",
            created_at: "2024-03-15T10:30:00Z",
            updated_at: "2024-03-15T10:30:45Z"
          },
          {
            msg_id: "ae038f31-e67f-495c-a04d-f3660d349031",
            runner_id: "123bf9e80adb294d2c3fe6dfdd711e96",
            logs: "Starting backup process\nConnecting to database...\nConnection timeout after 30 seconds",
            status: "timeout",
            message: "Database connection timeout",
            created_at: "2024-03-15T11:00:00Z",
            updated_at: "2024-03-15T11:00:35Z"
          },
          {
            msg_id: "ce038f31-e67f-495c-a04d-f3660d349032",
            runner_id: "456bf9e80adb294d2c3fe6dfdd711e97",
            logs: "Deployment started for app v2.1.0\nPulling latest image...\nStarting containers...\nHealth check passed\nDeployment completed",
            status: "done",
            message: "Application deployed successfully",
            created_at: "2024-03-15T12:15:00Z",
            updated_at: "2024-03-15T12:17:30Z"
          }
        ]
      };
      setLogs(mockData.logs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('vi-VN');
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'timeout':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Logs Management</h1>
          <p className="text-gray-600 mt-2">Manage and monitor logs</p>
        </div>
        <Button onClick={fetchLogs} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      <Card title={`List of Logs (${logs.length})`}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading data...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error loading data</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <p className="text-sm text-gray-600 mb-4">Displaying sample data for demo</p>
              <Button variant="danger" onClick={fetchLogs} disabled={loading}>
                {loading ? 'Retrying...' : 'Retry'}
              </Button>
            </div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No logs found</h3>
            <p className="text-gray-600">Currently, there are no logs in the system</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Runner ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr 
                    key={log.msg_id} 
                    className={`hover:bg-gray-50 ${selectedLog?.msg_id === log.msg_id ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 max-w-xs truncate">{log.msg_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 max-w-xs truncate">{log.runner_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{truncateText(log.message, 50)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(log.created_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedLog(log)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedLog(null);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Log Details</h3>
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setSelectedLog(null)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Message ID:</label>
                      <span className="text-sm text-gray-900 font-mono">{selectedLog.msg_id}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Runner ID:</label>
                      <span className="text-sm text-gray-900 font-mono">{selectedLog.runner_id}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status:</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedLog.status)}`}>
                        {selectedLog.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Message:</label>
                      <span className="text-sm text-gray-900">{selectedLog.message}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Created At:</label>
                      <span className="text-sm text-gray-900">{formatDate(selectedLog.created_at)}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Updated At:</label>
                      <span className="text-sm text-gray-900">{formatDate(selectedLog.updated_at)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Log Details</h4>
                  <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
                    {selectedLog.logs}
                  </pre>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Raw Data</h4>
                  <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                    {JSON.stringify(selectedLog, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LogsPage;
