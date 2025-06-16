/**
 * Utility to completely clear all authentication data
 * Useful for debugging auth issues or when users get stuck in invalid auth states
 */
export function clearAllAuthData() {
  if (typeof window === 'undefined') return;

  // Clear all cookies (works for current domain)
  document.cookie.split(";").forEach((c) => {
    const eqPos = c.indexOf("=");
    const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
    if (name.startsWith('sb-')) {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
      document.cookie = `${name}=; path=/; domain=.localhost; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    }
  });

  // Clear localStorage
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('sb-') || key.includes('supabase')) {
      localStorage.removeItem(key);
    }
  });

  // Clear sessionStorage
  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith('sb-') || key.includes('supabase')) {
      sessionStorage.removeItem(key);
    }
  });

  console.log('All authentication data cleared');
}

/**
 * Debug function to show current auth storage state
 */
export function debugAuthStorage() {
  if (typeof window === 'undefined') {
    console.log('Not in browser environment');
    return;
  }

  console.log('=== Auth Storage Debug ===');
  
  // Check cookies
  const authCookies = document.cookie.split(';')
    .filter(cookie => cookie.trim().startsWith('sb-'))
    .map(cookie => cookie.trim());
  console.log('Auth Cookies:', authCookies.length > 0 ? authCookies : 'None');

  // Check localStorage
  const authLocalStorage = Object.keys(localStorage)
    .filter(key => key.startsWith('sb-') || key.includes('supabase'))
    .map(key => ({ key, value: localStorage.getItem(key) }));
  console.log('Auth LocalStorage:', authLocalStorage.length > 0 ? authLocalStorage : 'None');

  // Check sessionStorage
  const authSessionStorage = Object.keys(sessionStorage)
    .filter(key => key.startsWith('sb-') || key.includes('supabase'))
    .map(key => ({ key, value: sessionStorage.getItem(key) }));
  console.log('Auth SessionStorage:', authSessionStorage.length > 0 ? authSessionStorage : 'None');
  
  console.log('=== End Debug ===');
} 