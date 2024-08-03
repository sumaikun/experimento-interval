import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Introduction from './views/Introduction';
import Experiment from './views/Experiment';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Introduction />} />
        <Route path="/experiment" element={<Experiment />} />
      </Routes>
    </Router>
  );
}

export default App;
