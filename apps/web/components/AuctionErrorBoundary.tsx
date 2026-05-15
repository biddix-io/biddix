'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AuctionErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // In production, this could be sent to a service like Sentry
    // console.error('Auction Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="luxury-card p-8 rounded-xl text-center max-w-2xl mx-auto my-10">
          <h2 className="text-2xl font-serif font-bold text-destructive mb-4">Connection Interrupted</h2>
          <p className="text-muted-foreground mb-6">
            We encountered a problem while updating the auction live feed.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          >
            Reconnect
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
