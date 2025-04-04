import React, { useState, useEffect } from 'react';

const AudioRecorder = ({ onRecordingComplete, transcript, isTranscribing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);

      recorder.ondataavailable = (event) => {
        setAudioChunks((prev) => [...prev, event.data]);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        onRecordingComplete(audioBlob);
        setAudioChunks([]);
      };

      recorder.start();
    } catch (err) {
      console.error('Error starting recording:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
  };

  return (
    <div className="audio-recorder">
      <button
        onClick={() => setIsRecording((prev) => !prev)}
        className={`btn ${isRecording ? 'btn-danger' : 'btn-primary'} w-full mb-4`}
      >
        {isRecording ? (
          <>
            <i className="fas fa-stop mr-2"></i> Stop Recording
          </>
        ) : (
          <>
            <i className="fas fa-microphone mr-2"></i> Start Recording
          </>
        )}
      </button>
      {isTranscribing && (
        <div className="transcribing-indicator text-center text-gray-500">
          <i className="fas fa-spinner fa-spin mr-2"></i> Transcribing audio...
        </div>
      )}
      {transcript && (
        <div className="transcript mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <h4 className="font-bold mb-2">Transcript:</h4>
          <p>{transcript}</p>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;