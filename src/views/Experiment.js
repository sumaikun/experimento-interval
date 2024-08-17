import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Points from "../components/Points";
import Button from "../components/Button";
import Box from "../components/Box";
import "../App.css";

const BLUE = "blue";
const YELLOW = "yellow";

const Experiment = () => {
  const location = useLocation();

  // Retrieve formData from location state
  const formData = location.state || {};

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
        // Default case to handle unexpected values
        comp1RIntervals = [];
        console.log("Invalid logic case", logic);
    }

    return comp1RIntervals;
  }

  const [riIntervals, setRiIntervals] = useState(
    getRIntervals(Number(formData.logic ?? 1))
  );
  const initialPoints = 1300;
  const blockTime = 20; // in seconds
  //const blockCounts = [6, 10, 10, 10, 10, 10, 10, 10, 10, 10];
  const blockCounts = [2, 2];
  const modeTuples = [
    [1, 1],
    [1, 1],
    [1, 0],
    [0, 1],
    [1, 1],
    [0, 1],
    [1, 0],
    [1, 1],
    [1, 0],
    [0, 1],
  ];

  const [points, setPoints] = useState(initialPoints);
  const [mode, setMode] = useState(BLUE);
  const [isRunning, setIsRunning] = useState(false);
  const [currentBlockCount, setCurrentBlockCount] = useState(0);
  const [scheduleIndex, setScheduleIndex] = useState(0);
  const [isControlled, setIsControlled] = useState(true);
  const [buttonLabel, setButtonLabel] = useState("START");
  const [nextInterval, setNextInterval] = useState(0);
  const [losses, setLosses] = useState([]);
  const [currentLosses, setCurrentLosses] = useState(0);
  const [red, setRed] = useState("dark-red");
  const logEntriesRef = useRef([]);

  const intervalRef = useRef(null);
  const blockTimerRef = useRef(null);
  const endTimeRef = useRef(Date.now());
  const blockStartTimeRef = useRef(Date.now());
  const intervalCountRef = useRef(0); // Track the number of intervals generated

  const logEvent = (eventType, details = {}) => {
    const elapsedTime = Math.max(
      0,
      (Date.now() - blockStartTimeRef.current) / 1000
    ).toFixed(2);
    const logEntry = {
      eventType,
      timestamp: new Date().toISOString(),
      elapsedTime,
      ...details,
    };
    logEntriesRef.current.push(logEntry); // Update ref directly
    console.log(JSON.stringify(logEntry));
  };

  useEffect(() => {
    if (isRunning) {
      startBlockTimer();
      generateNextInterval();
    }

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(blockTimerRef.current);
    };
  }, [isRunning]);

  useEffect(() => {
    if (currentBlockCount === blockCounts[scheduleIndex]) {
      clearInterval(intervalRef.current);
      clearInterval(blockTimerRef.current);
      setLosses((prevLosses) => [...prevLosses, currentLosses]);
      setCurrentLosses(0);

      logEvent("Schedule End", {
        block: scheduleIndex,
        intervalsGenerated: intervalCountRef.current,
      });

      if (scheduleIndex === 0) {
        alert("Tutorial finished. Score will be reset.");
        setPoints(initialPoints); // Reset score after tutorial
        setScheduleIndex((prevIndex) => prevIndex + 1);
        setIsRunning(false);
        logEvent("Experiment End", { result: "Tutorial finished" });
      } else if (scheduleIndex + 1 < blockCounts.length) {
        alert("Time to take a break. Select continue to resume.");
        setScheduleIndex((prevIndex) => prevIndex + 1);
        setIsRunning(false);
        logEvent("Break End", { result: "Break time" });
      } else {
        logEvent("Experiment End", { result: "Complete" });
        alert("Thanks for participating in the experiment.");
        // Trigger download of the log file
        setTimeout(() => {
          downloadLog();
          setIsRunning(false);
        }, 2000);
      }

      intervalCountRef.current = 0; // Reset interval count for the next block
    }
  }, [currentBlockCount]);

  const startBlockTimer = useCallback(() => {
    blockStartTimeRef.current = Date.now(); // Set block start time
    intervalCountRef.current = 0; // Reset interval count for the new block
    logEvent("Schedule Start", { block: scheduleIndex });
    blockTimerRef.current = setInterval(() => {
      if ((Date.now() - endTimeRef.current) / 1000 > blockTime) {
        endTimeRef.current = Date.now();
        setCurrentBlockCount((prevCount) => prevCount + 1);
      }
    }, 1000);
  }, [blockTime, scheduleIndex]);

  const handleStart = () => {
    if (!isRunning) {
      setIsRunning(true);
      endTimeRef.current = Date.now();
      blockStartTimeRef.current = Date.now(); // Reset block start time
      setCurrentBlockCount(0); // Reset block count
      setButtonLabel("PRESS");
      logEvent("Experiment Start");
    }
  };

  const handleSwitch = () => {
    const [leftMode, rightMode] = modeTuples[scheduleIndex];
    setIsControlled((prevMode) => (prevMode ? rightMode : leftMode));
    //setMode((prevMode) => (prevMode === BLUE ? YELLOW : BLUE));
    const newMode = mode === BLUE ? YELLOW : BLUE;
    setMode(newMode);
    logEvent("Mode Switched", {
      block: scheduleIndex,
      newMode: newMode,
    });
  };

  const generateNextInterval = useCallback(() => {
    const currentRi = riIntervals[scheduleIndex];
    const randomInterval = Math.floor(Math.random() * (currentRi * 2));
    setNextInterval(randomInterval);

    intervalRef.current = setTimeout(() => {
      if (isControlled || currentLosses < getMaxLosses()) {
        setPoints((prevPoints) => prevPoints - 1);
        setCurrentLosses((prevLosses) => prevLosses + 1);
        logEvent("Point Loss", { points: points - 1, losses: currentLosses });
      }
      setRed("red");
      generateNextInterval();
      setTimeout(() => {
        setRed("dark-red");
      }, 100);

      intervalCountRef.current += 1; // Increment the interval count
    }, randomInterval);
  });

  const getMaxLosses = () => {
    if (scheduleIndex === 0) return Infinity; // No limit for the first schedule
    if (scheduleIndex === 1) return losses[0] / 2; // Limit to losses in the first schedule
    return Math.floor(
      losses.slice(0, scheduleIndex).reduce((a, b) => a + b, 0) / scheduleIndex
    ); // Average losses
  };

  const handleBoxClick = () => {
    if (!isRunning) return;
    if (isControlled) {
      clearTimeout(intervalRef.current);
      generateNextInterval();
      logEvent("Button Press");
    }
  };

  const downloadLog = () => {
    const blob = new Blob([JSON.stringify(logEntriesRef.current, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "experiment-log.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        />
      </div>
    </div>
  );
};

export default Experiment;
