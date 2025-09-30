import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, LoadingSpinner } from '../components';
import { type Script, type Parameter } from '../types';

interface ScriptDetailResponse {
  script: Script;
  parameters: Parameter[];
}

interface RunnerInfo {
  name: string;
  hostname?: string;
  runner_id?: string;
  id?: string;
}

function ScriptDetailPage() {
  const { scriptId } = useParams<{ scriptId: string }>();
  const navigate = useNavigate();
  
  const [script, setScript] = useState<Script | null>(null);
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [runners, setRunners] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [availableRunners, setAvailableRunners] = useState<RunnerInfo[]>([]);
  const [loadingRunners, setLoadingRunners] = useState(false);
  
  const [editForm, setEditForm] = useState({
    file_name: '',
    description: '',
    status: true
  });
  const [editParameters, setEditParameters] = useState<Parameter[]>([]);
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editRunners, setEditRunners] = useState<string[]>([]);

  const fetchScriptDetail = async () => {
    if (!scriptId) return;
    
    try {
      setLoading(true);
      setError(null);

      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://10.24.191.38:5000';
      const response = await fetch(`${baseUrl}/scripts/${scriptId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ScriptDetailResponse = await response.json();
      console.log('Script detail response:', data);
      setScript(data.script);
      
      const paramData = data.script.param || [];
      const parametersData = Array.isArray(paramData) && typeof paramData[0] === 'string' 
        ? paramData.map((param: string) => ({
            name: param,
            type: 'string',
            required: true,
            description: ''
          }))
        : (data.parameters || []);
      
      setParameters(parametersData);
      setTags(data.script.tag || []);
      setRunners(data.script.runner || []);
      
      setEditForm({
        file_name: data.script.file_name,
        description: data.script.description,
        status: data.script.status
      });
      setEditParameters([...parametersData]);
      setEditTags([...data.script.tag || []]);
      setEditRunners([...data.script.runner || []]);
    } catch (error) {
      console.error('Error fetching script detail:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRunners = async () => {
    try {
      setLoadingRunners(true);
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://10.24.191.38:5000';
      const response = await fetch(`${baseUrl}/get-runners`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Runners API response:', data);
      
      // Handle different possible response formats
      let runnerInfos: RunnerInfo[] = [];
      
      if (Array.isArray(data)) {
        // If data is directly an array
        runnerInfos = data.map(runner => {
          if (typeof runner === 'string') {
            return { name: runner };
          } else if (typeof runner === 'object' && runner) {
            return {
              name: runner.name || runner.runner_id || runner.id || String(runner),
              hostname: runner.hostname || runner.host,
              runner_id: runner.runner_id || runner.id,
              id: runner.id
            };
          }
          return { name: String(runner) };
        });
      } else if (data && data.runners && Array.isArray(data.runners)) {
        // If data has a runners property
        runnerInfos = data.runners.map((runner: any) => {
          if (typeof runner === 'string') {
            return { name: runner };
          } else if (typeof runner === 'object' && runner) {
            return {
              name: runner.name || runner.runner_id || runner.id || String(runner),
              hostname: runner.hostname || runner.host,
              runner_id: runner.runner_id || runner.id,
              id: runner.id
            };
          }
          return { name: String(runner) };
        });
      } else if (data && data.data && Array.isArray(data.data)) {
        // If data has a data property
        runnerInfos = data.data.map((runner: any) => {
          if (typeof runner === 'string') {
            return { name: runner };
          } else if (typeof runner === 'object' && runner) {
            return {
              name: runner.name || runner.runner_id || runner.id || String(runner),
              hostname: runner.hostname || runner.host,
              runner_id: runner.runner_id || runner.id,
              id: runner.id
            };
          }
          return { name: String(runner) };
        });
      }
      
      console.log('Processed runner infos:', runnerInfos);
      setAvailableRunners(runnerInfos);
    } catch (error) {
      console.error('Error fetching available runners:', error);
      // Don't show error alert, just log it
    } finally {
      setLoadingRunners(false);
    }
  };

  useEffect(() => {
    fetchScriptDetail();
    fetchAvailableRunners();
  }, [scriptId]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusDisplay = (status: boolean) => {
    return status ? 'Active' : 'Inactive';
  };

  const handleEditToggle = () => {
    if (script) {
      if (isEditing) {
        const hasChanges = 
          editForm.file_name !== script.file_name ||
          editForm.description !== script.description ||
          editForm.status !== script.status ||
          JSON.stringify(editParameters) !== JSON.stringify(parameters) ||
          JSON.stringify(editTags) !== JSON.stringify(tags) ||
          JSON.stringify(editRunners) !== JSON.stringify(runners);
        
        if (hasChanges) {
          const confirmCancel = window.confirm(
            'You have unsaved changes. Are you sure you want to cancel?'
          );
          if (!confirmCancel) return;
        }
      }
      
      setEditForm({
        file_name: script.file_name,
        description: script.description,
        status: script.status
      });
      setEditParameters([...parameters]);
      setEditTags([...tags]);
      setEditRunners([...runners]);
      setIsEditing(!isEditing);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addParameter = () => {
    const newParam: Parameter = {
      name: '',
      type: 'string',
      required: false,
      description: ''
    };
    setEditParameters([...editParameters, newParam]);
  };

  const updateParameter = (index: number, field: keyof Parameter, value: string | boolean) => {
    const updated = [...editParameters];
    updated[index] = { ...updated[index], [field]: value };
    setEditParameters(updated);
  };

  const removeParameter = (index: number) => {
    setEditParameters(editParameters.filter((_, i) => i !== index));
  };

  const addTag = () => {
    setEditTags([...editTags, '']);
  };

  const updateTag = (index: number, value: string) => {
    const updated = [...editTags];
    updated[index] = value;
    setEditTags(updated);
  };

  const removeTag = (index: number) => {
    setEditTags(editTags.filter((_, i) => i !== index));
  };

  const addRunner = () => {
    setEditRunners([...editRunners, '']);
  };

  const addRunnerFromDropdown = (runnerName: string) => {
    if (runnerName && !editRunners.includes(runnerName)) {
      setEditRunners([...editRunners, runnerName]);
    }
  };

  const updateRunner = (index: number, value: string) => {
    const updated = [...editRunners];
    updated[index] = value;
    setEditRunners(updated);
  };

  const removeRunner = (index: number) => {
    setEditRunners(editRunners.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!script || !scriptId) return;

    if (!editForm.file_name.trim()) {
      alert('File name is required');
      return;
    }

    const invalidParams = editParameters.filter(p => 
      // p.name.trim() === '' || p.description.trim() === ''
      p.name.trim() === ''
    );
    if (invalidParams.length > 0) {
      alert('All parameters must have a name and description');
      return;
    }

    const validTags = editTags.filter(t => t.trim() !== '');
    const validRunners = editRunners.filter(r => r.trim() !== '');

    try {
      setIsSaving(true);
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://10.24.191.38:5000';
      
      const updateData = {
        file_name: editForm.file_name.trim(),
        description: editForm.description.trim(),
        status: editForm.status,
        param: editParameters.filter(p => p.name.trim() !== '').map(p => p.name.trim()),
        tag: validTags,
        runner: validRunners
      };

      const response = await fetch(`${baseUrl}/scripts/${scriptId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchScriptDetail();
      setIsEditing(false);
      alert('Script updated successfully!');
    } catch (error) {
      console.error('Error updating script:', error);
      alert('Failed to update script: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!script || !scriptId) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete script "${script.file_name}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      setLoading(true);
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://10.24.191.38:5000';
      
      const response = await fetch(`${baseUrl}/scripts/${scriptId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      alert('Script deleted successfully!');
      navigate('/scripts');
    } catch (error) {
      console.error('Error deleting script:', error);
      alert('Failed to delete script: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Script Details</h1>
          <Button variant="secondary" onClick={() => navigate('/scripts')}>
            ← Back to Scripts
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading script details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Error Loading Script</h1>
          <Button variant="secondary" onClick={() => navigate('/scripts')}>
            ← Back to Scripts
          </Button>
        </div>
        <Card>
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to load script details</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button variant="danger" onClick={fetchScriptDetail}>
                Retry
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!script) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Script Not Found</h1>
          <Button variant="secondary" onClick={() => navigate('/scripts')}>
            ← Back to Scripts
          </Button>
        </div>
        <Card>
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Script not found</h3>
            <p className="text-gray-600">The requested script does not exist.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-gray-900">Script Details</h1>
          {isEditing && (
            <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
              Editing Mode
            </span>
          )}
        </div>
        <Button variant="secondary" onClick={() => navigate('/scripts')}>
          ← Back to Scripts
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Script ID</label>
                <span className="inline-flex px-2 py-1 text-xs font-mono rounded-md bg-gray-100 text-gray-800">
                  {script.script_id}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.file_name}
                    onChange={(e) => handleInputChange('file_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <span className="text-sm text-gray-900 font-medium">{script.file_name}</span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                {isEditing ? (
                  <select
                    value={editForm.status.toString()}
                    onChange={(e) => handleInputChange('status', e.target.value === 'true')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                ) : (
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    script.status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {getStatusDisplay(script.status)}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                <span className="text-sm text-gray-500">{formatDate(script.created_at)}</span>
              </div>
            </div>
          </Card>

          {/* Description */}
          <Card title="Description">
            {isEditing ? (
              <textarea
                value={editForm.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Enter script description..."
              />
            ) : (
              <div className="text-sm text-gray-900">
                {script.description || 'No description provided'}
              </div>
            )}
          </Card>

          {/* Parameters */}
          <Card title="Parameters">
            {isEditing ? (
              <div className="space-y-4">
                {editParameters.map((param, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <input
                        type="text"
                        placeholder="Parameter name"
                        value={param.name}
                        onChange={(e) => updateParameter(index, 'name', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <select
                        value={param.type}
                        onChange={(e) => updateParameter(index, 'type', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                        <option value="array">Array</option>
                        <option value="object">Object</option>
                      </select>
                      <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={param.required}
                            onChange={(e) => updateParameter(index, 'required', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Required</span>
                        </label>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => removeParameter(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Parameter description"
                      value={param.description}
                      onChange={(e) => updateParameter(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ))}
                <Button onClick={addParameter}>+ Add Parameter</Button>
              </div>
            ) : (
              parameters.length > 0 ? (
                <div className="space-y-3">
                  {parameters.map((param, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{param.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            param.required ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {param.required ? 'Required' : 'Optional'}
                          </span>
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-800">
                            {param.type}
                          </span>
                        </div>
                      </div>
                      {param.description && (
                        <p className="text-sm text-gray-600">{param.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No parameters defined</p>
              )
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {/* Actions */}
          <Card title="Actions">
            {isEditing ? (
              <div className="space-y-3">
                <Button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  variant="secondary"
                  onClick={handleEditToggle}
                  disabled={isSaving}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Button 
                  onClick={handleEditToggle}
                  className="w-full"
                >
                  Edit Script
                </Button>
                <Button 
                  variant="danger"
                  onClick={handleDelete}
                  className="w-full"
                >
                  Delete Script
                </Button>
              </div>
            )}
          </Card>

          {/* Tags */}
          <Card title="Tags">
            {isEditing ? (
              <div className="space-y-2">
                {editTags.map((tag, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Tag name"
                      value={tag}
                      onChange={(e) => updateTag(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeTag(index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <Button size="sm" onClick={addTag}>+ Add Tag</Button>
              </div>
            ) : (
              tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span key={index} className="inline-flex px-2 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-800">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No tags defined</p>
              )
            )}
          </Card>

          {/* Runners */}
          <Card title="Runners">
            {isEditing ? (
              <div className="space-y-3">
                {/* Available Runners Dropdown */}
                <div className="flex gap-2">
                  {/* <select
                    onChange={(e) => {
                      if (e.target.value) {
                        addRunnerFromDropdown(e.target.value);
                        e.target.value = ''; // Reset selection
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loadingRunners}
                  > */}
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        addRunnerFromDropdown(e.target.value);
                        e.target.value = ''; // Reset selection
                      }
                    }}
                    className="flex-1 min-w-0 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loadingRunners}
                  >
                    <option value="">
                      {loadingRunners 
                        ? 'Loading runners...' 
                        : availableRunners.length > 0 
                          ? 'Select from available runners' 
                          : 'No available runners found'
                      }
                    </option>
                    {availableRunners
                      .filter(runner => !editRunners.includes(runner.name))
                      .map((runner, index) => (
                        <option key={index} value={runner.name}>
                          {/* {runner.name}{runner.hostname ? ` (${runner.hostname})` : ''} */}
                          {runner.name}
                        </option>
                      ))
                    }
                  </select>
                  <Button
                    size="sm"
                    onClick={fetchAvailableRunners}
                    disabled={loadingRunners}
                  >
                    {loadingRunners ? '⟳' : '↻'}
                  </Button>
                </div>
                
                {/* Debug info - remove this in production */}
                {import.meta.env.DEV && (
                  <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
                    Available runners count: {availableRunners.length}
                    {availableRunners.length > 0 && (
                      <div>
                        <span>Runners:</span><br />
                        {availableRunners.map((runner, idx) => (
                          <span key={idx}>
                            {runner.hostname ? ` (${runner.hostname})` : ''}: {runner.name}<br />
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Current Runners */}
                <div className="space-y-2">
                  {editRunners.map((runner, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Runner name"
                        value={runner}
                        onChange={(e) => updateRunner(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeRunner(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
                
                <Button size="sm" onClick={addRunner}>+ Add Custom Runner</Button>
              </div>
            ) : (
              runners.length > 0 ? (
                <div className="space-y-2">
                  {runners.map((runner, index) => (
                    <div key={index} className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                      {runner}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No runners defined</p>
              )
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ScriptDetailPage;
