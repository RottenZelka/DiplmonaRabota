export const MAX_FILE_SIZE = parseInt(process.env.REACT_APP_MAX_FILE_SIZE || '5242880', 10); // 5MB default
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

// SQL Injection prevention patterns
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/i,
  /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,
  /(\b(OR|AND)\b\s+['"]\w+['"]\s*=\s*['"]\w+['"])/i,
  /(--|\b(WAITFOR|DELAY)\b)/i,
  /(\b(EXEC|EXECUTE|DECLARE)\b)/i
];

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: 'File size exceeds 5MB limit' };
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { isValid: false, error: 'Invalid file type. Allowed types: JPEG, PNG, PDF' };
  }

  return { isValid: true };
};

export const validateSQLInjection = (value: string): boolean => {
  return !SQL_INJECTION_PATTERNS.some(pattern => pattern.test(value));
};

export const validateForm = (values: Record<string, any>, rules: Record<string, (value: any) => boolean>): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  Object.entries(rules).forEach(([field, validator]) => {
    if (!validator(values[field])) {
      errors[field] = `Invalid ${field}`;
    }
  });

  return errors;
};

// Validation messages for better user feedback
export const validationMessages = {
  email: 'Please enter a valid email address',
  password: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character',
  required: 'This field is required',
  url: 'Please enter a valid URL',
  number: 'Please enter a valid number',
  date: 'Please enter a valid date (YYYY-MM-DD)',
  name: 'Please enter a valid name (2-50 characters)',
  file: {
    size: `File size must be less than ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB`,
    type: 'File must be JPEG, PNG, or PDF',
    required: 'Please select a file'
  }
}; 