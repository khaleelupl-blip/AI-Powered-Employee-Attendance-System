// This file mocks the Google Apps Script backend functionality for a standalone React app.
import type { User, AttendanceRecord, LeaveRequest, Department, CheckInData } from '../types';
import { usersData, attendanceData, leaveRequestsData, departmentsData } from './mockData';
import { getAddressFromCoordinates } from './geminiService';

const MOCK_API_DELAY = 500; // ms

// Helper to simulate network delay
const delay = <T,>(data: T): Promise<T> => 
  new Promise(resolve => setTimeout(() => resolve(data), MOCK_API_DELAY));

// --- Auth ---
export const loginUser = async (username: string, password_unused: string): Promise<User> => {
  const user = usersData.find(u => u.username === username); // Simplified login
  if (user && user.status === 'active') {
    return delay(user);
  }
  throw new Error('Invalid username or password');
};

// --- Employee ---
export const getUserStatus = async (username: string): Promise<{ hasCheckedIn: boolean, hasCheckedOut: boolean, checkInTime?: string, checkOutTime?: string, location?: string, locationUri?: string, checkInCoords?: { lat: number, lng: number} }> => {
  const today = new Date().toISOString().split('T')[0];
  const record = attendanceData.find(a => a.username === username && a.date === today);

  let checkInCoords;
  if(record?.checkInLat && record?.checkInLng) {
      checkInCoords = { lat: record.checkInLat, lng: record.checkInLng };
  }

  return delay({
    hasCheckedIn: !!record?.checkInTime,
    hasCheckedOut: !!record?.checkOutTime,
    checkInTime: record?.checkInTime,
    checkOutTime: record?.checkOutTime,
    location: record?.checkInAddress,
    locationUri: record?.checkInUri,
    checkInCoords,
  });
};

export const getDashboardStats = async (username: string): Promise<{ present: number, absent: number, sundays: number }> => {
  const userAttendance = attendanceData.filter(a => a.username === username);
  return delay({
    present: userAttendance.filter(a => a.checkInTime).length,
    absent: 5, // Mock data
    sundays: 4, // Mock data
  });
};

export const getEmployeeAttendanceHistory = async (username: string): Promise<AttendanceRecord[]> => {
    if (!username) return delay([...attendanceData]); // Return all if no username
    return delay(attendanceData.filter(a => a.username === username).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
};

export const submitLeaveRequest = async (req: Omit<LeaveRequest, 'leaveId' | 'status' | 'appliedDate'>): Promise<LeaveRequest> => {
    const newRequest: LeaveRequest = {
        ...req,
        leaveId: `L${Date.now()}`,
        status: 'pending',
        appliedDate: new Date().toISOString().split('T')[0],
    };
    leaveRequestsData.push(newRequest);
    return delay(newRequest);
};

export const getEmployeeLeaveRequests = async (username: string): Promise<LeaveRequest[]> => {
    return delay(leaveRequestsData.filter(l => l.username === username).sort((a,b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()));
};

// --- Attendance ---
const OFFICE_LAT = 26.73208;
const OFFICE_LNG = 68.071982;
const ALLOWED_RADIUS_METERS = 200;

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // in metres
}

export const checkIn = async (data: CheckInData): Promise<AttendanceRecord> => {
    const todayStr = new Date().toISOString().split('T')[0];
    let record = attendanceData.find(a => a.username === data.username && a.date === todayStr);

    if (record?.checkInTime) {
        throw new Error("You have already checked in today.");
    }

    const distance = calculateDistance(data.latitude, data.longitude, OFFICE_LAT, OFFICE_LNG);
    if (distance > ALLOWED_RADIUS_METERS) {
        throw new Error(`Check-in failed. You must be within ${ALLOWED_RADIUS_METERS} meters of the office. You are currently about ${Math.round(distance)} meters away.`);
    }

    const { address, uri } = await getAddressFromCoordinates(data.latitude, data.longitude);

    const newRecord: Partial<AttendanceRecord> = {
        checkInTime: new Date().toLocaleTimeString('en-US', { hour12: false }),
        checkInLat: data.latitude,
        checkInLng: data.longitude,
        checkInImage: data.image,
        checkInAddress: address,
        checkInUri: uri,
    };

    if (record) {
        Object.assign(record, newRecord);
    } else {
        record = {
            username: data.username,
            date: todayStr,
            ...newRecord,
        }
        attendanceData.push(record as AttendanceRecord);
    }
    
    // Auto checkout simulation logic
    setTimeout(() => {
        const currentRecord = attendanceData.find(a => a.username === data.username && a.date === todayStr);
        if (currentRecord && currentRecord.checkInTime && !currentRecord.checkOutTime) {
            currentRecord.checkOutTime = new Date(new Date().getTime() + 12 * 60 * 60 * 1000).toLocaleTimeString('en-US', { hour12: false });
            currentRecord.isAutoCheckout = true;
            console.log(`Auto-checked out user: ${data.username}`);
        }
    }, 12 * 60 * 60 * 1000); // 12 hours

    return delay(record as AttendanceRecord);
};

export const checkOut = async (data: CheckInData): Promise<AttendanceRecord> => {
    const todayStr = new Date().toISOString().split('T')[0];
    const record = attendanceData.find(a => a.username === data.username && a.date === todayStr);

    if (!record || !record.checkInTime) {
        throw new Error("You haven't checked in today.");
    }
    if (record.checkOutTime) {
        throw new Error("You have already checked out today.");
    }
    
    const { address, uri } = await getAddressFromCoordinates(data.latitude, data.longitude);

    record.checkOutTime = new Date().toLocaleTimeString('en-US', { hour12: false });
    record.checkOutLat = data.latitude;
    record.checkOutLng = data.longitude;
    record.checkOutImage = data.image;
    record.checkOutAddress = address;
    record.checkOutUri = uri;

    return delay(record);
};


// --- Admin ---
export const getAllEmployees = async (): Promise<User[]> => {
    return delay([...usersData]); // Return all users, including inactive
};

export const addNewEmployee = async (employee: Omit<User, 'status'>): Promise<User> => {
    if (usersData.some(u => u.username === employee.username)) {
        throw new Error('Username already exists');
    }
    const newUser: User = {
        ...employee,
        status: 'active',
    };
    usersData.push(newUser);
    return delay(newUser);
};

export const updateEmployee = async (employee: User): Promise<User> => {
    const index = usersData.findIndex(u => u.username === employee.username);
    if (index === -1) {
        throw new Error('User not found');
    }
    // If a new password is provided (and not empty), log it for this mock API
    if (employee.password) {
        console.log(`Password for ${employee.username} updated to ${employee.password}. (Mock API)`);
    }
    // Don't save the password field to the mock data store.
    const { password, ...rest } = employee;
    usersData[index] = { ...usersData[index], ...rest };
    return delay(usersData[index]);
};

export const deleteEmployee = async (username: string): Promise<{ success: boolean }> => {
    const user = usersData.find(u => u.username === username);
    if (user) {
        user.status = 'inactive';
        return delay({ success: true });
    }
    throw new Error('User not found');
};

export const resetPassword = async (username: string, newPass: string): Promise<{ success: boolean }> => {
    console.log(`Password for ${username} reset to ${newPass}. (Mock API)`);
    return delay({ success: true });
};

export const getAdminDashboardStats = async () => {
  const today = new Date().toISOString().split('T')[0];
  const presentUsernames = new Set(attendanceData.filter(a => a.date === today).map(a => a.username));
  const activeUsers = usersData.filter(u => u.status === 'active');
  const onLeaveUsernames = new Set(leaveRequestsData.filter(l => l.status === 'approved' && today >= l.fromDate && today <= l.toDate).map(l => l.username));

  return delay({
    totalEmployees: activeUsers.length,
    presentToday: presentUsernames.size,
    absentToday: activeUsers.length - presentUsernames.size - onLeaveUsernames.size,
    onLeaveToday: onLeaveUsernames.size,
  });
};

export const getAllDepartments = async (): Promise<Department[]> => {
    return delay([...departmentsData]);
};

export const addDepartment = async (dept: Omit<Department, 'deptId' | 'createdDate'>): Promise<Department> => {
    const newDept: Department = {
        ...dept,
        deptId: `DEPT${Date.now()}`,
        createdDate: new Date().toISOString(),
    };
    departmentsData.push(newDept);
    return delay(newDept);
};

export const updateDepartment = async (dept: Department): Promise<Department> => {
    const index = departmentsData.findIndex(d => d.deptId === dept.deptId);
    if (index === -1) throw new Error('Department not found');
    departmentsData[index] = dept;
    return delay(dept);
};

export const deleteDepartment = async (deptId: string): Promise<{ success: boolean }> => {
    const initialLength = departmentsData.length;
    const filteredData = departmentsData.filter(d => d.deptId !== deptId);
    departmentsData.length = 0;
    Array.prototype.push.apply(departmentsData, filteredData);
    if (departmentsData.length === initialLength) throw new Error('Department not found');
    return delay({ success: true });
};

export const getAllManagers = async (): Promise<User[]> => {
    // Admin can assign any active employee or manager as a department manager.
    return delay(usersData.filter(u => (u.role === 'manager' || u.role === 'employee') && u.status === 'active'));
};


export const getAllPendingLeaveRequests = async (): Promise<LeaveRequest[]> => {
    const pending = leaveRequestsData.filter(l => l.status === 'pending');
    const enriched = pending.map(p => {
        const user = usersData.find(u => u.username === p.username);
        return { ...p, fullName: user?.fullName || p.username };
    });
    return delay(enriched);
};

export const getAllLeaveRequests = async (): Promise<LeaveRequest[]> => {
    const enriched = leaveRequestsData.map(p => {
        const user = usersData.find(u => u.username === p.username);
        return { ...p, fullName: user?.fullName || p.username };
    });
    return delay(enriched);
};

export const approveLeaveByAdmin = async (leaveId: string): Promise<{success: boolean}> => {
    const request = leaveRequestsData.find(l => l.leaveId === leaveId);
    if(request) {
        request.status = 'approved';
        request.processedBy = 'admin';
        request.processedDate = new Date().toISOString();
        return delay({success: true});
    }
    throw new Error("Leave request not found");
};

export const rejectLeaveByAdmin = async (leaveId: string): Promise<{success: boolean}> => {
    const request = leaveRequestsData.find(l => l.leaveId === leaveId);
    if(request) {
        request.status = 'rejected';
        request.processedBy = 'admin';
        request.processedDate = new Date().toISOString();
        return delay({success: true});
    }
    throw new Error("Leave request not found");
};

// --- Manager ---
export const getDepartmentEmployees = async (managerUsername: string): Promise<any[]> => {
    const manager = usersData.find(u => u.username === managerUsername);
    if (!manager) return delay([]);
    const today = new Date().toISOString().split('T')[0];
    
    const employees = usersData
        .filter(u => u.department === manager.department && u.status === 'active')
        .map(emp => {
            const attendance = attendanceData.find(a => a.username === emp.username && a.date === today);
            let status = 'notchecked';
            if (attendance?.checkInTime && !attendance.checkOutTime) status = 'checkedin';
            if (attendance?.checkOutTime) status = 'checkedout';

            return {
                username: emp.username,
                name: emp.fullName,
                position: emp.position,
                status: status,
                lastActivity: attendance?.checkOutTime || attendance?.checkInTime || 'N/A',
                checkInAddress: attendance?.checkInAddress,
                checkInUri: attendance?.checkInUri,
                checkOutAddress: attendance?.checkOutAddress,
                checkOutUri: attendance?.checkOutUri
            };
        });

    return delay(employees);
};

export const getPendingLeaveRequestsForManager = async (managerUsername: string): Promise<LeaveRequest[]> => {
    const manager = usersData.find(u => u.username === managerUsername);
    if (!manager) return delay([]);
    
    const departmentEmployees = usersData.filter(u => u.department === manager.department).map(u => u.username);
    
    const requests = leaveRequestsData.filter(l => 
        l.status === 'pending' && departmentEmployees.includes(l.username)
    );
    
    return delay(requests);
};

export const approveLeaveByManager = async (leaveId: string, managerUsername: string): Promise<{success: boolean}> => {
    const request = leaveRequestsData.find(l => l.leaveId === leaveId);
    if(request) {
        request.status = 'approved';
        request.processedBy = managerUsername;
        request.processedDate = new Date().toISOString();
        return delay({success: true});
    }
    throw new Error("Leave request not found");
};

export const rejectLeaveByManager = async (leaveId: string, managerUsername: string): Promise<{success: boolean}> => {
    const request = leaveRequestsData.find(l => l.leaveId === leaveId);
    if(request) {
        request.status = 'rejected';
        request.processedBy = managerUsername;
        request.processedDate = new Date().toISOString();
        return delay({success: true});
    }
    throw new Error("Leave request not found");
};