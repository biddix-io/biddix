'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Card title="Something went wrong" className="border-red-200 bg-red-50">
          <p className="text-red-700 mb-4">
            We encountered an unexpected error. Please try refreshing the page.
          </p>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </Card>
      );
    }

    return this.children;
  }
}
