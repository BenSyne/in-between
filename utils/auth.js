export const isAuthenticated = async () => {
  try {
    const response = await fetch('/api/auth/check', { credentials: 'include' });
    return response.ok;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

export const refreshToken = async () => {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (response.ok) {
      console.log('Token refreshed successfully');
      return true;
    } else {
      console.error('Failed to refresh token:', await response.text());
      return false;
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
};