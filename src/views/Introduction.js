import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/Button';
import "./introduccion.css";

const Introduction = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve formData from location state
  const formData = location.state || {};

  // Store formData to localStorage and navigate on start
  const startExperiment = () => {
    localStorage.setItem('experimentData', JSON.stringify(formData));
    navigate('/experiment', {
      state: { ...formData },
    });
  };

  // Effect to log formData whenever it changes (optional)
  useEffect(() => {
    console.log("Received formData:", formData);
  }, [formData]);

  return (
    <div className="container">
      <h1>Introducción</h1>
      <p>
        Bienvenido al experimento. Aquí están las reglas: <br/>
        Comenzarás con 1300 puntos y tu objetivo es reducir la cantidad de puntos que pierdes. 
        A intervalos aleatorios, debes presionar un botón para evitar la pérdida de puntos.
        Puedes pulsar tan rápido como desees o tan libremente como prefieras. 
        Por cada punto que conserves al final del experimento, recibirás $100 pesos. 
        ¡Buena suerte!
      </p>
      <Button label="Comenzar" onClick={startExperiment} />
    </div>
  );
};

export default Introduction;