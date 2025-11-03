
import type { User, AttendanceRecord, LeaveRequest, Department } from '../types';

export const usersData: User[] = [
    { username: 'admin', fullName: 'System Administrator', department: 'Administration', position: 'Admin', role: 'admin', status: 'active' },
    { username: 'john.doe', fullName: 'John Doe', department: 'IT Department', position: 'Frontend Developer', role: 'employee', status: 'active', profilePhoto: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iIzRiNjlmOCIvPjxwYXRoIGQ9Ik0yMCAyMkMyNS41MjMgMjIgMzAgMjYuNDc3IDMwIDMySDI5QzI5IDI3LjAzNyAyNC45NjMgMjMgMjAgMjNaIiBmaWxsPSIjZmZmZmZmIi8+PGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNCIgZmlsbD0iI2ZmZmZmZiIvPjwvc3ZnPg==' },
    { username: 'jane.smith', fullName: 'Jane Smith', department: 'IT Department', position: 'Project Manager', role: 'manager', status: 'active', profilePhoto: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iIzhiNWRkYiIvPjxwYXRoIGQ9Ik0yMCAyMkMyNS41MjMgMjIgMzAgMjYuNDc3IDMwIDMySDI5QzI5IDI3LjAzNyAyNC45NjMgMjMgMjAgMjNaIiBmaWxsPSIjZmZmZmZmIi8+PGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNCIgZmlsbD0iI2ZmZmZmZiIvPjwvc3ZnPg==' },
    { username: 'peter.jones', fullName: 'Peter Jones', department: 'Human Resources', position: 'HR Specialist', role: 'employee', status: 'active' },
    { username: 'susan.baker', fullName: 'Susan Baker', department: 'Finance', position: 'Accountant', role: 'employee', status: 'active', profilePhoto: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI2VjNGI5YyIvPjxwYXRoIGQ9Ik0yMCAyMkMyNS41MjMgMjIgMzAgMjYuNDc3IDMwIDMySDI5QzI5IDI3LjAzNyAyNC45NjMgMjMgMjAgMjNaIiBmaWxsPSIjZmZmZmZmIi8+PGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNCIgZmlsbD0iI2ZmZmZmZiIvPjwvc3ZnPg==' }
];

const today = new Date();
const d = (days: number) => new Date(today.getTime() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

export const attendanceData: AttendanceRecord[] = [
    // Today
    { username: 'john.doe', date: d(0), checkInTime: '09:05:15', checkOutTime: '17:30:00', checkInAddress: 'Office Location' },
    { username: 'jane.smith', date: d(0), checkInTime: '08:55:00', checkOutTime: '18:05:20', checkInAddress: 'Office Location' },
    { username: 'peter.jones', date: d(0), checkInTime: '09:40:00', checkInAddress: 'Office Location' }, // Late, not checked out

    // Yesterday
    { username: 'john.doe', date: d(1), checkInTime: '09:00:10', checkOutTime: '17:35:00' },
    { username: 'jane.smith', date: d(1), checkInTime: '08:50:10', checkOutTime: '17:45:00' },
    { username: 'peter.jones', date: d(1), checkInTime: '09:10:10', checkOutTime: '17:55:00' },
    { username: 'susan.baker', date: d(1), checkInTime: '09:10:10', checkOutTime: '17:45:00' },

    // 2 days ago
    { username: 'john.doe', date: d(2), checkInTime: '09:15:00', checkOutTime: '17:30:00' },
    { username: 'peter.jones', date: d(2), checkInTime: '09:05:00', checkOutTime: '17:50:00' },
    
    // 3 days ago
    { username: 'john.doe', date: d(3), checkInTime: '09:02:00', checkOutTime: '17:30:00' },
    { username: 'jane.smith', date: d(3), checkInTime: '08:58:00', checkOutTime: '18:00:00' },
    { username: 'peter.jones', date: d(3), checkInTime: '09:08:00', checkOutTime: '17:40:00' },
    { username: 'susan.baker', date: d(3), checkInTime: '09:12:00', checkOutTime: '17:48:00' },

    // 4 days ago - low attendance
    { username: 'jane.smith', date: d(4), checkInTime: '09:00:00', checkOutTime: '18:10:00' },
    { username: 'susan.baker', date: d(4), checkInTime: '09:20:00', checkOutTime: '17:30:00' },
    
    // 5 days ago
    { username: 'john.doe', date: d(5), checkInTime: '09:00:00', checkOutTime: '17:30:00' },
    { username: 'jane.smith', date: d(5), checkInTime: '08:55:00', checkOutTime: '18:00:00' },
    { username: 'peter.jones', date: d(5), checkInTime: '09:05:00', checkOutTime: '17:50:00' },
    { username: 'susan.baker', date: d(5), checkInTime: '09:15:00', checkOutTime: '17:45:00' },
    
    // 6 days ago
    { username: 'john.doe', date: d(6), checkInTime: '09:10:00', checkOutTime: '17:30:00' },
    { username: 'jane.smith', date: d(6), checkInTime: '08:50:00', checkOutTime: '18:05:00' },
    { username: 'susan.baker', date: d(6), checkInTime: '09:05:00', checkOutTime: '17:40:00' },
];

export const leaveRequestsData: LeaveRequest[] = [
    { leaveId: 'L123', username: 'susan.baker', leaveType: 'sick', fromDate: d(0), toDate: d(0), reason: 'Feeling unwell', status: 'pending', appliedDate: d(0) },
    { leaveId: 'L124', username: 'john.doe', leaveType: 'annual', fromDate: '2023-12-20', toDate: '2023-12-22', reason: 'Vacation', status: 'approved', appliedDate: '2023-12-01' },
    { leaveId: 'L125', username: 'peter.jones', leaveType: 'sick', fromDate: d(2), toDate: d(2), reason: 'Doctors Appointment', status: 'approved', appliedDate: d(3) },
    { leaveId: 'L126', username: 'john.doe', leaveType: 'unpaid', fromDate: d(8), toDate: d(8), reason: 'Personal emergency', status: 'rejected', appliedDate: d(9) },
    { leaveId: 'L127', username: 'susan.baker', leaveType: 'annual', fromDate: d(15), toDate: d(12), reason: 'Holiday trip', status: 'approved', appliedDate: d(20) },
    { leaveId: 'L128', username: 'peter.jones', leaveType: 'sick', fromDate: d(1), toDate: d(1), reason: 'Migraine', status: 'pending', appliedDate: d(1) },
    { leaveId: 'L129', username: 'jane.smith', leaveType: 'annual', fromDate: d(30), toDate: d(25), reason: 'Family visit', status: 'approved', appliedDate: d(40) },
];

export const departmentsData: Department[] = [
    { deptId: 'DEPT001', deptName: 'Administration', description: 'System Administration Department', manager: 'admin', createdDate: '2023-01-01' },
    { deptId: 'DEPT002', deptName: 'Human Resources', description: 'Human Resources Department', manager: '', createdDate: '2023-01-01' },
    { deptId: 'DEPT003', deptName: 'IT Department', description: 'Information Technology Department', manager: 'jane.smith', createdDate: '2023-01-01' },
    { deptId: 'DEPT004', deptName: 'Finance', description: 'Finance and Accounting Department', manager: '', createdDate: '2023-01-01' }
];
