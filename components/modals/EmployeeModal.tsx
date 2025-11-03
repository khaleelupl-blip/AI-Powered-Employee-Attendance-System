import React, { useState, useEffect } from 'react';
import type { User, Department, UserRole } from '../../types';
import Button from '../shared/Button';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: User) => void;
  employee: User | null;
  departments: Department[];
  restrictedDepartment?: string;
  allowedRoles?: UserRole[];
}

const ALL_ROLES: UserRole[] = ['employee', 'manager', 'admin'];

const EmployeeModal: React.FC<EmployeeModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  employee, 
  departments, 
  restrictedDepartment, 
  allowedRoles = ALL_ROLES 
}) => {
  const [formData, setFormData] = useState<User>({
    username: '', fullName: '', department: '', position: '', role: 'employee', status: 'active', password: ''
  });

  useEffect(() => {
    if (employee) {
      setFormData({ ...employee, password: '' }); // Don't show password on edit
    } else {
      // Reset form for new employee, respecting restrictions
      setFormData({ 
        username: '', 
        fullName: '', 
        department: restrictedDepartment || departments[0]?.deptName || '', 
        position: '', 
        role: allowedRoles.includes('employee') ? 'employee' : allowedRoles[0], 
        status: 'active', 
        password: '' 
      });
    }
  }, [employee, departments, isOpen, restrictedDepartment, allowedRoles]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {employee ? 'Edit Employee' : 'Add New Employee'}
          </h2>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} required disabled={!!employee} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm disabled:bg-gray-200 dark:disabled:bg-gray-600" />
          </div>
          
          {!employee ? (
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Initial Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required={!employee} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm" />
             </div>
          ) : (
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Change Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm" placeholder="Leave blank to keep current" />
             </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
              <select 
                name="department" 
                value={formData.department} 
                onChange={handleChange} 
                required 
                disabled={!!restrictedDepartment}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm disabled:bg-gray-200 dark:disabled:bg-gray-600"
              >
                {departments.map(d => <option key={d.deptId} value={d.deptName}>{d.deptName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Position</label>
              <input type="text" name="position" value={formData.position} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm" />
            </div>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
              <select name="role" value={formData.role} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm">
                {allowedRoles.map(role => (
                    <option key={role} value={role} className="capitalize">{role}</option>
                ))}
              </select>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
        <div className="p-6 bg-gray-50 dark:bg-gray-700/50 flex justify-end space-x-4 rounded-b-lg">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Employee</Button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeModal;