import { useState, useEffect } from 'react'
import './App.css'

interface Job {
    ID: number
    RunnerID: string
    MsgID: string
    Status: string
    RequestPayload: string
    ResponsePayload: string
    Timeout: boolean
    created_at: string
}

interface JobsResponse {
    jobs: Job[]
    data: Job[]
}

function Jobs() {
    const [jobs, setJobs] = useState<Job[]>([])
    const [selectedJob, setSelectedJob] = useState<Job | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    // Function to fetch jobs from API
    const fetchJobs = async () => {
        try {
            setLoading(true)
            setError(null)

            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://10.24.191.38:5000'
            const response = await fetch(`${apiBaseUrl}/get-jobs`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors', // Explicitly set CORS mode
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`)
            }

            const data: JobsResponse = await response.json()
            console.log('API Response:', data) // Debug log
            // setJobs(data.jobs || [])
            setJobs(data.data || [])
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch jobs'
            setError(`Không thể kết nối đến API: ${errorMessage}`)
            console.error('Error fetching jobs:', err)

            // Fallback to mock data for testing
            console.log('Using mock data as fallback')
            // const mockData: JobsResponse = {
            //     jobs: [
            //         {
            //             ID: 1,
            //             RunnerID: "493bf9e80adb294d2c3fe6dfdd711e96",
            //             MsgID: "be038f31-e67f-495c-a04d-f3660d349030",
            //             Status: "timeout",
            //             RequestPayload: JSON.stringify({
            //                 id: "be038f31-e67f-495c-a04d-f3660d349030",
            //                 reply_to: "493bf9e80adb294d2c3fe6dfdd711e96",
            //                 script: "check_site.sh",
            //                 subDomain: "test.com.vn"
            //             }),
            //             ResponsePayload: "",
            //             Timeout: true
            //         },
            //         {
            //             ID: 2,
            //             RunnerID: "123bf9e80adb294d2c3fe6dfdd711e96",
            //             MsgID: "ae038f31-e67f-495c-a04d-f3660d349030",
            //             Status: "success",
            //             RequestPayload: JSON.stringify({
            //                 id: "ae038f31-e67f-495c-a04d-f3660d349030",
            //                 reply_to: "123bf9e80adb294d2c3fe6dfdd711e96",
            //                 script: "check_site.sh",
            //                 subDomain: "demo.com.vn"
            //             }),
            //             ResponsePayload: JSON.stringify({
            //                 success: true,
            //                 result: "Site is online"
            //             }),
            //             Timeout: false
            //         }
            //     ]
            // }
            // setJobs(mockData.jobs)
        } finally {
            setLoading(false)
        }
    }

    // Fetch jobs from API
    useEffect(() => {
        fetchJobs()
    }, [])

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

    const formatPayload = (payload: string) => {
        try {
            return JSON.stringify(JSON.parse(payload), null, 2)
        } catch {
            return payload
        }
    }

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>Job Management Dashboard</h1>
                <p>Quản lý và theo dõi các jobs</p>
            </header>

            <div className="jobs-container">
                <div className="jobs-table-container">
                    <div className="table-header">
                        <h2>Danh sách Jobs ({jobs.length})</h2>
                        <button
                            className="refresh-btn"
                            onClick={fetchJobs}
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
                                onClick={fetchJobs}
                                disabled={loading}
                            >
                                {loading ? 'Đang thử lại...' : 'Thử lại'}
                            </button>
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="empty-state">
                            <h3>Không có jobs nào</h3>
                            <p>Hiện tại chưa có job nào trong hệ thống</p>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="jobs-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Status</th>
                                        <th>Runner ID</th>
                                        <th>Message ID</th>
                                        <th>Timeout</th>
                                        <th>Actions</th>
                                        {/* <th>created_at</th> */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {jobs.map((job) => (
                                        <tr key={job.ID} className={selectedJob?.ID === job.ID ? 'selected' : ''}>
                                            <td>{job.ID}</td>
                                            <td>
                                                <span
                                                    className="status-badge"
                                                    style={{ backgroundColor: getStatusColor(job.Status) }}
                                                >
                                                    {job.Status}
                                                </span>
                                            </td>
                                            <td className="truncate">{job.RunnerID}</td>
                                            <td className="truncate">{job.MsgID}</td>
                                            <td>
                                                <span className={`timeout-badge ${job.Timeout ? 'timeout-yes' : 'timeout-no'}`}>
                                                    {job.Timeout ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="view-btn"
                                                    onClick={() => setSelectedJob(job)}
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                            {/* <td>
                                                <span className="created-at">{new Date(job.created_at).toLocaleString()}</span>
                                            </td> */}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {selectedJob && (
                    <div className="detail-overlay" onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setSelectedJob(null)
                        }
                    }}>
                        <div className="detail-sidebar">
                            <div className="detail-sidebar-header">
                                <h3>Chi tiết Job #{selectedJob.ID}</h3>
                                <button
                                    className="close-btn"
                                    onClick={() => setSelectedJob(null)}
                                >
                                    ×
                                </button>
                            </div>

                            <div className="detail-sidebar-content">
                                <div className="detail-section">
                                    <h4>Thông tin cơ bản</h4>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <label>Job ID:</label>
                                            <span>{selectedJob.ID}</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Status:</label>
                                            <span
                                                className="status-badge"
                                                style={{ backgroundColor: getStatusColor(selectedJob.Status) }}
                                            >
                                                {selectedJob.Status}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Runner ID:</label>
                                            <span className="monospace">{selectedJob.RunnerID}</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Message ID:</label>
                                            <span className="monospace">{selectedJob.MsgID}</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Timeout:</label>
                                            <span className={`timeout-badge ${selectedJob.Timeout ? 'timeout-yes' : 'timeout-no'}`}>
                                                {selectedJob.Timeout ? 'Yes' : 'No'}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Created At:</label>
                                            <span>{new Date(selectedJob.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="detail-section">
                                    <h4>Request Payload</h4>
                                    <pre className="payload-container">
                                        {formatPayload(selectedJob.RequestPayload)}
                                    </pre>
                                </div>

                                <div className="detail-section">
                                    <h4>Response Payload</h4>
                                    <pre className="payload-container">
                                        {selectedJob.ResponsePayload || 'No response payload'}
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

export default Jobs
