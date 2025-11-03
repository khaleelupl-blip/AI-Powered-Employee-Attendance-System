import React from 'react';
import type { Department } from '../../types';
import Button from '../shared/Button';

interface DepartmentListProps {
    departments: Department[];
    onEdit: (department: Department) => void;
}

const DepartmentList: React.FC<DepartmentListProps> = ({ departments, onEdit }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {departments.map(dept => (
                        <tr key={dept.deptId}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{dept.deptName}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{dept.description}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{dept.manager || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Button size="sm" variant="secondary" onClick={() => onEdit(dept)}>Edit</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DepartmentList;
