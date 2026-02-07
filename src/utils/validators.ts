/**
 * Input validation utilities
 */

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2;
};

export const validateWeight = (weight: number): boolean => {
  return weight > 0 && weight <= 500;
};

export const validateHeight = (height: number): boolean => {
  return height > 0 && height <= 300;
};

export const validateReps = (reps: number): boolean => {
  return Number.isInteger(reps) && reps > 0 && reps <= 100;
};

export const validateWeightValue = (weight: number): boolean => {
  return weight >= 0 && weight <= 1000;
};
