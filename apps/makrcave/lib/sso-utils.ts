/**
 * SSO utility functions for MakrCave frontend
 */

// Type definitions for SSO utilities
interface SSOConfig {
  url: string;
  realm: string;
  clientId: string;
}

interface SSOOptions {
  redirectUri?: string;
  [key: string]: any;
}

/**
 * Redirect to SSO login
 */
export function redirectToSSO(config: SSOConfig, options: SSOOptions = {}) {
  try {
    const { url, realm, clientId } = config;
    const { redirectUri = window.location.origin + '/auth/callback', ...otherOptions } = options;

    const keycloakUrl = new URL(`${url}/realms/${realm}/protocol/openid-connect/auth`);
    keycloakUrl.searchParams.set('client_id', clientId);
    keycloakUrl.searchParams.set('redirect_uri', redirectUri);
    keycloakUrl.searchParams.set('response_type', 'code');
    keycloakUrl.searchParams.set('scope', 'openid profile email');

    // Add any additional options as query parameters
    Object.entries(otherOptions).forEach(([key, value]) => {
      if (value !== undefined) {
        keycloakUrl.searchParams.set(key, String(value));
      }
    });

    window.location.href = keycloakUrl.toString();
  } catch (error) {
    console.error('Error redirecting to SSO:', error);
  }
}

/**
 * Logout from SSO
 */
export function logoutFromSSO(config: SSOConfig, options: SSOOptions = {}) {
  try {
    const { url, realm, clientId } = config;
    const { redirectUri = window.location.origin, ...otherOptions } = options;

    const logoutUrl = new URL(`${url}/realms/${realm}/protocol/openid-connect/logout`);
    logoutUrl.searchParams.set('client_id', clientId);
    logoutUrl.searchParams.set('post_logout_redirect_uri', redirectUri);

    // Add any additional options as query parameters
    Object.entries(otherOptions).forEach(([key, value]) => {
      if (value !== undefined) {
        logoutUrl.searchParams.set(key, String(value));
      }
    });

    window.location.href = logoutUrl.toString();
  } catch (error) {
    console.error('Error logging out from SSO:', error);
  }
}

/**
 * Initialize SSO session check
 */
export function initSSOSessionCheck(
  config: SSOConfig,
  callback?: (authenticated: boolean) => void,
) {
  try {
    // Check if user has an active SSO session
    const checkUrl = new URL(`${config.url}/realms/${config.realm}/protocol/openid-connect/auth`);
    checkUrl.searchParams.set('client_id', config.clientId);
    checkUrl.searchParams.set('response_type', 'code');
    checkUrl.searchParams.set('scope', 'openid');
    checkUrl.searchParams.set('prompt', 'none');
    checkUrl.searchParams.set('redirect_uri', window.location.origin + '/silent-check-sso.html');

    // Create hidden iframe for silent check
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = checkUrl.toString();

    const messageHandler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      window.removeEventListener('message', messageHandler);
      document.body.removeChild(iframe);

      const authenticated = event.data?.authenticated || false;
      callback?.(authenticated);
    };

    window.addEventListener('message', messageHandler);
    document.body.appendChild(iframe);

    // Cleanup after timeout
    setTimeout(() => {
      try {
        window.removeEventListener('message', messageHandler);
        if (iframe.parentNode) {
          document.body.removeChild(iframe);
        }
        callback?.(false);
      } catch (error) {
        console.warn('SSO session check cleanup error:', error);
      }
    }, 5000);
  } catch (error) {
    console.error('Error checking SSO session:', error);
    callback?.(false);
  }
}

export default {
  redirectToSSO,
  logoutFromSSO,
  initSSOSessionCheck,
};
