export const validation = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  password: (password: string): { isValid: boolean; message?: string } => {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one special character (!@#$%^&*)' };
    }
    return { isValid: true };
  },

  date: (date: string): { isValid: boolean; message?: string } => {
    const inputDate = new Date(date);
    const currentDate = new Date();
    
    if (isNaN(inputDate.getTime())) {
      return { isValid: false, message: 'Invalid date format' };
    }
    
    if (inputDate < currentDate) {
      return { isValid: false, message: 'Date must be in the future' };
    }
    
    return { isValid: true };
  },

  file: (file: File, options: { 
    maxSize?: number; 
    allowedTypes?: string[];
  } = {}): { isValid: boolean; message?: string } => {
    const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'] } = options;

    if (file.size > maxSize) {
      return { 
        isValid: false, 
        message: `File size must be less than ${maxSize / (1024 * 1024)}MB` 
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return { 
        isValid: false, 
        message: `File type must be one of: ${allowedTypes.join(', ')}` 
      };
    }

    return { isValid: true };
  },

  required: (value: any): { isValid: boolean; message?: string } => {
    if (value === null || value === undefined || value === '') {
      return { isValid: false, message: 'This field is required' };
    }
    return { isValid: true };
  },

  minLength: (value: string, min: number): { isValid: boolean; message?: string } => {
    if (value.length < min) {
      return { isValid: false, message: `Must be at least ${min} characters long` };
    }
    return { isValid: true };
  },

  maxLength: (value: string, max: number): { isValid: boolean; message?: string } => {
    if (value.length > max) {
      return { isValid: false, message: `Must be no more than ${max} characters long` };
    }
    return { isValid: true };
  }
}; 