import { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { useFormValidation, equipmentValidations } from '../lib/validation';

interface Equipment {
  id?: string;
  equipment_id: string;
  name: string;
  type: string;
  status: 'available' | 'in_use' | 'maintenance' | 'broken';
  location: string;
  cost_per_hour?: number;
  description?: string;
  specifications?: Record<string, any>;
  maintenance_schedule?: string;
  safety_requirements?: string[];
  training_required?: boolean;
  categories?: string[];
  manufacturer?: string;
  model?: string;
  purchase_date?: string;
  warranty_info?: string;
}

interface AddEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (equipment: Equipment) => void;
  onSubmit?: (equipment: any) => void | Promise<void>;
  initialData?: any;
  editEquipment?: any;
}

export default function AddEquipmentModal({
  isOpen,
  onClose,
  onSave,
  onSubmit,
  initialData,
  editEquipment,
}: AddEquipmentModalProps) {
  const [formData, setFormData] = useState<Equipment>({
    equipment_id: '',
    name: '',
    type: '',
    status: 'available',
    location: '',
    cost_per_hour: 0,
    description: '',
    specifications: {},
    maintenance_schedule: '',
    safety_requirements: [],
    training_required: false,
    categories: [],
    manufacturer: '',
    model: '',
    purchase_date: '',
    warranty_info: '',
    ...initialData,
  });

  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { validateForm, validateField } = useFormValidation(equipmentValidations);

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    } else if (isOpen && editEquipment) {
      setFormData((prev) => ({ ...prev, ...(editEquipment as any) }));
    } else if (isOpen && !initialData) {
      // Reset form for new equipment
      setFormData({
        equipment_id: '',
        name: '',
        type: '',
        status: 'available',
        location: '',
        cost_per_hour: 0,
        description: '',
        specifications: {},
        maintenance_schedule: '',
        safety_requirements: [],
        training_required: false,
        categories: [],
        manufacturer: '',
        model: '',
        purchase_date: '',
        warranty_info: '',
      });
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    const validationResult = validateForm(formData);

    if (!validationResult.isValid) {
      setValidationErrors(validationResult.errors);
      return;
    }

    // Clear previous validation errors
    setValidationErrors({});
    setLoading(true);

    try {
      if (onSave) {
        await onSave(formData);
      } else if (onSubmit) {
        await onSubmit(formData as any);
      }
      onClose();
    } catch (error) {
      console.error('Error saving equipment:', error);
      // You could set form-level error here
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Equipment, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[field as string]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }

    // Optional: Real-time validation
    const fieldError = validateField(field as string, value);
    if (fieldError) {
      setValidationErrors((prev) => ({ ...prev, [field]: fieldError }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {initialData ? 'Edit Equipment' : 'Add New Equipment'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Equipment ID *
              </label>
              <input
                type="text"
                value={formData.equipment_id}
                onChange={(e) => handleInputChange('equipment_id', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  validationErrors.equipment_id
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                required
              />
              {validationErrors.equipment_id && (
                <div className="mt-1 flex items-center text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validationErrors.equipment_id}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Equipment Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  validationErrors.name
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                required
              />
              {validationErrors.name && (
                <div className="mt-1 flex items-center text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validationErrors.name}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  validationErrors.category
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                required
              >
                <option value="">Select Type</option>
                <option value="3d_printer">3D Printer</option>
                <option value="laser_cutter">Laser Cutter</option>
                <option value="cnc_machine">CNC Machine</option>
                <option value="electronics">Electronics</option>
                <option value="hand_tools">Hand Tools</option>
                <option value="power_tools">Power Tools</option>
                <option value="measurement">Measurement</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as Equipment['status'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="available">Available</option>
                <option value="in_use">In Use</option>
                <option value="maintenance">Maintenance</option>
                <option value="broken">Broken</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Equipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
