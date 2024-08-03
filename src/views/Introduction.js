import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const Introduction = () => {
  const navigate = useNavigate();

  const startExperiment = () => {
    navigate('/experiment');
  };

  return (
    <div>
      <h1>Introduction</h1>
      <p>Welcome to the experiment. Here are the rules...</p>
      <Button label="Start" onClick={startExperiment} />
    </div>
  );
};

export default Introduction;
