import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Points from "../components/Points";
import Button from "../components/Button";
import Box from "../components/Box";
import Swal from "sweetalert2";
import "../App.css";

const BLUE = "blue";
const YELLOW = "yellow";

const Experiment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve formData from location state
  const formData = useMemo(() => location.state || {}, [location.state]);

  function getRIntervals(logic) {
    let comp1RIntervals;

    switch (logic) {
      case 1:
      case 2:
        comp1RIntervals = [
          700, 1000, 1000, 1000, 4000, 4000, 4000, 7000, 7000, 7000,
        ];
        break;
      case 3:
      case 4:
        comp1RIntervals = [
          700, 1000, 1000, 1000, 7000, 7000, 7000, 4000, 4000, 4000,
        ];
        break;
      case 5:
      case 6:
        comp1RIntervals = [
          700, 4000, 4000, 4000, 1000, 1000, 1000, 7000, 7000, 7000,
        ];
        break;
      case 7:
      case 8:
        comp1RIntervals = [
          700, 4000, 4000, 4000, 7000, 7000, 7000, 1000, 1000, 1000,
        ];
        break;
      case 9:
      case 10:
        comp1RIntervals = [
          700, 7000, 7000, 7000, 1000, 1000, 1000, 4000, 4000, 4000,
        ];
        break;
      case 11:
      case 12:
        comp1RIntervals = [
          700, 7000, 7000, 7000, 4000, 4000, 4000, 1000, 1000, 1000,
        ];
        break;
      default:
        comp1RIntervals = [];
        console.log("Invalid logic case", logic);
    }

    return comp1RIntervals;
  }

  const riIntervals = useRef(getRIntervals(Number(formData.logic ?? 1)));
  const initialPoints = 1400;
  const blockTime = 3; // in seconds
  const blockCounts = useMemo(() => [6, 10, 10, 10, 10, 10, 10, 10, 10, 10], []);
  const modeTuples = useMemo(
    () => [
      [1, 1],
      [1, 1],
      [1, 0],
      [0, 1],
      [1, 1],
      [1, 0],
      [0, 1],
      [1, 1],
      [1, 0],
      [0, 1],
    ],
    []
  );


  // State variables and their refs
  const [points, setPoints] = useState(initialPoints);
  const pointsRef = useRef(points);

  const [currentLosses, setCurrentLosses] = useState(0);
  const currentLossesRef = useRef(currentLosses);

  const [mode, setMode] = useState(BLUE);
  const [isControlled, setIsControlled] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [currentBlockCount, setCurrentBlockCount] = useState(0);
  
  //const [scheduleIndex, setScheduleIndex] = useState(0);
  const scheduleIndexRef = useRef(0);
  
  const [buttonLabel, setButtonLabel] = useState("START");
  const [isSwitchDisabled, setIsSwitchDisabled] = useState(true);

  const [losses, setLosses] = useState([]);
  const [red, setRed] = useState("dark-red");

  // Use refs for counts that don't impact rendering
  const blueIntervalsRef = useRef(0);
  const yellowIntervalsRef = useRef(0);
  const blueLossesRef = useRef(0);
  const yellowLossesRef = useRef(0);
  const uncontrolledLossesRef = useRef(0);

  const modeRef = useRef(mode);
  const isControlledRef = useRef(isControlled);

  const pointLossTimeoutRef = useRef(null);
  const logEntriesRef = useRef([]);
  const blockTimerRef = useRef(null);
  const endTimeRef = useRef(Date.now());
  const blockStartTimeRef = useRef(Date.now());

  // Update refs when state changes
  useEffect(() => {
    pointsRef.current = points;
  }, [points]);

  useEffect(() => {
    currentLossesRef.current = currentLosses;
  }, [currentLosses]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    isControlledRef.current = isControlled;
  }, [isControlled]);

  const logEvent = useCallback((eventType, details = {}) => {
    const elapsedTime = Math.max(
      0,
      (Date.now() - blockStartTimeRef.current) / 1000
    ).toFixed(3); // Increased precision to milliseconds
    const logEntry = {
      eventType,
      timestamp: new Date().toISOString(),
      elapsedTime,
      ...details,
    };
    logEntriesRef.current.push(logEntry);
    console.log(JSON.stringify(logEntry));
  }, []);

  const getMaxLosses = useCallback(() => {
    if (scheduleIndexRef.current === 0) return Infinity;
  
    const controllingScheduleIndex =
      Math.floor((scheduleIndexRef.current - 1) / 3) * 3 + 1;
  
    const controllingLoss =
      losses[controllingScheduleIndex] !== undefined
        ? losses[controllingScheduleIndex]
        : Infinity;
  
    return controllingLoss / 2 || Infinity;
  }, [losses]);  

  const playErrorSound = useCallback(() => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(300, context.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start();

    setTimeout(() => {
      oscillator.stop();
      context.close();
    }, 100);
  }, []);

  // Stable reference to scheduleNextPointLoss
  const scheduleNextPointLoss = useRef();

  scheduleNextPointLoss.current = () => {
    const currentRi = riIntervals.current[scheduleIndexRef.current];
    const randomInterval = Math.max(
      10,
      Math.floor(Math.random() * currentRi * 2)
    );

    // Increment interval counts immediately upon scheduling
    if (modeRef.current === BLUE) {
      blueIntervalsRef.current += 1;
    } else if (modeRef.current === YELLOW) {
      yellowIntervalsRef.current += 1;
    }

    // Clear any existing point loss timeout
    if (pointLossTimeoutRef.current) {
      clearTimeout(pointLossTimeoutRef.current);
    }

    pointLossTimeoutRef.current = setTimeout(() => {
      const currentMode = modeRef.current;
      const currentIsControlled = isControlledRef.current;

      // Point loss logic
      if (
        currentIsControlled ||
        uncontrolledLossesRef.current < getMaxLosses()
      ) {
        // Calculate updated values using refs
        const updatedPoints = pointsRef.current - 1;
        const updatedLosses = currentLossesRef.current + 1;

        // Update state
        setPoints(updatedPoints);
        setCurrentLosses(updatedLosses);

        // Update refs
        pointsRef.current = updatedPoints;
        currentLossesRef.current = updatedLosses;

        if (!currentIsControlled) {
          uncontrolledLossesRef.current += 1;
        }

        if (currentMode === BLUE) {
          blueLossesRef.current += 1;
        } else if (currentMode === YELLOW) {
          yellowLossesRef.current += 1;
        }

        // Log the point loss using the updated values
        logEvent("Point Loss", {
          points: updatedPoints,
          losses: updatedLosses,
          controlled: currentIsControlled,
          mode: currentMode,
        });

        // Trigger visual feedback
        setRed("red");
        playErrorSound();

        setTimeout(() => {
          setRed("dark-red");
        }, 100);
      }

      // Schedule the next point loss
      scheduleNextPointLoss.current();
    }, randomInterval);
  };

  const startExperiment = useCallback(() => {
    blockStartTimeRef.current = Date.now();

    logEvent("Schedule Start", {
      block: scheduleIndexRef.current,
      intervalType: riIntervals.current[scheduleIndexRef.current],
      maxLosses: scheduleIndexRef.current > 1 ? getMaxLosses() : 0,
    });

    if (blockTimerRef.current) {
      clearInterval(blockTimerRef.current);
    }

    endTimeRef.current = Date.now();

    blockTimerRef.current = setInterval(() => {
      const elapsedSeconds = (Date.now() - endTimeRef.current) / 1000;
      if (elapsedSeconds >= blockTime) {
        endTimeRef.current = Date.now();
        setCurrentBlockCount((prevCount) => prevCount + 1);
      }
    }, 100);

    // Schedule the first point loss
    scheduleNextPointLoss.current();
  }, [blockTime, getMaxLosses, logEvent]);

  useEffect(() => {
    if (isRunning) {
      startExperiment();
    }

    return () => {
      if (blockTimerRef.current) clearInterval(blockTimerRef.current);
      if (pointLossTimeoutRef.current)
        clearTimeout(pointLossTimeoutRef.current);
    };
  }, [isRunning, startExperiment]);

  useEffect(() => {
    if (currentBlockCount >= blockCounts[scheduleIndexRef.current]) {
      if (blockTimerRef.current) clearInterval(blockTimerRef.current);
      if (pointLossTimeoutRef.current)
        clearTimeout(pointLossTimeoutRef.current);

      logEvent("Schedule End", {
        block: scheduleIndexRef.current,
        totalLosses: currentLossesRef.current,
        blueIntervals: blueIntervalsRef.current,
        yellowIntervals: yellowIntervalsRef.current,
        blueLosses: blueLossesRef.current,
        yellowLosses: yellowLossesRef.current,
      });

      setLosses((prevLosses) => [...prevLosses, currentLossesRef.current]);
      setCurrentLosses(0);

      // Reset the refs after logging
      blueIntervalsRef.current = 0;
      yellowIntervalsRef.current = 0;
      blueLossesRef.current = 0;
      yellowLossesRef.current = 0;
      uncontrolledLossesRef.current = 0;

      // Handle the transition between schedules
      if (scheduleIndexRef.current === 0) {
        Swal.fire({
          title: "Tutorial Finished!",
          text: "Score will be reset.",
          icon: "info",
          confirmButtonText: "OK",
          allowOutsideClick: false,
        });
        setPoints(initialPoints); // Reset score after tutorial
        scheduleIndexRef.current += 1;
        setIsRunning(false);
        logEvent("Experiment End", { result: "Tutorial finished" });
      } else if (scheduleIndexRef.current + 1 < blockCounts.length) {
        Swal.fire({
          title: "Break Time!",
          text: "Select continue to resume.",
          icon: "info",
          confirmButtonText: "Continue",
          allowOutsideClick: false,
        });
        scheduleIndexRef.current += 1;
        setIsRunning(false);
        logEvent("Break End", { result: "Break time" });
      } else {
        logEvent("Experiment End", { result: "Complete" });
        setIsRunning(false);
        Swal.fire({
          title: "Experiment Complete!",
          text: "Thanks for participating in the experiment.",
          icon: "success",
          confirmButtonText: "OK",
          allowOutsideClick: false,
        }).then(() => {
          setTimeout(() => {
            navigate("/summary", {
              state: {
                formData: formData,
                jsonLog: logEntriesRef.current,
                points: points,
              },
            });
          }, 2000);
        });
      }

      setCurrentBlockCount(0); // Reset block count
    }
  }, [
    currentBlockCount,
    blockCounts,
    initialPoints,
    logEvent,
    navigate,
    formData,
    points,
  ]);

  const handleStart = useCallback(() => {
    if (!isRunning) {
      setIsSwitchDisabled(false);
      setIsRunning(true);
      endTimeRef.current = Date.now();
      setCurrentBlockCount(0);
      setButtonLabel("PRESS");
      logEvent("Experiment Start");
    }
  }, [isRunning, logEvent]);

  const handleSwitch = useCallback(() => {
    setIsSwitchDisabled(true);

    if (pointLossTimeoutRef.current) {
      clearTimeout(pointLossTimeoutRef.current);
    }

    const [leftMode, rightMode] = modeTuples[scheduleIndexRef.current];

    const newMode = mode === BLUE ? YELLOW : BLUE;
    const newIsControlled = newMode === BLUE ? leftMode : rightMode;

    setMode(newMode);
    setIsControlled(newIsControlled);

    logEvent("Mode Switched", {
      block: scheduleIndexRef.current,
      newMode: newMode,
    });

    // Reschedule the point loss
    scheduleNextPointLoss.current();
  }, [mode, modeTuples, logEvent]);

  const handleBoxClick = useCallback(() => {
    if (!isRunning) return;
    setIsSwitchDisabled(false);
    if (isControlled) {
      if (pointLossTimeoutRef.current) {
        clearTimeout(pointLossTimeoutRef.current);
      }
      scheduleNextPointLoss.current();
      logEvent("Button Press");
    }
  }, [isRunning, isControlled, logEvent]);

  return (
    <div className="app">
      <Points points={points} />
      <div className="boxes">
        <Box color={red} />
      </div>
      <div className="controls">
        <Button
          label={buttonLabel}
          className={mode === BLUE ? "bluePressButton" : "yellowPressButton"}
          onClick={!isRunning ? handleStart : handleBoxClick}
        />
        <Button
          label="SWITCH"
          className="switchButton"
          onClick={handleSwitch}
          disabled={isSwitchDisabled}
        />
      </div>
    </div>
  );
};

export default Experiment;
