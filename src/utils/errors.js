export function isNetworkError(e) {
  return e instanceof TypeError || e?.name === 'TypeError';
}

export function getGenericErrorMessage() {
  return 'Something went wrong. Please try again.';
}

export function getNetworkErrorMessage() {
  return 'Network error. Check your connection and try again.';
}

export function getDatamuseErrorMessage(status) {
  switch (status) {
    case 400:
      return 'Invalid request. Try a different word.';
    case 408:
      return 'Request timed out. Try again.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'Service is unavailable right now. Please try again later.';
    default:
      return `Unexpected error (Status: ${status}). Please try again.`;
  }
}

export function getDictionaryErrorMessage(status, word) {
  switch (status) {
    case 400:
      return 'Invalid request. Try a different word.';
    case 404:
      return `Word "${word}" was not found. Try another spelling.`;
    case 408:
      return 'Request timed out. Try again.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'Dictionary service is unavailable. Please try again later.';
    default:
      return `Unexpected error (Status: ${status}). Please try again.`;
  }
}

export function getJsonServerErrorMessage(status) {
  switch (status) {
    case 400:
      return 'Invalid request. Please try again.';
    case 404:
      return 'Resource not found.';
    case 408:
      return 'Request timed out. Try again.';
    case 429:
      return 'Too many requests. Please wait and try again.';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'Server is unavailable. Please try again later.';
    default:
      return `Unexpected error (Status: ${status}). Please try again.`;
  }
}
