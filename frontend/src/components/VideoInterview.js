import React, { useRef, useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

function VideoInterview() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [message, setMessage] = useState('');
  const mediaStreamRef = useRef(null);
  const [model, setModel] = useState(null);
  const [transcript, setTranscript] = useState(''); // State to store the transcript

  // Load the BlazeFace model
  const loadModel = async () => {
    try {
      console.log('Loading BlazeFace model...');
      const loadedModel = await blazeface.load();
      setModel(loadedModel);
      console.log('BlazeFace model loaded successfully');
    } catch (error) {
      console.error('Error loading the model:', error);
    }
  };

  // Initialize Speech Recognition API
  const initializeSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported by your browser.');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US'; // Set language

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + ' '; // Update with final transcript
        } else {
          finalTranscript += result[0].transcript; // Update with interim transcript
        }
      }
      setTranscript((prevTranscript) => prevTranscript + finalTranscript); // Append to previous transcript
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    return recognition;
  };

  useEffect(() => {
    loadModel();
    startVideoCapture();

    // Set interval for face detection
    const interval = setInterval(detectFace, 100);

    // Start speech recognition
    const recognition = initializeSpeechRecognition();
    recognition.start();

    return () => {
      stopVideoCapture();
      clearInterval(interval); // Clear interval when component is unmounted
      recognition.stop(); // Stop speech recognition
    };
  }, []); // Empty dependency array, meaning this runs once when component mounts

  // Start video capture from webcam
  const startVideoCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing camera: ', err);
    }
  };

  // Stop video capture
  const stopVideoCapture = () => {
    const stream = mediaStreamRef.current;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  // Detect faces in the video stream
  const detectFace = async () => {
    if (!model) {
      console.log('Model not loaded yet, skipping detection.');
      return;
    }

    const predictions = await model.estimateFaces(videoRef.current, false); // Get face predictions

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (predictions.length === 0) {
      setMessage('Error: No face detected. Please make sure your face is in the frame.');
    } else if (predictions.length > 1) {
      setMessage('Error: More than one face detected. Only one face allowed.');
    } else {
      setMessage('');
    }

    // Draw face bounding box on canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    predictions.forEach(prediction => {
      context.beginPath();
      context.lineWidth = 4;
      context.strokeStyle = 'red';
      context.rect(
        prediction.topLeft[0],
        prediction.topLeft[1],
        prediction.bottomRight[0] - prediction.topLeft[0],
        prediction.bottomRight[1] - prediction.topLeft[1]
      );
      context.stroke();
    });

    // If error count exceeds 3, stop the interview and redirect to home page
    if (errorCount >= 3) {
      alert('You are disqualified due to multiple errors.');
      window.location.href = '/';
    }
  };

  return (
    <div className="video-interview-container">
      <h2>Video Interview</h2>
      <video ref={videoRef} autoPlay playsInline />
      <canvas ref={canvasRef} width="640" height="480" style={{ position: 'absolute', top: '0', left: '0' }} />
      <div className="controls">
        {isRecording ? (
          <button onClick={stopVideoCapture}>Stop Interview</button>
        ) : (
          <button onClick={startVideoCapture}>Start Interview</button>
        )}
      </div>
      {message && <p className="error-message">{message}</p>}
      <div className="error-count">
        <p>Errors: {errorCount}</p>
      </div>

      {/* Fixed Transcript Subwindow */}
      <div className="transcript-window">
        <h3>Transcript</h3>
        <div className="transcript-content">
          <p>{transcript}</p> {/* Displaying the live transcript */}
        </div>
      </div>
    </div>
  );
}

export default VideoInterview;
