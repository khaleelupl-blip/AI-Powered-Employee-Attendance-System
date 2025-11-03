import React from 'react';
import type { LeaveRequest } from '../../types';
import Button from '../shared/Button';

interface LeaveListProps {
    leaves: LeaveRequest[];
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
}

const LeaveList: React.FC<LeaveListProps> = ({ leaves, onApprove, onReject }) => (
    <div className="space-y-3 max-h-96 overflow-y-auto">
        {leaves.map(l => (
            <div key={l.leaveId} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg flex justify-between items-center">
                <div>
                    <p className="font-semibold text-gray-800 dark:text-white">{l.fullName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="capitalize">{l.leaveType}</span>: {l.fromDate} to {l.toDate}
                    </p>
                </div>
                <div className="space-x-2">
                    <Button variant="success" size="sm" onClick={() => onApprove(l.leaveId)}>Approve</Button>
                    <Button variant="danger" size="sm" onClick={() => onReject(l.leaveId)}>Reject</Button>
                </div>
            </div>
        ))}
        {leaves.length === 0 && <p className="text-gray-500 text-center py-4">No pending requests.</p>}
    </div>
);

export default LeaveList;
