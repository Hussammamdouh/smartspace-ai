// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  TIMEOUT: 10000,
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'SmartSpace',
  VERSION: '1.0.0',
  DESCRIPTION: 'AI-Powered Interior Design Platform',
};

// Design Configuration
export const DESIGN_CONFIG = {
  ROOM_TYPES: [
    'Living Room',
    'Bedroom',
    'Kitchen',
    'Bathroom',
    'Dining Room',
    'Office',
    'Study',
    'Garden',
  ],
  STYLES: [
    'Modern',
    'Minimalist',
    'Scandinavian',
    'Industrial',
    'Bohemian',
    'Traditional',
    'Contemporary',
    'Art Deco',
    'Rustic',
    'Coastal',
  ],
};

// Pagination Configuration
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'user',
  CART_DATA: 'cart',
  SETTINGS: 'settings',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred. Please check your connection.',
  AUTH_ERROR: 'Authentication failed. Please login again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  REGISTER_SUCCESS: 'Registration successful!',
  PROFILE_UPDATE: 'Profile updated successfully!',
  CART_ADD: 'Item added to cart!',
  CART_REMOVE: 'Item removed from cart!',
  DESIGN_GENERATED: 'Design generated successfully!',
  MESSAGE_SENT: 'Message sent successfully!',
}; 