import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/Button';
import "./introduccion.css";

const Summary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { formData, jsonLog, points } = location.state || { formData: {}, jsonLog: {} };

  //console.log("location.state",location.state)

  const moneyEarned = points * 10;

  function removeConsecutiveDuplicates(logs) {
    const result = [];
  
    logs.forEach((current, index) => {
      const next = logs[index + 1];
      
      // Check if the next log exists and compare relevant fields
      if (!next || current.elapsedTime !== next.elapsedTime || current.eventType !== next.eventType) {
        result.push(current);
      }
    });
  
    return result;
  }

  const handleFinish = () => {

    const cleaned_log = removeConsecutiveDuplicates(jsonLog)
    const summaryData = {
      ...formData,
      cleaned_log,
      points,
      moneyEarned
    };

    // Download summary data as JSON
    const fileName = "experiment-summary.json";
    const json = JSON.stringify(summaryData);
    const blob = new Blob([json], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);

    // Clear localStorage and navigate to login
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="container">
      <h1>Resumen del Experimento</h1>
      <p>
        Has logrado un total de <strong>{points} puntos</strong>.<br />
        Esto equivale a un ingreso de <strong>${moneyEarned} pesos</strong>.
      </p>
      <Button label="Finalizar" onClick={handleFinish} />
    </div>
  );
};

export default Summary;