import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/Button';
import "./introduccion.css";

const Summary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { formData, jsonLog, points } = location.state || { formData: {}, jsonLog: {} };

  const moneyEarned = points * 10;

  // Function to remove consecutive duplicate logs
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

  function handleNull(value) {
    return value === null || value === undefined ? '' : value;
  }

  // Convert JSON to CSV
  function jsonToCsv(logs) {
    const headers = ['Type of Event', 'Seconds', 'Detail', 'Points'];
    const csvRows = [];
    
    // Add the headers as the first row
    csvRows.push(headers.join(','));
    
    // Map over the logs to format them as CSV
    logs.forEach(log => {
      const { eventType, elapsedTime, points, losses, block, intervalsGenerated, newMode, controlled, result, intervalType } = log;
      let detail = '';

      // Add specific details for different event types
      if (eventType === 'Mode Switched') {
        detail = `Switched to ${newMode}`;
      } else if (eventType === 'Point Loss') {
        detail = `Losses: ${losses}, Controlled: ${controlled}`;
      } else if (eventType === 'Schedule Start') {
        detail = `Block: ${block}, Interval Type: ${intervalType}, Intervals: ${intervalsGenerated}`;
      } else if (eventType === 'Schedule End') {
        detail = `Block: ${block}, Intervals: ${intervalsGenerated}`;
      } else if (eventType === 'Experiment End') {
        detail = `Result: ${handleNull(result)}`;
      }

      // Push each row into the CSV array
      csvRows.push([eventType, elapsedTime, detail, points].join(','));
    });

    return csvRows.join('\n');
  }

  // Handle JSON and CSV download
  const handleFinish = () => {
    const cleanedLog = removeConsecutiveDuplicates(jsonLog);

    // Download JSON file
    const summaryData = {
      ...formData,
      cleanedLog,
      points,
      moneyEarned
    };
    const jsonFileName = "experiment-summary.json";
    const json = JSON.stringify(summaryData);
    const jsonBlob = new Blob([json], { type: 'application/json' });
    const jsonHref = URL.createObjectURL(jsonBlob);
    const jsonLink = document.createElement('a');
    jsonLink.href = jsonHref;
    jsonLink.download = jsonFileName;
    document.body.appendChild(jsonLink);
    jsonLink.click();
    document.body.removeChild(jsonLink);
    URL.revokeObjectURL(jsonHref);

    // Convert cleaned log to CSV and download CSV
    const csv = jsonToCsv(cleanedLog);
    const csvFileName = "experiment-summary.csv";
    const csvBlob = new Blob([csv], { type: 'text/csv' });
    const csvHref = URL.createObjectURL(csvBlob);
    const csvLink = document.createElement('a');
    csvLink.href = csvHref;
    csvLink.download = csvFileName;
    document.body.appendChild(csvLink);
    csvLink.click();
    document.body.removeChild(csvLink);
    URL.revokeObjectURL(csvHref);

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