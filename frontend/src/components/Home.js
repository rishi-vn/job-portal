import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home-container">
      <h1>Welcome to Job Application</h1>
      <div className="buttons">
        <Link to="/upload-resume">
          <button>Upload Resume</button>
        </Link>
        <Link to="/video-interview">
          <button>Start Video Interview</button>
        </Link>
      </div>
    </div>
  );
}

export default Home;