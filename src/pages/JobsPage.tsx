import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Card, Button, LoadingSpinner } from '../components';
import type { Job } from '../types';

interface JobsResponse {
    jobs: Job[];
    data: Job[];
}

function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            setError(null);

            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://10.24.191.38:5000';
            const response = await fetch(`${apiBaseUrl}/get-jobs`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }

            const data: JobsResponse = await response.json();
            console.log('API Response:', data);
            setJobs(data.data || []);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch jobs';
            setError(`Không thể kết nối đến API: ${errorMessage}`);
            console.error('Error fetching jobs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    useEffect(() => {
        if (selectedJob) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [selectedJob]);

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

    const formatPayload = (payload: string) => {
        try {
            return JSON.stringify(JSON.parse(payload), null, 2);
        } catch {
            return payload;
        }
    };

    return (
        <div className={`space-y-6 ${selectedJob ? 'overflow-hidden h-screen' : ''}`}>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
                    <p className="text-gray-600 mt-2">Manage and track jobs</p>
                </div>
                <Button onClick={fetchJobs} disabled={loading}>
                    {loading ? 'Loading...' : 'Refresh'}
                </Button>
            </div>

            <Card title={`Jobs List (${jobs.length})`}>
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
                            <Button variant="danger" onClick={fetchJobs} disabled={loading}>
                                {loading ? 'Retrying...' : 'Retry'}
                            </Button>
                        </div>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
                        <p className="text-gray-600">Currently, there are no jobs in the system</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Runner ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeout</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {jobs.map((job) => (
                                    <tr 
                                        key={job.ID} 
                                        className={`hover:bg-gray-50 ${selectedJob?.ID === job.ID ? 'bg-blue-50' : ''}`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{job.ID}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.Status)}`}>
                                                {job.Status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate max-w-xs">{job.RunnerID}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate max-w-xs">{job.MsgID}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                job.Timeout ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                                {job.Timeout ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => setSelectedJob(job)}
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

            {/* Job Detail Sidebar */}
            <AnimatePresence>
                {selectedJob && (
                    <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 h-full bg-black z-40"
                        onClick={() => setSelectedJob(null)}
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="fixed top-0 right-0 h-full w-full sm:w-96 md:w-[32rem] lg:w-[40rem] bg-white shadow-2xl z-50"
                    >
                        {/* nội dung của bạn */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-900">Chi tiết Job #{selectedJob.ID}</h3>
                            <button
                                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-200 rounded-full"
                                onClick={() => setSelectedJob(null)}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>


                        <div className="p-6 overflow-y-auto h-full pb-24 overscroll-contain">
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Thông tin cơ bản</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Job ID:</label>
                                            <span className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded border block">{selectedJob.ID}</span>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Status:</label>
                                            <span className={`inline-flex px-3 py-2 text-sm font-semibold rounded ${getStatusColor(selectedJob.Status)}`}>
                                                {selectedJob.Status}
                                            </span>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Runner ID:</label>
                                            <span className="text-sm text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded border block break-all">{selectedJob.RunnerID}</span>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Message ID:</label>
                                            <span className="text-sm text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded border block break-all">{selectedJob.MsgID}</span>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Timeout:</label>
                                            <span className={`inline-flex px-3 py-2 text-sm font-semibold rounded ${
                                                selectedJob.Timeout ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                                {selectedJob.Timeout ? 'Yes' : 'No'}
                                            </span>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Created At:</label>
                                            <span className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded border block">{new Date(selectedJob.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Request Payload</h4>
                                    <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto border max-h-60 overflow-y-auto">
                                        {formatPayload(selectedJob.RequestPayload)}
                                    </pre>
                                </div>

                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Response Payload</h4>
                                    <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto border max-h-60 overflow-y-auto">
                                        {selectedJob.ResponsePayload || 'No response payload'}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

export default JobsPage;
