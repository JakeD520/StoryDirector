import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    if (this.props.onError) this.props.onError(error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-900 text-red-200 rounded">
          <h2>Something went wrong.</h2>
          <pre>{this.state.error?.toString()}</pre>
          {this.props.fallback}
        </div>
      );
    }
    return this.props.children;
  }
}
