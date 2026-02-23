import React from "react";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-600 via-green-500 to-emerald-700">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-emerald-600">
            🐄 MKVillage
          </h1>
          <p className="text-gray-500 text-sm">
            Dairy & Farmer Management Platform
          </p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
