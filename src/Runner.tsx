import { useState, useEffect } from 'react'
import './Runner.css'

interface Runner {
  id: string
  hostname: string
  ip: string
  tags: string
}

interface RunnersResponse {
  runners: Runner[]
  data: Runner[]
}

function Runner() {
  const [runners, setRunners] = useState<Runner[]>([])
  const [selectedRunner, setSelectedRunner] = useState<Runner | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Function to fetch runners from API
  const fetchRunners = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://10.24.191.38:5000'
      const response = await fetch(`${apiBaseUrl}/get-runners`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`)
      }
      
      const data: RunnersResponse = await response.json()
      console.log('Runners API Response:', data)
      setRunners(data.data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch runners'
      setError(`Không thể kết nối đến API: ${errorMessage}`)
      console.error('Error fetching runners:', err)
      
      // Fallback to mock data for testing
      console.log('Using mock runners data as fallback')
    //   const mockData: RunnersResponse = {
    //     runners: [
    //       {
    //         id: "bdb8c6bc5fd32d35edbe4acd6321a5e8",
    //         hostname: "go-runner-1",
    //         ip: "10.24.191.122",
    //         tags: "nginx,web,server,docker"
    //       },
    //       {
    //         id: "abc8c6bc5fd32d35edbe4acd6321a5e9",
    //         hostname: "go-runner-2",
    //         ip: "10.24.191.123",
    //         tags: "redis,database,cache"
    //       },
    //       {
    //         id: "def8c6bc5fd32d35edbe4acd6321a5e0",
    //         hostname: "go-runner-3",
    //         ip: "10.24.191.124",
    //         tags: "python,api,ml,tensorflow"
    //       }
    //     ]
    //   }
    //   setRunners(mockData.runners)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRunners()
  }, [])

  const getTagsList = (tags: string) => {
    return tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
  }

  const getStatusColor = () => {
    // Simple status logic - all runners are online for demo
    return '#10b981' // green-500 for online
  }

  return (
    <div className="runner-container">
      <header className="runner-header">
        <h1>Runner Management Dashboard</h1>
        <p>Quản lý và theo dõi các runners</p>
      </header>

      <div className="runners-container">
        <div className="runners-table-container">
          <div className="table-header">
            <h2>Danh sách Runners ({runners.length})</h2>
            <button 
              className="refresh-btn"
              onClick={fetchRunners}
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
                onClick={fetchRunners}
                disabled={loading}
              >
                {loading ? 'Đang thử lại...' : 'Thử lại'}
              </button>
            </div>
          ) : runners.length === 0 ? (
            <div className="empty-state">
              <h3>Không có runners nào</h3>
              <p>Hiện tại chưa có runner nào trong hệ thống</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="runners-table">
                <thead>
                  <tr>
                    <th>Hostname</th>
                    <th>IP Address</th>
                    <th>Status</th>
                    <th>Tags</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {runners.map((runner) => (
                    <tr key={runner.id} className={selectedRunner?.id === runner.id ? 'selected' : ''}>
                      <td>
                        <span className="hostname">{runner.hostname}</span>
                      </td>
                      <td>
                        <span className="ip-address">{runner.ip}</span>
                      </td>
                      <td>
                        <span 
                          className="status-badge" 
                          style={{ backgroundColor: getStatusColor() }}
                        >
                          Online
                        </span>
                      </td>
                      <td>
                        <div className="tags-container">
                          {getTagsList(runner.tags).slice(0, 3).map((tag, index) => (
                            <span key={index} className="tag">
                              {tag}
                            </span>
                          ))}
                          {getTagsList(runner.tags).length > 3 && (
                            <span className="tag-more">
                              +{getTagsList(runner.tags).length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <button 
                          className="view-btn"
                          onClick={() => setSelectedRunner(runner)}
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

        {selectedRunner && (
          <div className="detail-overlay" onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedRunner(null)
            }
          }}>
            <div className="detail-sidebar">
              <div className="detail-sidebar-header">
                <h3>Chi tiết Runner: {selectedRunner.hostname}</h3>
                <button 
                  className="close-btn"
                  onClick={() => setSelectedRunner(null)}
                >
                  ×
                </button>
              </div>
              
              <div className="detail-sidebar-content">
                <div className="detail-section">
                  <h4>Thông tin cơ bản</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Runner ID:</label>
                      <span className="monospace">{selectedRunner.id}</span>
                    </div>
                    <div className="detail-item">
                      <label>Hostname:</label>
                      <span>{selectedRunner.hostname}</span>
                    </div>
                    <div className="detail-item">
                      <label>IP Address:</label>
                      <span className="monospace">{selectedRunner.ip}</span>
                    </div>
                    <div className="detail-item">
                      <label>Status:</label>
                      <span 
                        className="status-badge" 
                        style={{ backgroundColor: getStatusColor() }}
                      >
                        Online
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Tags</h4>
                  <div className="tags-detail">
                    {getTagsList(selectedRunner.tags).map((tag, index) => (
                      <span key={index} className="tag-detail">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Raw Data</h4>
                  <pre className="payload-container">
                    {JSON.stringify(selectedRunner, null, 2)}
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

export default Runner
