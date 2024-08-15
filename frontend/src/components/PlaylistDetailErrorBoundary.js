import React from 'react';

class PlaylistDetailErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('PlaylistDetail Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>Oops! Something went wrong.</h2>
          <p>We're having trouble displaying this playlist. Please try again later or contact support if the problem persists.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PlaylistDetailErrorBoundary;