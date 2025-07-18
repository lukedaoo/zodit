import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Task } from '../types';

interface TaskModalProps {
    task: Task;
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Task) => void;
    onDelete?: () => void;
}

export const TaskModal = ({ task, isOpen, onClose, onSave, onDelete }: TaskModalProps) => {
    const [formData, setFormData] = useState<Task>(task);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                handleClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(() => {
            onClose();
        }, 200);
    };

    const handleSave = () => {
        onSave(formData);
        handleClose();
    };

    const handleInputChange = (field: keyof Task, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${isAnimating ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0'
                }`}
            onClick={handleClose}
        >
            <div
                className={`card w-full max-w-2xl transform transition-all duration-200 ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                    } shadow-2xl`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Card Header */}
                <div className="card-header">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${formData.completed ? 'bg-green-500' : 'bg-gray-300'
                                }`} />
                            <div>
                                <h3 className="card-title">
                                    {formData.title || 'New Task'}
                                </h3>
                                <p className="card-description">
                                    Edit task details and schedule
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:text-red-500 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Card Content */}
                <div className="card-content space-y-6">
                    {/* Task Status Badge */}
                    <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                            <span className={`badge ${formData.completed ? 'badge-success' : 'badge-primary'}`}>
                                {formData.completed ? 'Completed' : 'In Progress'}
                            </span>
                            {formData.startDate && (
                                <span className="badge badge-outline">
                                    {new Date(formData.startDate).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => handleInputChange('completed', !formData.completed)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.completed ? 'bg-green-500' : 'bg-gray-300'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.completed ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Task Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-primary">Task Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            className="input w-full"
                            placeholder="Enter task title..."
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-primary">Description</label>
                        <textarea
                            value={formData.description || ''}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            className="input min-h-[100px] resize-none"
                            placeholder="Add a description..."
                        />
                    </div>

                    {/* Date and Time Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-primary">Start Date</label>
                            <input
                                type="date"
                                value={formData.startDate || ''}
                                onChange={(e) => handleInputChange('startDate', e.target.value)}
                                className="input w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-primary">End Date</label>
                            <input
                                type="date"
                                value={formData.endDate || ''}
                                onChange={(e) => handleInputChange('endDate', e.target.value)}
                                className="input w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-primary">Start Time</label>
                            <input
                                type="time"
                                value={formData.startTime || ''}
                                onChange={(e) => handleInputChange('startTime', e.target.value)}
                                className="input w-full"
                            />
                        </div>
                    </div>

                    {/* Task Summary Card */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <h4 className="font-semibold text-gray-800">Task Summary</h4>
                        <div className="text-sm text-gray-600">
                            <p><strong>Duration:</strong> {
                                formData.startDate && formData.endDate
                                    ? `${formData.startDate} to ${formData.endDate}`
                                    : 'No dates set'
                            }</p>
                            <p><strong>Time:</strong> {formData.startTime || 'No time set'}</p>
                            <p><strong>Status:</strong> {formData.completed ? 'Completed' : 'Pending'}</p>
                        </div>
                    </div>
                </div>

                {/* Card Footer */}
                <div className="card-footer">
                    <div className="flex items-center justify-between w-full">
                        <div>
                            {onDelete && (
                                <button
                                    onClick={() => {
                                        onDelete();
                                        handleClose();
                                    }}
                                    className="btn btn-destructive btn-md"
                                >
                                    Delete Task
                                </button>
                            )}
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={handleClose}
                                className="btn btn-outline btn-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="btn btn-primary btn-md"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
