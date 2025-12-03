// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage.jsx';
import ClassificationPage from './components/ClassificationPage.jsx';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/classify" element={<ClassificationPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;