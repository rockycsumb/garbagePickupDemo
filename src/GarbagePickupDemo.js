import { useRef, useEffect, useState } from "react";
import { FaTrashAlt, FaPlay, FaStop, FaPause } from "react-icons/fa";
import * as moment from "moment";
import "./garbagePickupDemoStyle.css";
import GarbagePickupStats from "./GarbagePickupStats";

//roboflow cred
const PUBLISHABLE_ROBOFLOW_API_KEY = "rf_t1Ap7HRSGSeZRzIVfP09vvtV3i13";
const PROJECT_URL = "garbagecanpickup";
const MODEL_VERSION = "2"; //check

//Global Variables
var inferRunning = false;
var emptyingTrash = false;
var pickupTimes = ["Times will show here, give a try!"];

const GarbagePickupDemo = (props) => {
  const [modelStatus, setModelStatus] = useState("model not loaded");
  const [modelStatusCss, setModelStatusCss] = useState("removed");
  const [disableCamButton, setDisableCamButton] = useState(false);
  const [disableStopButton, setDisableStopButton] = useState(true);
  const [enableCamText, setEnableCamText] = useState(
    "Enable camera to start detection",
  );
  const [garbageStatus, setGarbageStatus] = useState(
    "Waiting for Garbage truck.",
  );
  const [garbageStatusCss, setGarbageStatusCss] = useState(
    "garbage-status-trash",
  );
  const [trashCanCss, setTrashCanCss] = useState("trash-icon");

  const canvasRef = useRef(null);
  const streamSourceRef = useRef(null);
  var detectInterval = useRef(null);

  var model = undefined;
  var videoWidth = 360; //360 520
  var videoHeight = 360; // 260 360;

  useEffect(() => {
    loadModel();
  });

  useEffect(() => {
    loadingAnimations();
  }, []);

  //show loading animations at startup
  const loadingAnimations = () => {
    setModelStatusCss("model-status-loading");
    setGarbageStatusCss("removed");
    setModelStatus("Object Detection Loading");
    setTimeout(() => {
      setModelStatusCss("removed");
      setGarbageStatusCss("garbage-status-trash");
    }, 2000);
  };

  //Use the web cam
  const showWebCam = async () => {
    setDisableCamButton(true);
    const camPermissions = await checkCamPermission();
    if (!camPermissions) {
      alert("You have to allow camera permissions");
    } else {
      if (enableCamText === "Restart Camera and Detection") {
        restartCamDetection();
      }

      await loadModel();

      setModelStatusCss("removed");
      setGarbageStatusCss("garbage-status-trash");

      await enableCam();
      setDisableStopButton(false);

      startDetection();
    }
  };

  const restartCamDetection = () => {
    setGarbageStatus("Waiting for Garbage truck.");
    emptyingTrash = false;
  };

  //load the model
  const loadModel = async () => {
    window.roboflow
      .auth({
        publishable_key: PUBLISHABLE_ROBOFLOW_API_KEY,
      })
      .load({
        model: PROJECT_URL,
        version: MODEL_VERSION,
        onMetadata: function (m) {
          inferRunning = true;
        },
      })
      .then((ml) => {
        model = ml;
      });
  };

  //Start detecting
  const startDetection = () => {
    inferRunning = true;
    if (model) {
      detectInterval.current = setInterval(() => {
        if (inferRunning) detect(model);
      }, 1000);
    }
  };

  const clearCanvas = () => {
    canvasRef.current.getContext("2d").clearRect(0, 0, 360, 360);
  };

  //Stop detection
  const stopDetection = async () => {
    inferRunning = false;
    clearInterval(detectInterval.current);

    //clear canvas when stop detecting
    setTimeout(() => {
      clearCanvas();
    }, 500);
  };

  // Check if webcam access is supported.
  function getUserMediaSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  const checkCamPermission = () => {
    return new Promise(async (resolve) => {
      const constraints = {
        video: {
          width: videoWidth,
          height: videoHeight,
          facingMode: "environment",
        },
      };

      //activate webcam stream
      try {
        await navigator.mediaDevices
          .getUserMedia(constraints)
          .then(function (stream) {
            stream.getVideoTracks().forEach((track) => {
              track.stop();
            });
          });
        resolve(true);
      } catch (err) {
        setDisableCamButton(true);
        setDisableStopButton(true);
        setEnableCamText("Allow your camera permissions and reload");
        resolve(false);
      }
    });
  };

  //Enable live webcam
  const enableCam = async () => {
    const constraints = {
      video: {
        width: videoWidth, //416
        height: videoHeight, //416
        facingMode: "environment",
      },
    };

    //activate webcam stream
    try {
      await navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function (stream) {
          streamSourceRef.current.srcObject = stream;
          streamSourceRef.current.addEventListener("loadeddata", function () {
            return true;
          });
        });
    } catch (err) {
      setDisableCamButton(true);
      setDisableStopButton(true);
      setEnableCamText("Allow your camera permissions and reload");
    }
  };

  //Stop the camera
  const stopCamera = () => {
    if (
      streamSourceRef.current != null &&
      streamSourceRef.current.srcObject !== null
    ) {
      streamSourceRef.current.srcObject.getVideoTracks().forEach((track) => {
        track.stop();
      });
    }
    inferRunning = false;
    setEnableCamText("Restart Camera and Detection");
    stopDetection();
    setDisableCamButton(false);
    setDisableStopButton(true);
  };

  const restartDetection = (intervalTimer) => {
    clearInterval(detectInterval.current);
    detectInterval.current = undefined;
    if (model) {
      detectInterval.current = setInterval(() => {
        if (inferRunning) detect(model);
      }, intervalTimer);
    }
  };

  //Detection stuff
  const detect = async (model) => {
    console.log("detect");
    if (
      typeof streamSourceRef.current !== "undefined" &&
      streamSourceRef.current !== null &&
      inferRunning === true
    ) {
      adjustCanvas(videoWidth, videoHeight);

      const detections = await model.detect(streamSourceRef.current);

      let truckPresent = false;

      if (detections.length > 0) {
        detections.forEach((el) => {
          if (el.class === "garbageTruck" && el.confidence > 0.6) {
            truckPresent = true;
          }

          if (
            truckPresent &&
            el.class === "garbagePickingUp" &&
            el.confidence > 0.6
          ) {
            emptyingTrash = true;
            setTrashCanCss("trash-icon trash-icon-empty");
            setGarbageStatus("Emptying trash can!");
          }
        });
      }

      if (truckPresent) {
        restartDetection(10);
      } else {
        restartDetection(1000);
      }

      if (emptyingTrash && !truckPresent) {
        setTrashCanCss("trash-icon");
        setGarbageStatus("Emptied Trash Can!");
        stopCamera();
        pickupTimes.push(moment().format("ddd, MM-DD-YYYY, h:mm a"));
      }

      const ctx = canvasRef.current.getContext("2d");
      drawBoxes(detections, ctx);
    }
  };

  const adjustCanvas = (w, h) => {
    canvasRef.current.width = w * window.devicePixelRatio;
    canvasRef.current.height = h * window.devicePixelRatio;

    canvasRef.current.style.width = w + "px";
    canvasRef.current.style.height = h + "px";

    canvasRef.current
      .getContext("2d")
      .scale(window.devicePixelRatio, window.devicePixelRatio);
  };

  const drawBoxes = (detections, ctx) => {
    detections.forEach((row) => {
      if (true) {
        //video
        var temp = row.bbox;
        temp.class = row.class;
        // row.class === "GarbageBin"
        //   ? "bin"
        //   : row.class === "garbagePickingUp"
        //   ? "pickup"
        //   : row.class;
        temp.color = row.color;
        temp.confidence = row.confidence;
        row = temp;
      }
      if (row.confidence < 0) return;

      //dimensions
      var x = row.x - row.width / 2;
      var y = row.y - row.height / 2;
      var w = row.width;
      var h = row.height;

      //box
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = row.color;
      ctx.rect(x, y, w, h);
      ctx.stroke();

      //shade
      ctx.fillStyle = "black";
      ctx.globalAlpha = 0.2;
      ctx.fillRect(x, y, w, h);
      ctx.globalAlpha = 1.0;

      //label
      var fontColor = "black";
      var fontSize = 12;
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = "center";
      var classTxt = row.class;

      var confTxt = (row.confidence * 100).toFixed().toString() + "%";
      var msgTxt = classTxt + " " + confTxt;

      const textHeight = fontSize;
      var textWidth = ctx.measureText(msgTxt).width;

      if (textHeight <= h && textWidth <= w) {
        ctx.strokeStyle = row.color;
        ctx.fillStyle = row.color;
        ctx.fillRect(
          x - ctx.lineWidth / 2,
          y - textHeight - ctx.lineWidth,
          textWidth + 2,
          textHeight + 1,
        );
        ctx.stroke();
        ctx.fillStyle = fontColor;
        ctx.fillText(msgTxt, x + textWidth / 2 + 1, y - 1);
      } else {
        textWidth = ctx.measureText(confTxt).width;
        ctx.strokeStyle = row.color;
        ctx.fillStyle = row.color;
        ctx.fillRect(
          x - ctx.lineWidth / 2,
          y - textHeight - ctx.lineWidth,
          textWidth + 2,
          textHeight + 1,
        );
        ctx.stroke();
        ctx.fillStyle = fontColor;
        ctx.fillText(confTxt, x + textWidth / 2 + 1, y - 1);
      }
    });
  };

  return (
    <div className="outer-container">
      <div className="app-container">
        <p className="garbagedemo-testcases">
          tested on: pixel 7 android blah, iphone chrome OS something
        </p>
        <div className="container">
          <div className="top-container">
            <div className="top-title">
              <h2>Garbage Can Pickup</h2>
            </div>
            <div className="instructions-container">
              <div className="instructions">
                <p>
                  Step 1: Open youtube
                  <a
                    className="youtube-link"
                    href="https://www.youtube.com/watch?v=EO4XX_kX9C8"
                    target="_blank"
                  >
                    "Garbage pickup sample video"
                  </a>
                  on another device.
                </p>
                <p>Step 2: Tap "Enable Camera to Start Detection"</p>
                <p>Step 3: Point camera at the video</p>
              </div>
            </div>
            <div className="top-button-container">
              <button
                onClick={showWebCam}
                disabled={disableCamButton}
                className={
                  disableCamButton
                    ? " cam-button disable-cam-button"
                    : "cam-button"
                }
              >
                {enableCamText}
              </button>
            </div>
          </div>

          <div className="graphic-display">
            <div className={modelStatusCss}>
              <p>{modelStatus}</p>
            </div>
            <div className={garbageStatusCss}>
              <p>{garbageStatus}</p>
              <FaTrashAlt className={trashCanCss} />
            </div>
          </div>

          <div className="video-display-container">
            <div className="video-display-buttons">
              <button
                className={
                  disableStopButton
                    ? "stop-webcam-button disable-cam-button"
                    : "stop-webcam-button"
                }
                onClick={stopCamera}
                disabled={disableStopButton}
              >
                <FaStop /> Stop Cam
              </button>
            </div>
            <div className="video-display">
              <canvas ref={canvasRef} className="prediction-window" />
              <video
                ref={streamSourceRef}
                autoPlay
                muted
                playsInline
                width={videoWidth}
                height={videoHeight}
              ></video>
            </div>
          </div>
        </div>
      </div>
      <div className="pickup-stats">
        <hr className="hr-pickup" />

        <GarbagePickupStats
          className="pickup-stats"
          pickupTimes={pickupTimes}
        />
      </div>
    </div>
  );
};

export default GarbagePickupDemo;
