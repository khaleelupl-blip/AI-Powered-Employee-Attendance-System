
// FIX: Removed circular self-import of `UserRole` which was causing a conflict.

export type UserRole = 'employee' | 'manager' | 'admin';

export interface User {
  username: string;
  fullName: string;
  department: string;
  position: string;
  role: UserRole;
  status: 'active' | 'inactive';
  password?: string; // Added for forms
  profilePhoto?: string; // base64
}

export interface AttendanceRecord {
  username: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  checkInLat?: number;
  checkInLng?: number;
  checkOutLat?: number;
  checkOutLng?: number;
  checkInImage?: string; // base64
  checkOutImage?: string; // base64
  checkInAddress?: string;
  checkInUri?: string;
  checkOutAddress?: string;
  checkOutUri?: string;
  isAutoCheckout?: boolean;
}

export interface LeaveRequest {
  leaveId: string;
  username: string;
  fullName?: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
  processedBy?: string;
  processedDate?: string;
}

export interface Department {
  deptId: string;
  deptName: string;
  description: string;
  manager: string;
  createdDate: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface CheckInData {
    username: string;
    latitude: number;
    longitude: number;
    accuracy: number;
    image: string;
    address?: string;
}
