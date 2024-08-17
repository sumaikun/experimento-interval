import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Introduction from './views/Introduction';
import Experiment from './views/Experiment';
import Login from './views/Login';
import Summary from './views/Summary';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/introduction" element={<Introduction />} />
        <Route path="/experiment" element={<Experiment />} />
        <Route path="/summary" element={<Summary />} />
      </Routes>
    </Router>
  );
}

export default App;
