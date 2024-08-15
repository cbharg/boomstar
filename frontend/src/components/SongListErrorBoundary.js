import React from 'react';
import ErrorBoundary from './ErrorBoundary';

class SongListErrorBoundary extends React.Component {
  render() {
    return (
      <ErrorBoundary
        fallback={
          <div className="song-list-error">
            <h3>Oops! There was an error loading the song list.</h3>
            <p>Please try refreshing the page or check your internet connection.</p>
            <button onClick={() => window.location.reload()}>Refresh Page</button>
          </div>
        }
      >
        {this.props.children}
      </ErrorBoundary>
    );
  }
}

export default SongListErrorBoundary; 
