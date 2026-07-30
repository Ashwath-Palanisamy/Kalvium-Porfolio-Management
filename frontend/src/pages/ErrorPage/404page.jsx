import React from "react";
import { Link } from "react-router-dom";
import "./404page.css";

function ErrorPage() {
  return (
    <div className="error-container">
      <h1 className="error-code">404</h1>
      <h2 className="error-title">Page Not Found</h2>
      
      <p className="error-message">
        Sorry, the page you’re looking for doesn’t exist or has been moved.
      </p>
      <Link to="/" className="home-link">
        ⬅ Back to Home
      </Link>
    </div>
  );
}

export default ErrorPage;
