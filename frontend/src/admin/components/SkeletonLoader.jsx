import PropTypes from 'prop-types';

const SkeletonLoader = ({ type = 'text', width, height, className = '' }) => {
  const baseClasses = 'animate-pulse bg-[#2C2C2C] rounded';
  
  if (type === 'text') {
    return (
      <div 
        className={`${baseClasses} ${className}`}
        style={{ width: width || '100%', height: height || '1rem' }}
      />
    );
  }
  
  if (type === 'circle') {
    return (
      <div 
        className={`${baseClasses} rounded-full ${className}`}
        style={{ width: width || '3rem', height: height || '3rem' }}
      />
    );
  }
  
  if (type === 'rect') {
    return (
      <div 
        className={`${baseClasses} ${className}`}
        style={{ width: width || '100%', height: height || '100px' }}
      />
    );
  }
  
  return null;
};

SkeletonLoader.propTypes = {
  type: PropTypes.oneOf(['text', 'circle', 'rect']),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
};

export const TableSkeleton = ({ rows = 5, columns = 6 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonLoader 
              key={colIndex} 
              type="text" 
              width="100%" 
              height="2.5rem"
              className="flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
};

TableSkeleton.propTypes = {
  rows: PropTypes.number,
  columns: PropTypes.number,
};

export const CardSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-[#2C2C2C] rounded-2xl p-6 border border-[#3C3C3C]">
          <SkeletonLoader type="text" width="60%" height="1rem" className="mb-4" />
          <SkeletonLoader type="text" width="40%" height="2rem" className="mb-2" />
          <SkeletonLoader type="text" width="80%" height="0.875rem" />
        </div>
      ))}
    </div>
  );
};

CardSkeleton.propTypes = {
  count: PropTypes.number,
};

export default SkeletonLoader;





