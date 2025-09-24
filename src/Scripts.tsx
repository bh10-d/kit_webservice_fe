import { useState, useEffect } from 'react'
import './App.css'

interface Script {
  script_id: string
  file_name: string
  description: string
  param: string[]
  created_at: string
  updated_at: string
  deleted_at: string | null
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
      setScripts(data.data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch scripts'
      setError(`Không thể kết nối đến API: ${errorMessage}`)
      console.error('Error fetching scripts:', err)
      
      // Fallback to mock data for testing
      console.log('Using mock scripts data as fallback')
    //   const mockData: ScriptsResponse = {
    //     scripts: [
    //       {
    //         script_id: "1",
    //         file_name: "check_site.sh",
    //         description: "Kiểm tra trạng thái website",
    //         param: ["subDomain"],
    //         created_at: "0001-01-01T00:00:00Z",
    //         updated_at: "0001-01-01T00:00:00Z",
    //         deleted_at: null
    //       },
    //       {
    //         script_id: "2",
    //         file_name: "backup_db.sh",
    //         description: "Sao lưu cơ sở dữ liệu",
    //         param: ["database", "backup_path"],
    //         created_at: "2024-01-15T10:30:00Z",
    //         updated_at: "2024-01-20T14:45:00Z",
    //         deleted_at: null
    //       },
    //       {
    //         script_id: "3",
    //         file_name: "deploy_app.sh",
    //         description: "Triển khai ứng dụng",
    //         param: ["app_name", "version", "environment"],
    //         created_at: "2024-02-01T09:00:00Z",
    //         updated_at: "2024-02-05T16:20:00Z",
    //         deleted_at: null
    //       }
    //     ]
    //   }
    //   setScripts(mockData.scripts)
    } finally {
      setLoading(false)
    }
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

  const getStatusColor = (deletedAt: string | null) => {
    return deletedAt ? '#6b7280' : '#10b981' // gray if deleted, green if active
  }

  const getStatusText = (deletedAt: string | null) => {
    return deletedAt ? 'Deleted' : 'Active'
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
            <button 
              className="refresh-btn"
              onClick={fetchScripts}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
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
              <p className="error-note">Hiển thị dữ liệu mẫu để demo</p>
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
                          style={{ backgroundColor: getStatusColor(script.deleted_at) }}
                        >
                          {getStatusText(script.deleted_at)}
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
          <div className="job-details">
            <div className="job-details-header">
              <h3>Chi tiết Script: {selectedScript.file_name}</h3>
              <button 
                className="close-btn"
                onClick={() => setSelectedScript(null)}
              >
                ×
              </button>
            </div>
            
            <div className="job-details-content">
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
                      style={{ backgroundColor: getStatusColor(selectedScript.deleted_at) }}
                    >
                      {getStatusText(selectedScript.deleted_at)}
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
        )}
      </div>
    </div>
  )
}

export default Scripts
