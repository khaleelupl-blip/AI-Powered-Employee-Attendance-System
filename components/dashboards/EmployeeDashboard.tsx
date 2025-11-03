
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../services/api';
import type { AttendanceRecord, LeaveRequest, LocationData } from '../../types';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Spinner from '../shared/Spinner';
import CameraModal from '../camera/CameraModal';
import LeaveRequestModal from '../modals/LeaveRequestModal';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';


const EmployeeDashboard: React.FC = () => {
    const { user } = useAuth();
    const [status, setStatus] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [history, setHistory] = useState<AttendanceRecord[]>([]);
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [cameraAction, setCameraAction] = useState<'CheckIn' | 'CheckOut'>('CheckIn');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchData = async () => {
        if (!user) return;
        try {
            const [userStatus, userStats, userHistory, userLeaves] = await Promise.all([
                api.getUserStatus(user.username),
                api.getDashboardStats(user.username),
                api.getEmployeeAttendanceHistory(user.username),
                api.getEmployeeLeaveRequests(user.username)
            ]);
            setStatus(userStatus);
            setStats(userStats);
            setHistory(userHistory);
            setLeaves(userLeaves);
        } catch (error) {
            console.error("Failed to fetch employee data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleAttendanceAction = (action: 'CheckIn' | 'CheckOut') => {
        setCameraAction(action);
        setIsCameraOpen(true);
    };

    const handleConfirmAttendance = async (photo: string, location: LocationData) => {
        if (!user) return;
        setIsCameraOpen(false);
        setLoading(true);
        try {
            const data = { username: user.username, image: photo, ...location };
            if (cameraAction === 'CheckIn') {
                await api.checkIn(data);
            } else {
                await api.checkOut(data);
            }
            await fetchData(); // Refresh data
        } catch (error) {
            console.error(`Failed to ${cameraAction}`, error);
            alert(`Error: ${(error as Error).message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveSubmit = async (requestData: Omit<LeaveRequest, 'leaveId' | 'status' | 'appliedDate' | 'username'>) => {
        if (!user) return;
        try {
            await api.submitLeaveRequest({
                ...requestData,
                username: user.username
            });
            setIsLeaveModalOpen(false);
            await fetchData(); // Refresh leave list
        } catch (error) {
            console.error("Failed to submit leave request", error);
            // Re-throw to show error in modal
            throw error;
        }
    };

    if (loading || !user || !status || !stats) {
        return <div className="flex justify-center items-center h-64"><Spinner /></div>;
    }

    const attendanceChartData = [
        { name: 'Present', days: stats.present, fill: '#10B981' },
        { name: 'Absent', days: stats.absent, fill: '#EF4444' },
        { name: 'Sundays', days: stats.sundays, fill: '#3B82F6' },
    ];

    const getStatusIndicator = () => {
        if (status.hasCheckedIn && !status.hasCheckedOut) {
            return <div className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">Checked In</div>;
        }
        if (status.hasCheckedOut) {
            return <div className="px-3 py-1 text-sm font-medium text-gray-800 bg-gray-200 rounded-full">Checked Out</div>;
        }
        return <div className="px-3 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full">Not Checked In</div>;
    }
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
                <Card title="Attendance Action">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                           {currentTime.toLocaleTimeString()}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 mb-4">
                           {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        {getStatusIndicator()}
                        <div className="mt-6 space-y-3">
                            {!status.hasCheckedIn && <Button variant="success" className="w-full" onClick={() => handleAttendanceAction('CheckIn')} icon={<i className="fas fa-camera mr-2"></i>}>Check In with Selfie</Button>}
                            {status.hasCheckedIn && !status.hasCheckedOut && <Button variant="danger" className="w-full" onClick={() => handleAttendanceAction('CheckOut')} icon={<i className="fas fa-camera mr-2"></i>}>Check Out with Selfie</Button>}
                            {status.hasCheckedOut && <p className="text-gray-500">Your attendance for today is complete.</p>}
                        </div>
                    </div>
                </Card>
                <Card title="Today's Status">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-600 dark:text-gray-300">Check-In Time</span>
                            <span className="font-semibold text-gray-800 dark:text-white">{status.checkInTime || '--:--:--'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-600 dark:text-gray-300">Check-Out Time</span>
                            <span className="font-semibold text-gray-800 dark:text-white">{status.checkOutTime || '--:--:--'}</span>
                        </div>
                         <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {status.locationUri ? (
                                    <a href={status.locationUri} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                        <i className="fas fa-map-marker-alt mr-2"></i>{status.location || 'View on Map'}
                                    </a>
                                ) : (
                                    <span>
                                        <i className="fas fa-map-marker-alt mr-2"></i>{status.location || 'Location not recorded'}
                                    </span>
                                )}
                            </div>
                            {status.checkInCoords && (
                                <div className="text-xs text-gray-400 mt-1 pl-5">
                                    ({status.checkInCoords.lat.toFixed(4)}, {status.checkInCoords.lng.toFixed(4)})
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
                <Card title="Leave Management">
                    <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-300 mb-4">Need to take time off? Submit your leave request here.</p>
                        <Button
                            variant="primary"
                            className="w-full"
                            onClick={() => setIsLeaveModalOpen(true)}
                            icon={<i className="fas fa-calendar-plus mr-2"></i>}
                        >
                            Apply for Leave
                        </Button>
                    </div>
                </Card>
            </div>
            <div className="lg:col-span-2 space-y-6">
                <Card title="Monthly Attendance Summary">
                    <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={attendanceChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="days" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                    </div>
                </Card>
                <Card title="Attendance History">
                    <div className="overflow-x-auto max-h-96">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-In</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-Out</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {history.length > 0 ? history.map(record => (
                                    <tr key={record.date}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{record.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{record.checkInTime || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{record.checkOutTime || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 max-w-xs">
                                            {record.checkInAddress && (
                                                <div className="truncate" title={record.checkInAddress}>
                                                    <strong>In: </strong>
                                                    {record.checkInUri ? (
                                                        <a href={record.checkInUri} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                                            {record.checkInAddress}
                                                        </a>
                                                    ) : (
                                                        record.checkInAddress
                                                    )}
                                                </div>
                                            )}
                                            {record.checkOutAddress && (
                                                <div className="truncate mt-1" title={record.checkOutAddress}>
                                                    <strong>Out: </strong>
                                                    {record.checkOutUri ? (
                                                        <a href={record.checkOutUri} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                                            {record.checkOutAddress}
                                                        </a>
                                                    ) : (
                                                        record.checkOutAddress
                                                    )}
                                                </div>
                                            )}
                                            {!record.checkInAddress && !record.checkOutAddress && 'N/A'}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                            No attendance history found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
                <Card title="Leave Request History">
                    <div className="overflow-x-auto max-h-96">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {leaves.length > 0 ? leaves.map(leave => (
                                    <tr key={leave.leaveId}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white capitalize">{leave.leaveType}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{`${leave.fromDate} to ${leave.toDate}`}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 max-w-xs truncate" title={leave.reason}>{leave.reason}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                                                leave.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                                leave.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                            }`}>
                                                {leave.status}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                            No leave requests found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            <CameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onConfirm={handleConfirmAttendance} action={cameraAction} />
            <LeaveRequestModal 
                isOpen={isLeaveModalOpen} 
                onClose={() => setIsLeaveModalOpen(false)} 
                onSubmit={handleLeaveSubmit}
            />
        </div>
    );
};

export default EmployeeDashboard;
