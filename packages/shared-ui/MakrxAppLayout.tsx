import { ReactKeycloakProvider } from '@react-keycloak/web';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import ErrorBoundary from './src/components/ErrorBoundary';

// TODO: Replace with your actual theme and error boundary implementations
const theme = {};

export interface MakrxAppLayoutProps {
  keycloakConfig: any;
  children: React.ReactNode;
}

export const MakrxAppLayout: React.FC<MakrxAppLayoutProps> = ({ keycloakConfig, children }) => (
  <ReactKeycloakProvider authClient={keycloakConfig}>
    <ThemeProvider theme={theme}>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </ThemeProvider>
  </ReactKeycloakProvider>
);

export default MakrxAppLayout;
