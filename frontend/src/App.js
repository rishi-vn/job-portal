import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ResumeUpload from './components/ResumeUpload';
import VideoInterview from './components/VideoInterview';
import Home from './components/Home';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload-resume" element={<ResumeUpload />} />
        <Route path="/video-interview" element={<VideoInterview />} />
      </Routes>
    </Router>
  );
}

export default App;