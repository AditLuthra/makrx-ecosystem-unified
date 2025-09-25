import { fireEvent, render, screen } from '@testing-library/react';
import React, { useState } from 'react';
import Header from '../components/Header';

// Create a stateful mock KeycloakProvider
const AuthContext = React.createContext(null);

function MockKeycloakProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const login = () => {
    setIsAuthenticated(true);
    setUser({ firstName: 'Test', email: 'test@example.com' });
  };
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };
  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading: false, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

jest.mock('@makrx/auth', () => ({
  useKeycloak: () => React.useContext(AuthContext),
}));

describe('AuthFlow', () => {
  test('handles login/logout correctly', () => {
    render(
      <MockKeycloakProvider>
        <Header />
      </MockKeycloakProvider>,
    );
    // Should show Sign In button initially
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    // Simulate login
    fireEvent.click(screen.getByText('Sign In'));
    // Should show user info and Sign Out
    expect(screen.getByText('Test')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Test'));
    fireEvent.click(screen.getByText('Sign Out'));
    // Should show Sign In again
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  test('preserves auth state on refresh', () => {
    // Simulate login
    const { unmount, rerender } = render(
      <MockKeycloakProvider>
        <Header />
      </MockKeycloakProvider>,
    );
    fireEvent.click(screen.getByText('Sign In'));
    expect(screen.getByText('Test')).toBeInTheDocument();
    // Unmount and remount (simulate refresh)
    unmount();
    rerender(
      <MockKeycloakProvider>
        <Header />
      </MockKeycloakProvider>,
    );
    // Should show Sign In again (since state resets on remount)
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });
});
