import { useState, useEffect } from 'react'
import './App.css'

interface Log {
  msg_id: string
  runner_id: string
  logs: string
  status: string
  message: string
  created_at: string
  updated_at: string
}

interface LogsResponse {
  logs: Log[]
}

function Logs() {
  const [logs, setLogs] = useState<Log[]>([])
  const [selectedLog, setSelectedLog] = useState<Log | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Function to fetch logs from API
  const fetchLogs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://10.24.191.38:5000'
      const response = await fetch(`${apiBaseUrl}/get-logs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`)
      }
      
      const data: LogsResponse = await response.json()
      console.log('Logs API Response:', data)
      setLogs(data.logs || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch logs'
      setError(`Không thể kết nối đến API: ${errorMessage}`)
      console.error('Error fetching logs:', err)
      
      // Fallback to mock data for testing
      console.log('Using mock logs data as fallback')
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
      }
      setLogs(mockData.logs)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('vi-VN')
    } catch {
      return dateString
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'done':
        return '#10b981' // green-500
      case 'timeout':
        return '#f59e0b' // amber-500
      case 'error':
      case 'failed':
        return '#ef4444' // red-500
      case 'running':
        return '#3b82f6' // blue-500
      case 'pending':
        return '#8b5cf6' // violet-500
      default:
        return '#6b7280' // gray-500
    }
  }

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Logs Management Dashboard</h1>
        <p>Quản lý và theo dõi các logs</p>
      </header>

      <div className="jobs-container">
        <div className="jobs-table-container">
          <div className="table-header">
            <h2>Danh sách Logs ({logs.length})</h2>
            <button 
              className="refresh-btn"
              onClick={fetchLogs}
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
                onClick={fetchLogs}
                disabled={loading}
              >
                {loading ? 'Đang thử lại...' : 'Thử lại'}
              </button>
            </div>
          ) : logs.length === 0 ? (
            <div className="empty-state">
              <h3>Không có logs nào</h3>
              <p>Hiện tại chưa có log nào trong hệ thống</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="jobs-table">
                <thead>
                  <tr>
                    <th>Message ID</th>
                    <th>Runner ID</th>
                    <th>Status</th>
                    <th>Message</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.msg_id} className={selectedLog?.msg_id === log.msg_id ? 'selected' : ''}>
                      <td className="truncate">
                        <span className="monospace">{log.msg_id}</span>
                      </td>
                      <td className="truncate">
                        <span className="monospace">{log.runner_id}</span>
                      </td>
                      <td>
                        <span 
                          className="status-badge" 
                          style={{ backgroundColor: getStatusColor(log.status) }}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="truncate">{truncateText(log.message, 50)}</td>
                      <td>{formatDate(log.created_at)}</td>
                      <td>
                        <button 
                          className="view-btn"
                          onClick={() => setSelectedLog(log)}
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

        {selectedLog && (
          <div className="detail-overlay" onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedLog(null)
            }
          }}>
            <div className="detail-sidebar">
              <div className="detail-sidebar-header">
                <h3>Chi tiết Log</h3>
                <button 
                  className="close-btn"
                  onClick={() => setSelectedLog(null)}
                >
                  ×
                </button>
              </div>
              
              <div className="detail-sidebar-content">
                <div className="detail-section">
                  <h4>Thông tin cơ bản</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Message ID:</label>
                      <span className="monospace">{selectedLog.msg_id}</span>
                    </div>
                    <div className="detail-item">
                      <label>Runner ID:</label>
                      <span className="monospace">{selectedLog.runner_id}</span>
                    </div>
                    <div className="detail-item">
                      <label>Status:</label>
                      <span 
                        className="status-badge" 
                        style={{ backgroundColor: getStatusColor(selectedLog.status) }}
                      >
                        {selectedLog.status}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Message:</label>
                      <span>{selectedLog.message}</span>
                    </div>
                    <div className="detail-item">
                      <label>Created At:</label>
                      <span>{formatDate(selectedLog.created_at)}</span>
                    </div>
                    <div className="detail-item">
                      <label>Updated At:</label>
                      <span>{formatDate(selectedLog.updated_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Log Details</h4>
                  <pre className="payload-container">
                    {selectedLog.logs}
                  </pre>
                </div>

                <div className="detail-section">
                  <h4>Raw Data</h4>
                  <pre className="payload-container">
                    {JSON.stringify(selectedLog, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Logs
