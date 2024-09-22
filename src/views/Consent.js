import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import './Consent.css';

function Consent() {
  const [identification, setIdentification] = useState("");
  const [expedition, setExpedition] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const userData = location.state;
  
  console.log("userData", userData);
  
  const handleAccept = (e) => {
    navigate('/introduction', {
        state: { ...userData, identification, expedition },
      });
  };

  const buttonStatus = !identification && !expedition;

  return (
    <div className="consent-container">
      <form className="consent-form" onSubmit={handleAccept}>
        <h1>Consentimiento Informado</h1>
        <p>
          Yo <b>{userData.fullName}</b>, identificado con documento de identidad No.{" "}
          <input
            className="consent-input"
            type="text"
            value={identification}
            onChange={(e) => setIdentification(e.target.value)}
            placeholder="Documento de identidad"
          />
          , de{" "}
          <input
            className="consent-input"
            type="text"
            value={expedition}
            onChange={(e) => setExpedition(e.target.value)}
            placeholder="Lugar de procedencia"
          />
          , he sido invitado(a) a participar en una investigación sobre tareas
          de elección; la cual, está siendo realizada por la estudiante de
          Doctorado: Karen Viviana Henao Barbosa, quien es supervisada por el
          Dr. Álvaro Arturo Clavijo, docente e investigador de la Universidad
          Nacional de Colombia y el Dr. Camilo Hurtado-Parrado, docente e
          investigador de Southern Illinois University y la Konrad Lorenz
          Fundación Universitaria.
        </p>
        <p>
          <strong>Propósito del estudio:</strong> La tarea trata de explorar
          cómo se comportan las personas en entornos cambiantes. Estos procesos
          de toma de decisiones y aprendizaje son comunes a la mayoría de las
          personas. <strong>No es una prueba de inteligencia, memoria o de
          personalidad.</strong>
        </p>
        <p>
          <strong>Descripción del procedimiento:</strong> La actividad puede
          tomar aproximadamente 35 minutos. Por favor cerciórese de disponer de
          este tiempo. A continuación, apague o active su celular en modo
          silencioso, póngase cómodo en el asiento, guarde silencio y procure
          concentrarse únicamente en la tarea que se le presentará a
          continuación. Usted se sentará frente a un computador y se le
          solicitará que oprima botones. Usted obtendrá puntos dependiendo de
          su ejecución. Tenga en cuenta que, una vez empiece el experimento, los
          experimentadores no podrán ayudarle ni darle más información respecto
          a la tarea que va a realizar.
        </p>
        <p>
          <strong>Retribución y beneficios por la participación:</strong> Se le
          entregará una retribución económica al finalizar el experimento. La
          cantidad exacta dependerá de su ejecución durante la tarea. Cada punto
          vale 10 pesos, por ejemplo: si usted gana 290 puntos, recibirá $2.900
          pesos. La bonificación económica podrá ser de hasta $14.000.
        </p>
        <p>
          <strong>Riesgos e incomodidades:</strong> La participación en esta
          investigación no supone ningún riesgo para su salud. Se garantiza que
          ninguna característica de los estímulos genera en las personas daño
          transitorio o permanente. El estudio es clasificado como riesgo mínimo
          según los estándares de la resolución 8430 de 1993, pues es una
          investigación de tipo experimental en dónde se evalúa el efecto de una
          variable independiente (la tarea) sobre una variable dependiente
          (proceso de toma de decisiones común en la mayoría de las personas).
          Todos los datos serán codificados y conocidos exclusivamente por el
          equipo de investigación.
        </p>
        <p>
          <strong>Confidencialidad:</strong> Entiendo que cualquier información
          personal que haga parte de los resultados de la investigación será
          mantenida de manera confidencial. En ninguna publicación en la que se
          usen mis resultados se mencionará mi nombre a menos que lo consienta y
          autorice por escrito.
        </p>
        <p>
          <b>
            IMPORTANTE: usted se compromete a NO divulgar los detalles de esta
            actividad hasta el momento en el cual le sea comunicado vía correo-e
            que el estudio ha terminado. Entiendo que la participación es
            voluntaria y que podré detener la tarea en el momento que desee y
            retirarme. Como la bonificación se entrega al finalizar el
            experimento, en caso de no finalizarlo, no recibiré compensación
            monetaria.
          </b>
        </p>
        <p>
          Para obtener información acerca de esta investigación podré
          comunicarme con Karen Viviana Henao Barbosa, estudiante de Doctorado
          del programa de psicología de la Universidad Nacional de Colombia,
          correo electrónico khenaob@unal.edu.co{" "}
        </p>
        <button className="consent-button" disabled={buttonStatus} type="submit">
          Consiento Voluntariamente Participar en Este Estudio al Darle Click al Botón “Continuar.”
        </button>
      </form>
    </div>
  );
}

export default Consent;