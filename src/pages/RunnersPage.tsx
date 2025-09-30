import { useState, useEffect } from 'react';
import { Card, Button, LoadingSpinner } from '../components';
import type { Runner } from '../types';

interface RunnersResponse {
  runners: Runner[];
  data: Runner[];
}

function RunnersPage() {
  const [runners, setRunners] = useState<Runner[]>([]);
  const [selectedRunner, setSelectedRunner] = useState<Runner | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRunners = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://10.24.191.38:5000';
      const response = await fetch(`${apiBaseUrl}/get-runners`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      
      const data: RunnersResponse = await response.json();
      console.log('Runners API Response:', data);
      setRunners(data.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch runners';
      setError(`Không thể kết nối đến API: ${errorMessage}`);
      console.error('Error fetching runners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRunners();
  }, []);

  const getTagsList = (tags: string) => {
    return tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Runner Management</h1>
          <p className="text-gray-600 mt-2">Manage and track runners</p>
        </div>
        <Button onClick={fetchRunners} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      <Card title={`List of Runners (${runners.length})`}>
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
              <Button variant="danger" onClick={fetchRunners} disabled={loading}>
                {loading ? 'Retrying...' : 'Retry'}
              </Button>
            </div>
          </div>
        ) : runners.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No runners found</h3>
            <p className="text-gray-600">Currently, there are no runners in the system</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hostname</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {runners.map((runner) => (
                  <tr 
                    key={runner.id} 
                    className={`hover:bg-gray-50 ${selectedRunner?.id === runner.id ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{runner.hostname}</div>
                      <div className="text-sm text-gray-500 font-mono">{runner.id.slice(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{runner.ip}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Online
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {getTagsList(runner.tags).slice(0, 3).map((tag, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-800">
                            {tag}
                          </span>
                        ))}
                        {getTagsList(runner.tags).length > 3 && (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800">
                            +{getTagsList(runner.tags).length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedRunner(runner)}
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

      {/* Runner Detail Modal */}
      {selectedRunner && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedRunner(null);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Runner Details: {selectedRunner.hostname}</h3>
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setSelectedRunner(null)}
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
                      <label className="block text-sm font-medium text-gray-700">Runner ID:</label>
                      <span className="text-sm text-gray-900 font-mono">{selectedRunner.id}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Hostname:</label>
                      <span className="text-sm text-gray-900">{selectedRunner.hostname}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">IP Address:</label>
                      <span className="text-sm text-gray-900 font-mono">{selectedRunner.ip}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status:</label>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Online
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {getTagsList(selectedRunner.tags).map((tag, index) => (
                      <span key={index} className="inline-flex px-3 py-1 text-sm font-medium rounded-md bg-blue-100 text-blue-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Raw Data</h4>
                  <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                    {JSON.stringify(selectedRunner, null, 2)}
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

export default RunnersPage;
