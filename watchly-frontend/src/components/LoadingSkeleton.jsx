const LoadingSkeleton = ({ type }) => {
  if (type === 'movie-card') {
    return (
      <div className="skeleton-movie-card">
        <div className="skeleton-poster"></div>
        <div className="skeleton-details">
          <div className="skeleton-title"></div>
          <div className="skeleton-meta"></div>
        </div>
      </div>
    );
  }

  if (type === 'movie-details') {
    return (
      <div className="skeleton-movie-details">
        <div className="skeleton-header">
          <div className="skeleton-title-large"></div>
          <div className="skeleton-meta-large"></div>
        </div>
        <div className="skeleton-content">
          <div className="skeleton-poster-large"></div>
          <div className="skeleton-info">
            <div className="skeleton-text"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-text"></div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default LoadingSkeleton;
