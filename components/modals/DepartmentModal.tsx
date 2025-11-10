import React, { useState, useEffect } from 'react';
import type { Department, User } from '../../types';
import Button from '../shared/Button';

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (department: Department) => void;
  department: Department | null;
  managers: User[];
}

const DepartmentModal: React.FC<DepartmentModalProps> = ({ isOpen, onClose, onSave, department, managers }) => {
  const [formData, setFormData] = useState<Department>({
    deptId: '', deptName: '', description: '', manager: '', createdDate: ''
  });

  useEffect(() => {
    if (department) {
      setFormData(department);
    } else {
      setFormData({ deptId: '', deptName: '', description: '', manager: '', createdDate: '' });
    }
  }, [department, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
            {department ? 'Edit Department' : 'Add New Department'}
          </h2>
        </div>
        <div className="p-6 space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department Name</label>
                <input type="text" name="deptName" value={formData.deptName} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm"/>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm"/>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Manager</label>
                <select name="manager" value={formData.manager} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm">
                    <option value="">-- No Manager --</option>
                    {managers.map(m => <option key={m.username} value={m.username}>{m.fullName}</option>)}
                </select>
            </div>
        </div>
        <div className="p-6 bg-gray-50 dark:bg-gray-700/50 flex justify-end space-x-4 rounded-b-lg">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Department</Button>
        </div>
      </form>
    </div>
  );
};

export default DepartmentModal;