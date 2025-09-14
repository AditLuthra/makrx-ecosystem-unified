/**
 * Form Validation Library
 * Provides comprehensive input validation for all forms
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  email?: boolean;
  url?: boolean;
  min?: number;
  max?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export class FormValidator {
  private rules: Record<string, ValidationRule> = {};

  constructor(rules: Record<string, ValidationRule> = {}) {
    this.rules = rules;
  }

  addRule(field: string, rule: ValidationRule): FormValidator {
    this.rules[field] = rule;
    return this;
  }

  validate(data: Record<string, any>): ValidationResult {
    const errors: Record<string, string> = {};

    for (const [field, rule] of Object.entries(this.rules)) {
      const value = data[field];
      const error = this.validateField(value, rule, field);
      if (error) {
        errors[field] = error;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  validateField(value: any, rule: ValidationRule, fieldName: string): string | null {
    // Required validation
    if (rule.required && (value === undefined || value === null || value === '')) {
      return `${fieldName} is required`;
    }

    // Skip other validations if value is empty and not required
    if (!rule.required && (value === undefined || value === null || value === '')) {
      return null;
    }

    // String validations
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return `${fieldName} must be at least ${rule.minLength} characters`;
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        return `${fieldName} must be no more than ${rule.maxLength} characters`;
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        return `${fieldName} format is invalid`;
      }
      if (rule.email && !isValidEmail(value)) {
        return `${fieldName} must be a valid email address`;
      }
      if (rule.url && !isValidURL(value)) {
        return `${fieldName} must be a valid URL`;
      }
    }

    // Number validations
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        return `${fieldName} must be at least ${rule.min}`;
      }
      if (rule.max !== undefined && value > rule.max) {
        return `${fieldName} must be no more than ${rule.max}`;
      }
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        return customError;
      }
    }

    return null;
  }
}

// Utility validation functions
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const isStrongPassword = (password: string): boolean => {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
};

// Pre-defined validation sets
export const commonValidations = {
  email: {
    required: true,
    email: true,
    maxLength: 254,
  },
  password: {
    required: true,
    minLength: 8,
    custom: (value: string) => 
      isStrongPassword(value) ? null : 'Password must contain at least 8 characters with uppercase, lowercase, number and special character',
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/,
  },
  phone: {
    required: false,
    custom: (value: string) => 
      !value || isValidPhone(value) ? null : 'Please enter a valid phone number',
  },
  url: {
    required: false,
    url: true,
  },
  description: {
    maxLength: 1000,
  },
  price: {
    required: true,
    min: 0,
    max: 999999.99,
  },
  quantity: {
    required: true,
    min: 0,
    max: 999999,
  },
};

// Equipment-specific validations
export const equipmentValidations = {
  name: { ...commonValidations.name, required: true },
  equipment_id: {
    required: true,
    minLength: 3,
    maxLength: 50,
    pattern: /^[A-Z0-9\-_]+$/,
  },
  category: { required: true },
  location: { required: true, minLength: 2, maxLength: 100 },
  hourly_rate: { ...commonValidations.price, required: false },
  manufacturer: { maxLength: 100 },
  model: { maxLength: 100 },
  description: commonValidations.description,
};

// Inventory-specific validations
export const inventoryValidations = {
  name: { ...commonValidations.name, required: true },
  category: { required: true },
  quantity: { ...commonValidations.quantity, required: true },
  unit: { required: true, maxLength: 20 },
  min_threshold: { min: 0, max: 999999 },
  location: { required: true, minLength: 2, maxLength: 100 },
  price: { ...commonValidations.price, required: false },
  supplier: { maxLength: 200 },
  product_code: { maxLength: 100 },
  description: commonValidations.description,
};

// Project-specific validations
export const projectValidations = {
  name: { ...commonValidations.name, required: true },
  description: { required: true, minLength: 10, maxLength: 2000 },
  deadline: {
    required: false,
    custom: (value: string) => {
      if (!value) return null;
      const date = new Date(value);
      const now = new Date();
      return date > now ? null : 'Deadline must be in the future';
    },
  },
  budget: { min: 0, max: 999999.99 },
};

// React hook for form validation
export const useFormValidation = (validationRules: Record<string, ValidationRule>) => {
  const validator = new FormValidator(validationRules);

  const validateForm = (data: Record<string, any>): ValidationResult => {
    return validator.validate(data);
  };

  const validateField = (field: string, value: any): string | null => {
    const rule = validationRules[field];
    if (!rule) return null;
    return validator.validateField(value, rule, field);
  };

  return { validateForm, validateField };
};

export default FormValidator;