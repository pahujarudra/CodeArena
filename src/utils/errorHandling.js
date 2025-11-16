/**
 * Formats Firebase Auth error messages to be more user-friendly
 * @param {Error} error - The Firebase error object
 * @returns {string} - User-friendly error message
 */
export const formatAuthError = (error) => {
  const errorCode = error?.code;
  
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please try logging in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled. Please contact support.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please sign up first.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    default:
      return error?.message || 'An unexpected error occurred. Please try again.';
  }
};

/**
 * Formats Firestore error messages to be more user-friendly
 * @param {Error} error - The Firestore error object
 * @returns {string} - User-friendly error message
 */
export const formatFirestoreError = (error) => {
  const errorCode = error?.code;
  
  switch (errorCode) {
    case 'permission-denied':
      return 'You do not have permission to perform this action.';
    case 'unavailable':
      return 'Service is temporarily unavailable. Please try again later.';
    case 'not-found':
      return 'The requested data was not found.';
    case 'already-exists':
      return 'This data already exists.';
    case 'failed-precondition':
      return 'Operation failed. Please refresh and try again.';
    default:
      return error?.message || 'An unexpected error occurred. Please try again.';
  }
};
