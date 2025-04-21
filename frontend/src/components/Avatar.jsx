import PropTypes from 'prop-types';

const Avatar = ({ src, alt, name, size = 50 }) => {
  const getInitials = () => {
    if (!name || typeof name !== 'string') return '';
    const parts = name.trim().split(' ');
    const first = parts[0]?.[0] || '';
    const second = parts[1]?.[0] || '';
    return (first + second).toUpperCase();
  };

  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-semibold"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: src ? 'transparent' : '#E5CBBE',
        overflow: 'hidden',
        fontSize: `${size / 2.5}px`,
      }}
    >
      {src ? (
        <img
          src={src}
          alt={alt || 'Avatar'}
          className="object-cover w-full h-full rounded-full"
        />
      ) : (
        <span>{getInitials()}</span>
      )}
    </div>
  );
};

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  name: PropTypes.string,
  size: PropTypes.number,
};

export default Avatar;
