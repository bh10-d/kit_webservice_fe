import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, LoadingSpinner } from '../components';
import type { Script, ScriptsResponse } from '../types';

function ScriptsPage() {
  const navigate = useNavigate();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
  
  const [formData, setFormData] = useState({
    file_name: '',
    description: '',
    param: [''],
    status: true
  });

  const fetchScripts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://10.24.191.38:5000';
      const response = await fetch(`${apiBaseUrl}/get-scripts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      
      const data: ScriptsResponse = await response.json();
      console.log('Scripts API Response:', data);
      setScripts(data.scripts || data.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch scripts';
      setError(`Không thể kết nối đến API: ${errorMessage}`);
      console.error('Error fetching scripts:', err);
      setScripts([]);
    } finally {
      setLoading(false);
    }
  };

  const createScript = async () => {
    try {
      setCreating(true);
      setError(null);
      
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://10.24.191.38:5000';
      const response = await fetch(`${apiBaseUrl}/scripts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
          file_name: formData.file_name,
          description: formData.description,
          param: formData.param.filter(p => p.trim() !== ''),
          status: formData.status
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Create script response:', result);
      
      setFormData({
        file_name: '',
        description: '',
        param: [''],
        status: true
      });
      setShowCreateForm(false);
      fetchScripts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create script';
      setError(`Không thể tạo script: ${errorMessage}`);
      console.error('Error creating script:', err);
    } finally {
      setCreating(false);
    }
  };

  const openScriptDetail = (scriptId: string) => {
    navigate(`/scripts/${scriptId}`);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleParamChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      param: prev.param.map((p, i) => i === index ? value : p)
    }));
  };

  const addParam = () => {
    setFormData(prev => ({
      ...prev,
      param: [...prev.param, '']
    }));
  };

  const removeParam = (index: number) => {
    setFormData(prev => ({
      ...prev,
      param: prev.param.filter((_, i) => i !== index)
    }));
  };

  useEffect(() => {
    fetchScripts();
  }, []);

  const getStatusText = (status: boolean) => {
    return status ? 'Active' : 'Inactive';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Script Management</h1>
          <p className="text-gray-600 mt-2">Manage and track scripts</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setShowCreateForm(true)} disabled={loading}>
            + Tạo Script
          </Button>
          <Button variant="secondary" onClick={fetchScripts} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      <Card title={`List of Scripts (${scripts.length})`}>
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
              <Button variant="danger" onClick={fetchScripts} disabled={loading}>
                {loading ? 'Retrying...' : 'Retry'}
              </Button>
            </div>
          </div>
        ) : scripts.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No scripts found</h3>
            <p className="text-gray-600">Currently, there are no scripts in the system</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parameters</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scripts.map((script) => (
                  <tr 
                    key={script.script_id} 
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{script.script_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-900">
                      {script.file_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{script.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {script.param && script.param.slice(0, 2).map((param, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800">
                            {param}
                          </span>
                        ))}
                        {script.param && script.param.length > 2 && (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800">
                            +{script.param.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        script.status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {getStatusText(script.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openScriptDetail(script.script_id)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create Script Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Create New Script</h3>
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowCreateForm(false)}
                disabled={creating}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); createScript(); }} className="p-6 space-y-4">
              <div>
                <label htmlFor="file_name" className="block text-sm font-medium text-gray-700 mb-1">File Name:</label>
                <input
                  type="text"
                  id="file_name"
                  value={formData.file_name}
                  onChange={(e) => handleInputChange('file_name', e.target.value)}
                  placeholder="example_script.sh"
                  required
                  disabled={creating}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description:</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Script description"
                  required
                  disabled={creating}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parameters:</label>
                <div className="space-y-2">
                  {formData.param.map((param, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={param}
                        onChange={(e) => handleParamChange(index, e.target.value)}
                        placeholder={`Parameter ${index + 1}`}
                        disabled={creating}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => removeParam(index)}
                        disabled={formData.param.length <= 1 || creating}
                      >
                        -
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={addParam}
                    disabled={creating}
                  >
                    + Thêm Parameter
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.status}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      status: e.target.checked
                    }))}
                    disabled={creating}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {formData.status ? 'Active' : 'Inactive'}
                  </span>
                </label>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCreateForm(false)}
                  disabled={creating}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={creating || !formData.file_name.trim() || !formData.description.trim()}
                  className="flex-1"
                >
                  {creating ? 'Đang tạo...' : 'Tạo Script'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScriptsPage;
