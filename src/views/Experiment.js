import React, { useState, useEffect, useRef, useCallback } from "react";
import Points from "../components/Points";
import Button from "../components/Button";
import Box from "../components/Box";
import "../App.css";

const BLUE = "blue";
const YELLOW = "yellow";

const Experiment = () => {
  const riIntervals = [700, 1000, 1000, 1000, 4000, 4000, 4000, 7000, 7000, 7000];
  const initialPoints = 1300;
  const blockTime = 20; // in seconds
  const blockCounts = [6, 10, 10, 10, 10, 10, 10, 10, 10, 10];
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

  const intervalRef = useRef(null);
  const blockTimerRef = useRef(null);
  const endTimeRef = useRef(Date.now());

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
    console.log('currentBlockCount', currentBlockCount);

    if (currentBlockCount === blockCounts[scheduleIndex]) {
      clearInterval(intervalRef.current);
      clearInterval(blockTimerRef.current);
      setLosses((prevLosses) => [...prevLosses, currentLosses]);
      setCurrentLosses(0);

      if (scheduleIndex === 0) {
        alert("Tutorial finished. Score will be reset.");
        setPoints(initialPoints); // Reset score after tutorial
        setScheduleIndex((prevIndex) => prevIndex + 1);
        setIsRunning(false);
      }

      else if (scheduleIndex + 1 < blockCounts.length) {
        alert("Time to take a break. Select continue to resume.");
        setScheduleIndex((prevIndex) => prevIndex + 1);
        setIsRunning(false);
      } else {
        alert("Thanks for participating in the experiment.");
        setIsRunning(false);
      }
    }
  }, [currentBlockCount]);

  const startBlockTimer = useCallback(() => {
    blockTimerRef.current = setInterval(() => {
      console.log((Date.now() - endTimeRef.current) / 1000);
      if ((Date.now() - endTimeRef.current) / 1000 > blockTime) {
        endTimeRef.current = Date.now();
        setCurrentBlockCount((prevCount) => prevCount + 1);
      }
    }, 1000);
  }, [blockTime]);

  const handleStart = () => {
    if(!isRunning) {
      setIsRunning(true);
      endTimeRef.current = Date.now();
      //setPoints(initialPoints); // Reset points
      setCurrentBlockCount(0); // Reset block count
      //setScheduleIndex(0); // Reset schedule index
      setButtonLabel("PRESS");
    }
  };

  const handleSwitch = () => {
    const [leftMode, rightMode] = modeTuples[scheduleIndex];
    console.log(leftMode, rightMode);
    setIsControlled((prevMode) => (prevMode ? rightMode : leftMode));
    setMode((prevMode) => (prevMode === BLUE ? YELLOW : BLUE));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const generateNextInterval = useCallback(() => {
    const currentRi = riIntervals[scheduleIndex];
    const randomInterval = Math.floor(Math.random() * (currentRi * 2));
    setNextInterval(randomInterval);

    intervalRef.current = setTimeout(() => {
      if (isControlled || currentLosses < getMaxLosses()) {
        setPoints((prevPoints) => prevPoints - 1);
        setCurrentLosses((prevLosses) => prevLosses + 1);
      }
      setRed("red");
      generateNextInterval();
      setTimeout(() => {
        setRed("dark-red");
      }, 100)
      console.log("randomInterval",randomInterval);
    }, randomInterval);
  });

  const getMaxLosses = () => {
    if (scheduleIndex === 0) return Infinity; // No limit for the first schedule
    if (scheduleIndex === 1) return losses[0]/2; // Limit to losses in the first schedule
    return Math.floor(losses.slice(0, scheduleIndex).reduce((a, b) => a + b, 0) / scheduleIndex); // Average losses
  };

  const handleBoxClick = () => {
    //console.log("isRunning",isRunning, intervalRef.current)
    if (!isRunning) return;
    console.log("isControlled",isControlled);
    if (isControlled) {
      clearTimeout(intervalRef.current);
      generateNextInterval();
    }
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
          className={ mode === BLUE ? "bluePressButton" : "yellowPressButton"}
          onClick={ !isRunning ? handleStart :  handleBoxClick}
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
