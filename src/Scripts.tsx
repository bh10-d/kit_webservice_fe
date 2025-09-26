import { useState, useEffect } from 'react'
import './App.css'

interface Script {
  script_id: string
  file_name: string
  description: string
  param: string[]
  status: boolean
  created_at: string
  updated_at: string
}

interface ScriptsResponse {
  scripts: Script[]
  data: Script[]
}

function Scripts() {
  const [scripts, setScripts] = useState<Script[]>([])
  const [selectedScript, setSelectedScript] = useState<Script | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false)
  const [creating, setCreating] = useState<boolean>(false)
  
  // Form state
  const [formData, setFormData] = useState({
    file_name: '',
    description: '',
    param: [''],
    status: true
  })

  // Function to fetch scripts from API
  const fetchScripts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://10.24.191.38:5000'
      const response = await fetch(`${apiBaseUrl}/get-scripts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`)
      }
      
      const data: ScriptsResponse = await response.json()
      console.log('Scripts API Response:', data)
      // Use the 'scripts' field from API response instead of 'data'
      setScripts(data.scripts || data.data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch scripts'
      setError(`Không thể kết nối đến API: ${errorMessage}`)
      console.error('Error fetching scripts:', err)
      
      // Don't use fallback mock data, show error instead
      setScripts([])
    } finally {
      setLoading(false)
    }
  }

  // Function to create new script
  const createScript = async () => {
    try {
      setCreating(true)
      setError(null)
      
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://10.24.191.38:5000'
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
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('Create script response:', result)
      
      // Reset form and close
      setFormData({
        file_name: '',
        description: '',
        param: [''],
        status: true
      })
      setShowCreateForm(false)
      
      // Refresh scripts list
      fetchScripts()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create script'
      setError(`Không thể tạo script: ${errorMessage}`)
      console.error('Error creating script:', err)
    } finally {
      setCreating(false)
    }
  }

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle param array changes
  const handleParamChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      param: prev.param.map((p, i) => i === index ? value : p)
    }))
  }

  // Add new param field
  const addParam = () => {
    setFormData(prev => ({
      ...prev,
      param: [...prev.param, '']
    }))
  }

  // Remove param field
  const removeParam = (index: number) => {
    setFormData(prev => ({
      ...prev,
      param: prev.param.filter((_, i) => i !== index)
    }))
  }

  useEffect(() => {
    fetchScripts()
  }, [])

  const formatDate = (dateString: string) => {
    if (dateString === "0001-01-01T00:00:00Z") {
      return "N/A"
    }
    try {
      return new Date(dateString).toLocaleString('vi-VN')
    } catch {
      return dateString
    }
  }

  const getStatusColor = (status: boolean) => {
    // Return color based on boolean status value
    return status ? '#10b981' : '#6b7280' // green if true, gray if false
  }

  const getStatusText = (status: boolean) => {
    return status ? 'Active' : 'Inactive'
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Script Management Dashboard</h1>
        <p>Quản lý và theo dõi các scripts</p>
      </header>

      <div className="jobs-container">
        <div className="jobs-table-container">
          <div className="table-header">
            <h2>Danh sách Scripts ({scripts.length})</h2>
            <div className="header-actions">
              <button 
                className="create-btn"
                onClick={() => setShowCreateForm(true)}
                disabled={loading}
              >
                + Tạo Script
              </button>
              <button 
                className="refresh-btn"
                onClick={fetchScripts}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <h3>Lỗi khi tải dữ liệu</h3>
              <p>{error}</p>
              <button 
                className="retry-btn"
                onClick={fetchScripts}
                disabled={loading}
              >
                {loading ? 'Đang thử lại...' : 'Thử lại'}
              </button>
            </div>
          ) : scripts.length === 0 ? (
            <div className="empty-state">
              <h3>Không có scripts nào</h3>
              <p>Hiện tại chưa có script nào trong hệ thống</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="jobs-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>File Name</th>
                    <th>Description</th>
                    <th>Parameters</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {scripts.map((script) => (
                    <tr key={script.script_id} className={selectedScript?.script_id === script.script_id ? 'selected' : ''}>
                      <td>{script.script_id}</td>
                      <td>
                        <span className="monospace">{script.file_name}</span>
                      </td>
                      <td className="truncate">{script.description}</td>
                      <td>
                        <div className="tags-container">
                          {script.param.slice(0, 2).map((param, index) => (
                            <span key={index} className="tag">
                              {param}
                            </span>
                          ))}
                          {script.param.length > 2 && (
                            <span className="tag-more">
                              +{script.param.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span 
                          className="status-badge" 
                          style={{ backgroundColor: getStatusColor(script.status) }}
                        >
                          {getStatusText(script.status)}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="view-btn"
                          onClick={() => setSelectedScript(script)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedScript && (
          <div className="detail-overlay" onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedScript(null)
            }
          }}>
            <div className="detail-sidebar">
              <div className="detail-sidebar-header">
                <h3>Chi tiết Script: {selectedScript.file_name}</h3>
                <button 
                  className="close-btn"
                  onClick={() => setSelectedScript(null)}
                >
                  ×
                </button>
              </div>
              
              <div className="detail-sidebar-content">
                <div className="detail-section">
                  <h4>Thông tin cơ bản</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Script ID:</label>
                      <span>{selectedScript.script_id}</span>
                    </div>
                    <div className="detail-item">
                      <label>File Name:</label>
                      <span className="monospace">{selectedScript.file_name}</span>
                    </div>
                    <div className="detail-item">
                      <label>Description:</label>
                      <span>{selectedScript.description}</span>
                    </div>
                    <div className="detail-item">
                      <label>Status:</label>
                      <span 
                        className="status-badge" 
                        style={{ backgroundColor: getStatusColor(selectedScript.status) }}
                      >
                        {getStatusText(selectedScript.status)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Created At:</label>
                      <span>{formatDate(selectedScript.created_at)}</span>
                    </div>
                    <div className="detail-item">
                      <label>Updated At:</label>
                      <span>{formatDate(selectedScript.updated_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Parameters</h4>
                  <div className="tags-detail">
                    {selectedScript.param.map((param, index) => (
                      <span key={index} className="tag-detail">
                        {param}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Raw Data</h4>
                  <pre className="payload-container">
                    {JSON.stringify(selectedScript, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Script Form Modal */}
        {showCreateForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Tạo Script Mới</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowCreateForm(false)}
                  disabled={creating}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); createScript(); }} className="create-form">
                <div className="form-group">
                  <label htmlFor="file_name">File Name:</label>
                  <input
                    type="text"
                    id="file_name"
                    value={formData.file_name}
                    onChange={(e) => handleInputChange('file_name', e.target.value)}
                    placeholder="example_script.sh"
                    required
                    disabled={creating}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="description">Description:</label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="asdasdasdasd.com"
                    required
                    disabled={creating}
                    rows={3}
                  />
                </div>
                
                <div className="form-group">
                  <label>Parameters:</label>
                  <div className="params-container">
                    {formData.param.map((param, index) => (
                      <div key={index} className="param-input-group">
                        <input
                          type="text"
                          value={param}
                          onChange={(e) => handleParamChange(index, e.target.value)}
                          placeholder={index === 0 ? "test" : index === 1 ? "asdhjasd" : `Param ${index + 1}`}
                          disabled={creating}
                        />
                        <button
                          type="button"
                          onClick={() => removeParam(index)}
                          disabled={formData.param.length <= 1 || creating}
                          className="remove-param-btn"
                        >
                          -
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addParam}
                      disabled={creating}
                      className="add-param-btn"
                    >
                      + Thêm Parameter
                    </button>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="status">Status:</label>
                  <div className="status-toggle">
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        id="status"
                        checked={formData.status}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          status: e.target.checked
                        }))}
                        disabled={creating}
                      />
                      <span className="toggle-text">
                        {formData.status ? 'Active' : 'Inactive'}
                      </span>
                    </label>
                  </div>
                </div>
                
                {error && (
                  <div className="form-error">
                    {error}
                  </div>
                )}
                
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    disabled={creating}
                    className="cancel-btn"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !formData.file_name.trim() || !formData.description.trim()}
                    className="submit-btn"
                  >
                    {creating ? 'Đang tạo...' : 'Tạo Script'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Scripts
