/**
 * Core state logic and lifecycle handlers for React Error Boundaries.
 * Separated to enable unit testing and headless validation without DOM dependency.
 */

export const initialErrorBoundaryState = {
  hasError: false,
  error: null
};

/**
 * Handles getDerivedStateFromError lifecycle transition.
 * @param {Error} error - The caught runtime exception
 * @returns {Object} Updated boundary state
 */
export function getDerivedStateFromErrorLogic(error) {
  return {
    hasError: true,
    error: error || new Error('Unknown Error')
  };
}

/**
 * Resets error boundary state back to healthy state.
 * @returns {Object} Clean boundary state
 */
export function resetErrorBoundaryLogic() {
  return {
    hasError: false,
    error: null
  };
}
