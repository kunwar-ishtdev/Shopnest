import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <p className="text-9xl font-black text-brand-600 mb-4" style={{ fontFamily: 'Clash Display' }}>404</p>
        <h1 className="text-3xl font-bold text-dark-900 mb-3">Page Not Found</h1>
        <p className="text-dark-400 mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/" className="btn-primary">Go Home</Link>
          <Link to="/products" className="btn-secondary">Shop Products</Link>
        </div>
      </div>
    </div>
  );
}