import React, { useState, useEffect } from 'react';
import Button from '../shared/Button';
import type { LeaveRequest } from '../../types';

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (requestData: Omit<LeaveRequest, 'leaveId' | 'status' | 'appliedDate' | 'username'>) => Promise<void>;
}

const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [leaveType, setLeaveType] = useState('sick');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form on open
      const today = new Date().toISOString().split('T')[0];
      setLeaveType('sick');
      setFromDate(today);
      setToDate(today);
      setReason('');
      setError('');
      setSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate || !reason) {
        setError('All fields are required.');
        return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
        setError('"From Date" cannot be after "To Date".');
        return;
    }
    setError('');
    setSubmitting(true);
    try {
        await onSubmit({ leaveType, fromDate, toDate, reason });
    } catch (err) {
        setError((err as Error).message || 'Failed to submit request.');
    } finally {
        setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Apply for Leave
          </h2>
        </div>
        <div className="p-6 space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Leave Type</label>
                <select value={leaveType} onChange={e => setLeaveType(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm">
                    <option value="sick">Sick Leave</option>
                    <option value="annual">Annual Leave</option>
                    <option value="unpaid">Unpaid Leave</option>
                </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">From Date</label>
                    <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">To Date</label>
                    <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm"/>
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason</label>
                <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm"/>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <div className="p-6 bg-gray-50 dark:bg-gray-700/50 flex justify-end space-x-4 rounded-b-lg">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button type="submit" isLoading={submitting}>Submit Request</Button>
        </div>
      </form>
    </div>
  );
};

export default LeaveRequestModal;