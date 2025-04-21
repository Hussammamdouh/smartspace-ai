import React from "react";

const Loader = ({ size = 50, color = "#E5CBBE", centered = false }) => {
  const loaderStyles = {
    width: `${size}px`,
    height: `${size}px`,
    borderTopColor: color,
    borderRightColor: "transparent",
    borderBottomColor: color,
    borderLeftColor: color,
  };

  return (
    <div
      className={`${
        centered ? "flex items-center justify-center min-h-screen" : ""
      }`}
    >
      <div
        className="animate-spin rounded-full border-t-4 border-opacity-50"
        style={loaderStyles}
        aria-label="Loading..."
      ></div>
    </div>
  );
};

export default Loader;
