import React, { useState, useEffect, useRef, useCallback } from "react";
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
  const initialPoints = 1400;
  const blockTime = 3; // in seconds
  const blockCounts = [6, 10, 10, 10, 10, 10, 10, 10, 10, 10];
  //const blockCounts = [2, 2];
  const modeTuples = [
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
  ];

  const [points, setPoints] = useState(initialPoints);
  const [mode, setMode] = useState(BLUE);
  const [isRunning, setIsRunning] = useState(false);
  const [currentBlockCount, setCurrentBlockCount] = useState(0);
  const [scheduleIndex, setScheduleIndex] = useState(0);
  const isControlled = useRef(1);
  const [buttonLabel, setButtonLabel] = useState("START");
  const [nextInterval, setNextInterval] = useState(0);

  const [losses, setLosses] = useState([]);
  const intervalRef = useRef(null);

  // Ref for intervals
  const blueIntervalsRef = useRef(0); // Track intervals in BLUE mode
  const yellowIntervalsRef = useRef(0); // Track intervals in YELLOW mode

  // State for losses
  const [blueLosses, setBlueLosses] = useState(0); // Track losses in BLUE mode
  const [yellowLosses, setYellowLosses] = useState(0); // Track losses in YELLOW mode

  const [currentLosses, setCurrentLosses] = useState(0);
  const [uncontrolledLosses, setUncontrolledLosses] = useState(0);
  const [red, setRed] = useState("dark-red");
  const logEntriesRef = useRef([]);

  const blockTimerRef = useRef(null);
  const endTimeRef = useRef(Date.now());
  const blockStartTimeRef = useRef(Date.now());
  const intervalCountRef = useRef(0); // Track the number of intervals generated
  const intervalStartTimeRef = useRef(Date.now());
  const [isSwitchDisabled, setIsSwitchDisable] = useState(true);
  const [logPointLoss, setLogPointLoss] = useState(false);

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

      setLosses((prevLosses) => [...prevLosses, currentLosses]); // Store the losses for the completed block
      setCurrentLosses(0); // Reset losses for the next block

      // Log the end of the schedule, including totals for intervals and losses in both modes
      logEvent("Schedule End", {
        block: scheduleIndex,
        intervalsGenerated: intervalCountRef.current,
        totalLosses: currentLosses,
        blueIntervals: blueIntervalsRef.current, // Total intervals in BLUE
        yellowIntervals: yellowIntervalsRef.current, // Total intervals in YELLOW
        blueLosses: blueLosses, // Total losses in BLUE
        yellowLosses: yellowLosses, // Total losses in YELLOW
      });

      // Reset the counters for intervals
      blueIntervalsRef.current = 0;
      yellowIntervalsRef.current = 0;

      // Reset the counters for losses
      setBlueLosses(0);
      setYellowLosses(0);
      setUncontrolledLosses(0);

      // Handle the transition between schedules
      if (scheduleIndex === 0) {
        //alert("Tutorial finished. Score will be reset.");
        Swal.fire({
          title: "Tutorial Finished!",
          text: "Score will be reset.",
          icon: "info",
          confirmButtonText: "OK",
        });
        setPoints(initialPoints); // Reset score after tutorial
        setScheduleIndex((prevIndex) => prevIndex + 1);
        setIsRunning(false);
        logEvent("Experiment End", { result: "Tutorial finished" });
      } else if (scheduleIndex + 1 < blockCounts.length) {
        //alert("Time to take a break. Select continue to resume.");
        Swal.fire({
          title: "Break Time!",
          text: "Select continue to resume.",
          icon: "info",
          confirmButtonText: "Continue",
        });
        setScheduleIndex((prevIndex) => prevIndex + 1);
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
        }).then(() => {
          setTimeout(() => {
            navigate("/summary", {
              state: {
                formData: formData,
                jsonLog: logEntriesRef.current,
                points: points,
              },
            });
          }, 2000); // Delay before navigating
        });
      }

      intervalCountRef.current = 0; // Reset interval count for the next block
    }
  }, [
    currentBlockCount
  ]);

  const startBlockTimer = useCallback(() => {
    blockStartTimeRef.current = Date.now(); // Set block start time
    intervalCountRef.current = 0; // Reset interval count for the new block
    logEvent("Schedule Start", {
      block: scheduleIndex,
      intervalType: riIntervals[scheduleIndex],
      maxLosses: scheduleIndex > 1 ? getMaxLosses() : 0,
    });
    blockTimerRef.current = setInterval(() => {
      if ((Date.now() - endTimeRef.current) / 1000 > blockTime) {
        endTimeRef.current = Date.now();
        setCurrentBlockCount((prevCount) => prevCount + 1);
      }
    }, 1000);
  }, [blockTime, scheduleIndex]);

  const handleStart = () => {
    if (!isRunning) {
      if (isSwitchDisabled) setIsSwitchDisable(false);
      setIsRunning(true);
      endTimeRef.current = Date.now();
      blockStartTimeRef.current = Date.now(); // Reset block start time
      setCurrentBlockCount(0); // Reset block count
      setButtonLabel("PRESS");
      logEvent("Experiment Start");
    }
  };

  const handleSwitch = () => {
    const timeElapsedSinceIntervalSet =
      Date.now() - intervalStartTimeRef.current;
    const timeLeft = nextInterval - timeElapsedSinceIntervalSet;
    setIsSwitchDisable(true);

    if (timeLeft > 100) {
      clearTimeout(intervalRef.current);
      generateNextInterval(timeLeft + 500);
    }

    const [leftMode, rightMode] = modeTuples[scheduleIndex];
    console.log(leftMode, rightMode);

    //setMode((prevMode) => (prevMode === BLUE ? YELLOW : BLUE));
    const newMode = mode === BLUE ? YELLOW : BLUE;
    isControlled.ref = newMode === BLUE ? leftMode : rightMode;
    setMode(newMode);
    logEvent("Mode Switched", {
      block: scheduleIndex,
      newMode: newMode,
      timeLeft: timeLeft,
    });
  };

  useEffect(() => {
    if (logPointLoss) {
      // Log the event with updated state values
      logEvent("Point Loss", {
        points,
        losses: currentLosses,
        controlled: isControlled.ref,
        mode: mode,
      });

      // Reset the log flag
      setLogPointLoss(false);
    }
  }, [logPointLoss]);

  /*const generateNextInterval = useCallback((fixedTime = null) => {
    const currentRi = riIntervals[scheduleIndex];
    const randomInterval =
      fixedTime ?? Math.floor(Math.random() * (currentRi * 2));
    setNextInterval(randomInterval);
    //read time when interval starts
    intervalStartTimeRef.current = Date.now();

    intervalRef.current = setTimeout(() => {
      if (isControlled.ref || currentLosses < getMaxLosses()) {
        setPoints((prevPoints) => prevPoints - 1);
        setCurrentLosses((prevLosses) => prevLosses + 1);
        //logEvent("Point Loss", { points: points - 1, losses: currentLosses + 1, controlled: isControlled.ref });
        setLogPointLoss(true);
      }
      setRed("red");
      playErrorSound();
      generateNextInterval();
      setTimeout(() => {
        setRed("dark-red");
      }, 100);

      intervalCountRef.current += 1; // Increment the interval count
    }, randomInterval);
  });*/

  const generateNextInterval = useCallback(
    (fixedTime = null) => {
      const currentRi = riIntervals[scheduleIndex];
      const randomInterval =
        fixedTime ?? Math.floor(Math.random() * (currentRi * 2));
      setNextInterval(randomInterval);

      // Record the time when the interval starts
      intervalStartTimeRef.current = Date.now();

      intervalRef.current = setTimeout(() => {
        // Update the interval count based on the current mode (BLUE or YELLOW)
        if (mode === BLUE) {
          blueIntervalsRef.current += 1; // Increment BLUE intervals
        } else if (mode === YELLOW) {
          yellowIntervalsRef.current += 1; // Increment YELLOW intervals
        }

        // Check if the system is uncontrolled AND the loss count is under the max limit
        if (isControlled.ref || uncontrolledLosses < getMaxLosses()) {

          if(!isControlled.ref){
            console.log("currentLosses", uncontrolledLosses , getMaxLosses());
            setUncontrolledLosses((prevLosses) => prevLosses + 1);
          }

          setPoints((prevPoints) => prevPoints - 1); // Deduct a point
          setCurrentLosses((prevLosses) => prevLosses + 1); // Increment the current losses

          // Log point loss and update loss state based on mode
          if (mode === BLUE) {
            setBlueLosses((prevLosses) => prevLosses + 1); // Increment BLUE losses
          } else if (mode === YELLOW) {
            setYellowLosses((prevLosses) => prevLosses + 1); // Increment YELLOW losses
          }

          setLogPointLoss(true); // Trigger point loss logging

          // Visual feedback for error (red box, sound)
          setRed("red");
          playErrorSound();

          // Reset the red color after 100ms
          setTimeout(() => {
            setRed("dark-red");
          }, 100);
        }


        // Generate the next interval
        generateNextInterval();

       
        intervalCountRef.current += 1; // Increment the interval count
      }, randomInterval);
    },
    [riIntervals, scheduleIndex, mode, currentLosses, points, uncontrolledLosses]
  );

  /*
  const getMaxLosses = () => {
    if (scheduleIndex === 0) return Infinity; // No limit for the first schedule
    if (scheduleIndex === 1) return losses[0] / 2; // Limit to losses in the first schedule
    return Math.floor(
      losses.slice(0, scheduleIndex).reduce((a, b) => a + b, 0) / scheduleIndex
    ); 
  };*/

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getMaxLosses = useCallback(() => {
    if (scheduleIndex === 0) return Infinity; // Ignore the tutorial (schedule 1)

    // Determine the controlling schedule for the current group of 3 schedules
    const controllingScheduleIndex =
      Math.floor((scheduleIndex - 1) / 3) * 3 + 1;

    console.log("controllingScheduleIndex",controllingScheduleIndex);

    // Return half of the losses from the controlling schedule
    return losses[controllingScheduleIndex - 1] / 2;
  });

  const handleBoxClick = () => {
    if (!isRunning) return;
    if (isSwitchDisabled) setIsSwitchDisable(false);
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

  function playErrorSound() {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = "square"; // You can change the type to "sine", "square", "sawtooth", or "triangle"
    oscillator.frequency.setValueAtTime(300, context.currentTime); // Set frequency in hertz
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start();

    // Stop the sound after 100 milliseconds
    setTimeout(() => {
      oscillator.stop();
      context.close();
    }, 100);
  }

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
