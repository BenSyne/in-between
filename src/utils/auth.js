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
      throw new Error('Failed to refresh token');
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    window.location.href = '/login';
    return false;
  }
};