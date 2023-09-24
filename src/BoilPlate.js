import React from "react";
import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";

function BoilPlate() {
  const [status, setStatus] = useState("Awaiting TF.js load");
  const [disableButton, setDisableButton] = useState(true);
  const [invisible, setInvisible] = useState(false);
  const [boxStyle, setBoxStyle] = useState("");
  const [pText, setPText] = useState();
  const [divBoxStyle, setDivBoxStyle] = useState();

  //  const video = document.getElementById('webcam');
  //  const liveView = document.getElementById('liveView');
  //  const demosSection = document.getElementById('demos');
  //  const enableWebcamButton = document.getElementById('webcamButton');

  const videoWebCamRef = useRef(null);
  const liveViewRef = useRef(null);
  const demosSectionRef = useRef(null);
  const enableWebCamRef = useRef(null);
  const pRef = useRef(null);
  const divRef = useRef(null);
  const imgRef = useRef(null);

  var model = "";

  useEffect(() => {
    setStatus("Loaded TensorFlow.js - version: " + tf.version.tfjs);
    // console.log(videoWebCamRef)
    // console.log(liveViewRef)
    // console.log(demosSectionRef)
    // console.log(enableWebCamRef)
    // setBoxStyle();
    webCamSupported();
    // loadCoco();
    // enableCam();
  });

  // Check if webcam access is supported.
  function getUserMediaSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  // If webcam supported, add event listener to button for when user
  // wants to activate it to call enableCam function which we will
  // define in the next step.
  function webCamSupported() {
    if (getUserMediaSupported()) {
      // enableWebcamButton.addEventListener('click', enableCam);
      console.log("removed");
      setDisableButton(false);
    } else {
      console.warn("getUserMedia() is not supported by your browser");
    }
  }

  async function loadCoco() {
    const MODEL_PATH =
      "https://tfhub.dev/google/tfjs-model/movenet/singlepose/lightning/4";
    let movenet = undefined;

    movenet = await tf.loadGraphModel(MODEL_PATH, { fromTFHub: true });

    let exampleInputTensor = tf.zeros([1, 192, 192, 3], "int32");
    let imageTensor = tf.browser.fromPixels(imgRef.current);
    console.log(imageTensor.shape);

    let cropStartPoint = [15, 170, 0];
    let cropSize = [345, 345, 3];
    let croppedTensor = tf.slice(imageTensor, cropStartPoint, cropSize);

    let resizedTensor = tf.image
      .resizeBilinear(croppedTensor, [192, 192], true)
      .toInt();
    console.log(resizedTensor.shape);

    let tensorOutput = movenet.predict(tf.expandDims(resizedTensor));
    let arrayOutput = await tensorOutput.array();

    console.log(arrayOutput);
  }

  // Placeholder function for next step. Paste over this in the next step.
  //Enable live webcam
  function enableCam() {
    console.log("enable cam");

    //only continue when coco has loaded
    if (!model) {
      return;
    }

    //hide when button clicked
    enableWebCamRef.current.remove();

    //force video not audio
    const constraints = {
      video: true,
    };

    //activate webcam stream
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
      videoWebCamRef.current.srcObject = stream;
      videoWebCamRef.current.addEventListener("loadeddata", predictWebcam);
    });
  }

  var children = [];

  function predictWebcam() {
    console.log(videoWebCamRef);

    model.detect(videoWebCamRef.current).then(function (predictions) {
      console.log("is this running?");
      // for(let i = 0; i < children.length; i++){
      //   liveViewRef.current.removeChild(children[i]);
      //   console.log("test",liveViewRef.current.children)
      // }
      // children.splice(0);

      for (let n = 0; n < predictions.length; n++) {
        //check predicition %
        if (predictions[n].score > 0.66) {
          setPText(
            `${predictions[n].class} - with ${Math.round(
              parseFloat(predictions[n].score) * 100,
            )} '% confidence.`,
          );

          pRef.current.style.marginLeft = `${predictions[n].bbox[0]}px`;
          pRef.current.style.marginTop = `${predictions[n].bbox[1] - 10}px`;
          pRef.current.style.width = `${predictions[n].bbox[2] - 10}px`;
          pRef.current.style.top = 0;
          pRef.current.style.left = 0;

          divRef.current.style.left = `${predictions[n].bbox[0]}px`;
          divRef.current.style.top = `${predictions[n].bbox[1]}px`;
          divRef.current.style.width = `${predictions[n].bbox[2]}px`;
          divRef.current.style.height = `${predictions[n].bbox[3]}px`;
        }
      }
      window.requestAnimationFrame(predictWebcam);
    });
  }

  return (
    <div>
      <h1>TensorFlow.js Hello World</h1>
      <p>{status}</p>

      <h1>
        Multiple object detection using pre trained model in TensorFlow.js
      </h1>

      <p>
        Wait for the model to load before clicking the button to enable the
        webcam - at which point it will become visible to use.
      </p>

      <section
        id="demos"
        ref={demosSectionRef}
        className={invisible ? "invisible" : ""}
      >
        <p>
          Hold some objects up close to your webcam to get a real-time
          classification! When ready click "enable webcam" below and accept
          access to the webcam when the browser asks (check the top left of your
          window)
        </p>

        <div id="liveView" ref={liveViewRef} className="camView">
          <div
            ref={divRef}
            style={{ divBoxStyle }}
            className="highlighter"
          ></div>
          <p ref={pRef} style={{ boxStyle }}>
            {pText}
          </p>

          <button
            id="webcamButton"
            ref={enableWebCamRef}
            onClick={() => loadCoco()}
            disabled={disableButton}
          >
            Enable Webcam
          </button>

          {/* <video
            id="webcam"
            ref={videoWebCamRef}
            autoPlay
            muted
            width="640"
            height="480"
          ></video> */}

          <img
            id="exampleImg"
            width="640"
            height="360"
            crossorigin="anonymous"
            src="https://storage.googleapis.com/jmstore/TensorFlowJS/EdX/standing.jpg"
            ref={imgRef}
          />
        </div>
      </section>
    </div>
  );
}

export default BoilPlate;
