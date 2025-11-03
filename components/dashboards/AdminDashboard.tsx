import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as api from '../../services/api';
import * as geminiService from '../../services/geminiService';
import type { User, LeaveRequest, Department, AttendanceRecord, UserRole } from '../../types';
import Card from '../shared/Card';
import Spinner from '../shared/Spinner';
import StatCard from '../shared/StatCard';
import Button from '../shared/Button';
import EmployeeList from '../admin/EmployeeList';
import DepartmentList from '../admin/DepartmentList';
import LeaveList from '../admin/LeaveList';
import AnalyticsTab from '../admin/AnalyticsTab';
import EmployeeModal from '../modals/EmployeeModal';
import DepartmentModal from '../modals/DepartmentModal';
import ConfirmModal from '../modals/ConfirmModal';


const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('employees');
  const [stats, setStats] = useState<any>(null);
  const [employees, setEmployees] = useState<User[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [allLeaves, setAllLeaves] = useState<LeaveRequest[]>([]);
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  
  // Modal States
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ action?: () => void, title?: string, message?: string }>({});

  // Filter States
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');


  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [adminStats, allEmployees, pending, allDepts, allManagers, allL, allA] = await Promise.all([
        api.getAdminDashboardStats(),
        api.getAllEmployees(),
        api.getAllPendingLeaveRequests(),
        api.getAllDepartments(),
        api.getAllManagers(),
        api.getAllLeaveRequests(),
        api.getEmployeeAttendanceHistory(''),
      ]);
      setStats(adminStats);
      setEmployees(allEmployees);
      setPendingLeaves(pending);
      setDepartments(allDepts);
      setManagers(allManagers);
      setAllLeaves(allL);
      setAllAttendance(allA);
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
        const statusMatch = statusFilter === 'all' || employee.status === statusFilter;
        const roleMatch = roleFilter === 'all' || employee.role === roleFilter;
        return statusMatch && roleMatch;
    });
  }, [employees, statusFilter, roleFilter]);

  // --- Modal Handlers ---
  const handleOpenAddEmployee = () => {
    setEditingEmployee(null);
    setIsEmployeeModalOpen(true);
  };

  const handleOpenEditEmployee = (employee: User) => {
    setEditingEmployee(employee);
    setIsEmployeeModalOpen(true);
  };
  
  const handleOpenAddDepartment = () => {
      setEditingDepartment(null);
      setIsDepartmentModalOpen(true);
  };
  
  const handleOpenEditDepartment = (department: Department) => {
      setEditingDepartment(department);
      setIsDepartmentModalOpen(true);
  };

  const handleSaveEmployee = async (employee: User) => {
    if (editingEmployee) { // Update
        await api.updateEmployee(employee);
    } else { // Add
        await api.addNewEmployee(employee);
    }
    setIsEmployeeModalOpen(false);
    fetchData();
  };
  
  const handleSaveDepartment = async (department: Department) => {
      if(editingDepartment) {
          await api.updateDepartment(department);
      } else {
          await api.addDepartment(department);
      }
      setIsDepartmentModalOpen(false);
      fetchData();
  };

  const handleDeleteEmployee = (username: string) => {
    setConfirmAction({
        action: async () => {
            await api.deleteEmployee(username);
            setIsConfirmModalOpen(false);
            fetchData();
        },
        title: "Deactivate Employee",
        message: `Are you sure you want to deactivate employee ${username}? This action will set their status to 'inactive'.`
    });
    setIsConfirmModalOpen(true);
  };


  // --- Other Handlers ---
  const handleGenerateSummary = async () => {
    setIsSummaryLoading(true);
    setAiSummary('');
     const allAttendance = await api.getEmployeeAttendanceHistory(''); // Fetch all for summary
     const allEmployees = await api.getAllEmployees();
    try {
        const summary = await geminiService.generateAttendanceSummary(allEmployees, allAttendance);
        setAiSummary(summary);
    } catch (error) {
        setAiSummary('Failed to generate summary.');
    } finally {
        setIsSummaryLoading(false);
    }
  };

  const handleApproveLeave = async (leaveId: string) => {
    await api.approveLeaveByAdmin(leaveId);
    fetchData(); // Refresh
  };
  
  const handleRejectLeave = async (leaveId: string) => {
    await api.rejectLeaveByAdmin(leaveId);
    fetchData(); // Refresh
  };

  const tabs = [
    { id: 'employees', label: 'Employees', icon: 'fa-users' },
    { id: 'departments', label: 'Departments', icon: 'fa-building' },
    { id: 'leaves', label: 'Leave Requests', icon: 'fa-calendar-alt' },
    { id: 'analytics', label: 'Analytics & Reports', icon: 'fa-chart-line' },
    { id: 'ai_summary', label: 'AI Summary', icon: 'fa-robot' },
  ];
  
  const employeeListActions = (
    <div className="flex items-center space-x-2 md:space-x-4">
        <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
        </select>
        <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
            <option value="all">All Roles</option>
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
        </select>
        <Button onClick={handleOpenAddEmployee} icon={<i className="fas fa-plus mr-2"/>} className="whitespace-nowrap">Add Employee</Button>
    </div>
  );

  const renderTabContent = () => {
    switch(activeTab) {
        case 'employees':
            return <Card title="All Employees" actions={employeeListActions}><EmployeeList employees={filteredEmployees} onEdit={handleOpenEditEmployee} onDelete={handleDeleteEmployee} /></Card>;
        case 'departments':
            return <Card title="Departments" actions={<Button onClick={handleOpenAddDepartment} icon={<i className="fas fa-plus mr-2"/>}>Add Department</Button>}><DepartmentList departments={departments} onEdit={handleOpenEditDepartment} /></Card>;
        case 'leaves':
            return <Card title="Pending Leave Requests"><LeaveList leaves={pendingLeaves} onApprove={handleApproveLeave} onReject={handleRejectLeave} /></Card>;
        case 'analytics':
            return <AnalyticsTab attendanceRecords={allAttendance} leaveRequests={allLeaves} />;
        case 'ai_summary':
            return (
                <Card title="AI Daily Summary" actions={<Button onClick={handleGenerateSummary} isLoading={isSummaryLoading} icon={<i className="fas fa-magic mr-2"></i>}>Generate</Button>}>
                    {isSummaryLoading && <Spinner />}
                    {aiSummary && <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: aiSummary.replace(/\n/g, '<br />') }} />}
                    {!aiSummary && !isSummaryLoading && <p className="text-gray-500">Click "Generate" to get an AI-powered summary of today's attendance.</p>}
                </Card>
            );
        default: return null;
    }
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  }
  
  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Employees" value={stats?.totalEmployees || 0} icon={<i className="fas fa-users"></i>} color="indigo" />
            <StatCard title="Present Today" value={stats?.presentToday || 0} icon={<i className="fas fa-user-check"></i>} color="green" />
            <StatCard title="Absent Today" value={stats?.absentToday || 0} icon={<i className="fas fa-user-times"></i>} color="red" />
            <StatCard title="On Leave Today" value={stats?.onLeaveToday || 0} icon={<i className="fas fa-bed"></i>} color="yellow" />
        </div>

        <div>
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`${activeTab === tab.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                        whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}>
                        <i className={`fas ${tab.icon} mr-2`}></i>{tab.label}
                    </button>
                ))}
                </nav>
            </div>
            {renderTabContent()}
        </div>
        
        <EmployeeModal 
            isOpen={isEmployeeModalOpen}
            onClose={() => setIsEmployeeModalOpen(false)}
            onSave={handleSaveEmployee}
            employee={editingEmployee}
            departments={departments}
        />
        <DepartmentModal 
            isOpen={isDepartmentModalOpen}
            onClose={() => setIsDepartmentModalOpen(false)}
            onSave={handleSaveDepartment}
            department={editingDepartment}
            managers={managers}
        />
        <ConfirmModal 
            isOpen={isConfirmModalOpen}
            onClose={() => setIsConfirmModalOpen(false)}
            onConfirm={confirmAction.action}
            title={confirmAction.title || "Confirm Action"}
            message={confirmAction.message || "Are you sure?"}
        />

    </div>
  );
};

export default AdminDashboard;