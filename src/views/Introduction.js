import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/Button';
import "./introduccion.css";

const Introduction = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve formData from location state
  const formData = location.state || {};

  console.log(formData);

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
        Como se mencionó en el consentimiento informado, gracias nuevamente por elegir participar en este estudio. Esta tarea investiga cómo se comportan las personas en entornos cambiantes. Su objetivo es conservar tantos puntos como sea posible.
      </p>
      <p>
        Puede conservar puntos clickeando el botón central en la pantalla. El botón central que dice “INICIAR” cambiará a azul o amarillo cuando comience el experimento. Puede cambiar entre azul o amarillo presionando el botón “CAMBIO” en la pantalla. La velocidad a la que conserva o pierde puntos es diferente dependiendo de si el botón es azul o amarillo. Sin embargo, ambos colores siempre brindarán oportunidades de conservar puntos por clickear el botón azul y amarillo.
      </p>
      <p>
        Su misión es descubrir cómo conservar tantos puntos como sea posible. Las señales visuales y auditivas lo ayudarán con esta tarea. Cada vez que pierda un punto, la luz roja a la derecha del botón central parpadeará y sonará un ‘womp’.
      </p>
      <p>
        Cuando termine de tomar un descanso, use el mouse para hacer clic izquierdo en “CONTINUAR” en el mensaje de solicitud para comenzar a conservar puntos nuevamente.
      </p>
      <p>
        Si tiene alguna pregunta, no dude en preguntar al investigador antes de iniciar.
      </p>
      <Button label="Comenzar" onClick={startExperiment} />
    </div>
  );
};

export default Introduction;