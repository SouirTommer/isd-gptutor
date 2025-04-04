import React, { useState, useRef, useEffect } from 'react';

const AudioRecorder = ({ onRecordingComplete, transcript, isTranscribing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        onRecordingComplete(audioBlob);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAudioURL('');
      
      // Start duration counter
      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds++;
        setRecordingDuration(seconds);
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Error accessing microphone. Please ensure you have granted permission.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is an audio file
      if (!file.type.startsWith('audio/')) {
        alert('Please upload an audio file');
        return;
      }
      
      setUploadedFile(file);
      const audioUrl = URL.createObjectURL(file);
      setAudioURL(audioUrl);
      onRecordingComplete(file);
    }
  };
  
  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="audio-recorder">
      <div className="flex flex-wrap gap-4 mb-4">
        {isRecording ? (
          <button 
            onClick={stopRecording}
            className="btn bg-red-500 hover:bg-red-600 text-white flex items-center"
          >
            <i className="fas fa-stop-circle mr-2"></i> 
            Stop Recording ({formatTime(recordingDuration)})
          </button>
        ) : (
          <button 
            onClick={startRecording}
            className="btn bg-primary-500 hover:bg-primary-600 text-white flex items-center"
          >
            <i className="fas fa-microphone mr-2"></i> Start Recording
          </button>
        )}
        
        <div className="relative">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
            id="audio-upload"
          />
          <label 
            htmlFor="audio-upload"
            className="btn bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center cursor-pointer"
          >
            <i className="fas fa-upload mr-2"></i> Upload Audio
          </label>
        </div>
      </div>
      
      {uploadedFile && (
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Uploaded: {uploadedFile.name}
        </div>
      )}
      
      {audioURL && (
        <div className="audio-player mb-4">
          <audio src={audioURL} controls className="w-full"></audio>
        </div>
      )}
      
      {isTranscribing && (
        <div className="transcribing-status flex items-center text-gray-600 dark:text-gray-300">
          <i className="fas fa-spinner fa-spin mr-2"></i>
          Transcribing audio...
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
