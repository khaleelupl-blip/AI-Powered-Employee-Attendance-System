import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../services/api';
import type { LeaveRequest, LocationData, Department, User } from '../../types';
import Card from '../shared/Card';
import Spinner from '../shared/Spinner';
import StatCard from '../shared/StatCard';
import Button from '../shared/Button';
import CameraModal from '../camera/CameraModal';
import EmployeeModal from '../modals/EmployeeModal'; // Import EmployeeModal

interface DepartmentEmployee {
    username: string; // Add username for editing
    name: string;
    position: string;
    status: 'checkedin' | 'checkedout' | 'notchecked';
    lastActivity: string;
    checkInAddress?: string;
    checkInUri?: string;
    checkOutAddress?: string;
    checkOutUri?: string;
}

const ManagerDashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [employees, setEmployees] = useState<DepartmentEmployee[]>([]);
    const [allEmployees, setAllEmployees] = useState<User[]>([]); // Store full user objects
    const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]); // For EmployeeModal
    const [loading, setLoading] = useState(true);

    // State for manager's own attendance
    const [myStatus, setMyStatus] = useState<any>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [cameraAction, setCameraAction] = useState<'CheckIn' | 'CheckOut'>('CheckIn');
    const [currentTime, setCurrentTime] = useState(new Date());

    // State for employee management modal
    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
    
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [deptEmployees, managerLeaves, managerStatus, allDepts, allUsers] = await Promise.all([
                api.getDepartmentEmployees(user.username),
                api.getPendingLeaveRequestsForManager(user.username),
                api.getUserStatus(user.username), // Fetch manager's own status
                api.getAllDepartments(), // Fetch departments for modal
                api.getAllEmployees() // Fetch all users to find full objects for editing
            ]);
            
            const presentCount = deptEmployees.filter(e => e.status === 'checkedin' || e.status === 'checkedout').length;
            const total = deptEmployees.length;

            setStats({ total, present: presentCount });
            setEmployees(deptEmployees);
            setAllEmployees(allUsers);
            setPendingLeaves(managerLeaves);
            setMyStatus(managerStatus);
            setDepartments(allDepts);
        } catch (error) {
            console.error("Failed to fetch manager data", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- My Attendance Handlers ---
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
            await fetchData(); // Refresh all data
        } catch (error) {
            console.error(`Failed to ${cameraAction}`, error);
            alert(`Error: ${(error as Error).message}`);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIndicator = () => {
        if (!myStatus) return null;
        if (myStatus.hasCheckedIn && !myStatus.hasCheckedOut) {
            return <div className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">Checked In</div>;
        }
        if (myStatus.hasCheckedOut) {
            return <div className="px-3 py-1 text-sm font-medium text-gray-800 bg-gray-200 rounded-full">Checked Out</div>;
        }
        return <div className="px-3 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full">Not Checked In</div>;
    };

    // --- Leave Management Handlers ---
    const handleApproveLeave = async (leaveId: string) => {
        if (!user) return;
        await api.approveLeaveByManager(leaveId, user.username);
        fetchData(); // Refresh list
    };

    const handleRejectLeave = async (leaveId: string) => {
        if (!user) return;
        await api.rejectLeaveByManager(leaveId, user.username);
        fetchData(); // Refresh list
    };

    // --- Employee Management Handlers ---
    const handleOpenAddEmployee = () => {
        setEditingEmployee(null);
        setIsEmployeeModalOpen(true);
    };

    const handleOpenEditEmployee = (employeeUsername: string) => {
        const employeeToEdit = allEmployees.find(e => e.username === employeeUsername);
        if (employeeToEdit) {
            setEditingEmployee(employeeToEdit);
            setIsEmployeeModalOpen(true);
        }
    };

    const handleSaveEmployee = async (employeeData: User) => {
        try {
            if (editingEmployee) {
                await api.updateEmployee(employeeData);
            } else {
                await api.addNewEmployee(employeeData);
            }
            setIsEmployeeModalOpen(false);
            await fetchData(); // Refresh data
        } catch (error) {
            console.error("Failed to save employee", error);
            alert(`Error: ${(error as Error).message}`);
        }
    };


    if (loading || !user) {
        return <div className="flex justify-center items-center h-64"><Spinner /></div>;
    }

    const EmployeeStatus: React.FC<{ status: 'checkedin' | 'checkedout' | 'notchecked' }> = ({ status }) => {
        const statusMap = {
            checkedin: { text: 'Checked In', icon: 'fa-check-circle', color: 'bg-green-100 text-green-800' },
            checkedout: { text: 'Checked Out', icon: 'fa-sign-out-alt', color: 'bg-yellow-100 text-yellow-800' },
            notchecked: { text: 'Not Checked In', icon: 'fa-clock', color: 'bg-gray-100 text-gray-800' },
        };
        const { text, icon, color } = statusMap[status];
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
                <i className={`fas ${icon} mr-1.5`}></i>
                {text}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="My Department" value={user.department} icon={<i className="fas fa-building"></i>} color="purple" />
                <StatCard title="Team Members" value={stats?.total || 0} icon={<i className="fas fa-users"></i>} color="indigo" />
                <StatCard title="Team Present" value={stats?.present || 0} icon={<i className="fas fa-user-check"></i>} color="green" />
                <StatCard title="Pending Approvals" value={pendingLeaves.length} icon={<i className="fas fa-inbox"></i>} color="yellow" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-1 space-y-6">
                    <Card title="My Attendance">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{currentTime.toLocaleTimeString()}</div>
                            <div className="text-gray-500 dark:text-gray-400 mb-4">{currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                            {getStatusIndicator()}
                            <div className="mt-6 space-y-3">
                                {!myStatus?.hasCheckedIn && <Button variant="success" className="w-full" onClick={() => handleAttendanceAction('CheckIn')} icon={<i className="fas fa-camera mr-2"></i>}>Check In with Selfie</Button>}
                                {myStatus?.hasCheckedIn && !myStatus.hasCheckedOut && <Button variant="danger" className="w-full" onClick={() => handleAttendanceAction('CheckOut')} icon={<i className="fas fa-camera mr-2"></i>}>Check Out with Selfie</Button>}
                                {myStatus?.hasCheckedOut && <p className="text-gray-500">Your attendance for today is complete.</p>}
                            </div>
                        </div>
                    </Card>
                     <Card title="Pending Leave Requests">
                         <div className="space-y-4 max-h-96 overflow-y-auto">
                            {pendingLeaves.length > 0 ? pendingLeaves.map(leave => (
                                <div key={leave.leaveId} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-white">{leave.username}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">{leave.leaveType} Leave: {leave.fromDate} to {leave.toDate}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 border-l-2 border-gray-200 dark:border-gray-600 pl-2">{leave.reason}</p>
                                    <div className="flex justify-end space-x-2 mt-3">
                                        <Button size="sm" variant="success" onClick={() => handleApproveLeave(leave.leaveId)}>Approve</Button>
                                        <Button size="sm" variant="danger" onClick={() => handleRejectLeave(leave.leaveId)}>Reject</Button>
                                    </div>
                                </div>
                            )) : <p className="text-center text-gray-500 dark:text-gray-400 py-8">No pending leave requests.</p>}
                        </div>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card 
                        title="Department Employees Status" 
                        actions={
                            <div className="flex space-x-2">
                                <Button variant="primary" size="sm" onClick={handleOpenAddEmployee} icon={<i className="fas fa-plus mr-1" />}>Add Employee</Button>
                                <Button variant="secondary" size="sm" onClick={fetchData}><i className="fas fa-sync-alt"></i></Button>
                            </div>
                        }
                    >
                        <div className="max-h-[800px] overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {employees.map((emp, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{emp.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm"><EmployeeStatus status={emp.status} /></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{emp.lastActivity}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 max-w-xs">
                                                {emp.checkInAddress && (
                                                    <div className="truncate" title={emp.checkInAddress}>
                                                        <strong>In: </strong>
                                                        {emp.checkInUri ? (
                                                            <a href={emp.checkInUri} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                                                {emp.checkInAddress}
                                                            </a>
                                                        ) : (
                                                            emp.checkInAddress
                                                        )}
                                                    </div>
                                                )}
                                                {emp.checkOutAddress && (
                                                    <div className="truncate mt-1" title={emp.checkOutAddress}>
                                                        <strong>Out: </strong>
                                                        {emp.checkOutUri ? (
                                                            <a href={emp.checkOutUri} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                                                {emp.checkOutAddress}
                                                            </a>
                                                        ) : (
                                                            emp.checkOutAddress
                                                        )}
                                                    </div>
                                                )}
                                                {!emp.checkInAddress && !emp.checkOutAddress && 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <Button size="sm" variant="secondary" onClick={() => handleOpenEditEmployee(emp.username)}>Edit</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
            <CameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onConfirm={handleConfirmAttendance} action={cameraAction} />
            <EmployeeModal
                isOpen={isEmployeeModalOpen}
                onClose={() => setIsEmployeeModalOpen(false)}
                onSave={handleSaveEmployee}
                employee={editingEmployee}
                departments={departments}
                restrictedDepartment={user.department} // Lock department to manager's own
                allowedRoles={['employee']} // Manager can only create employees
            />
        </div>
    );
};

export default ManagerDashboard;