import React from 'react';
import type { AttendanceRecord, LeaveRequest } from '../../types';
import Card from '../shared/Card';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

interface AnalyticsTabProps {
  attendanceRecords: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ attendanceRecords, leaveRequests }) => {
  // --- Process Attendance Data ---
  const attendanceTrendData = React.useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const presentUsernames = new Set(
        attendanceRecords
          .filter(r => r.date === date && r.checkInTime)
          .map(r => r.username)
      );
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        Present: presentUsernames.size,
      };
    });
  }, [attendanceRecords]);

  // --- Process Leave Data ---
  const leaveTypeData = React.useMemo(() => {
    const counts = leaveRequests.reduce((acc, req) => {
      acc[req.leaveType] = (acc[req.leaveType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [leaveRequests]);

  const leaveStatusData = React.useMemo(() => {
    const counts = leaveRequests.reduce((acc, req) => {
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return [
        { name: 'Approved', count: counts.approved || 0, fill: '#10B981' },
        { name: 'Rejected', count: counts.rejected || 0, fill: '#EF4444' },
        { name: 'Pending', count: counts.pending || 0, fill: '#F59E0B' },
    ]
  }, [leaveRequests]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Weekly Attendance Trend">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={attendanceTrendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Present" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      
      <div className="space-y-6">
        <Card title="Leave Requests by Type">
            <div className="h-60">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={leaveTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {leaveTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                     <Tooltip />
                     <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </Card>
         <Card title="Leave Requests by Status">
             <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={leaveStatusData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" allowDecimals={false} />
                        <YAxis type="category" dataKey="name" />
                        <Tooltip />
                        <Bar dataKey="count" />
                    </BarChart>
                </ResponsiveContainer>
             </div>
        </Card>
      </div>

    </div>
  );
};

export default AnalyticsTab;
