import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state for user verification

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser.data); // Access the `data` field safely
      } catch (error) {
        console.error("Failed to parse user data from localStorage:", error);
        localStorage.removeItem("user"); // Clean up corrupted data
      }
    }
    setLoading(false); // Finish loading
  }, []);

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  if (loading) {
    // Show a loading spinner or placeholder while verifying the user
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#181818] text-[#E5CBBE]">
        <h1 className="text-2xl">Loading...</h1>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
