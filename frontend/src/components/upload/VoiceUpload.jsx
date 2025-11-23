import React, { useState, useRef } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { validateFile } from "../../utils/helpers";

const VoiceUpload = ({ onAnalysisComplete, isLoading, disabled }) => {
  const { t } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const fileInputRef = useRef(null);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setError(t("microphoneAccessDenied"));
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
    }
  };

  const handleFileSelect = async (file) => {
    setError(null);
    const validation = validateFile(file);
    if (!validation.isValid) {
      setError(t(validation.error));
      return;
    }
    if (!file.type.startsWith("audio/") && file.type !== 'audio/webm') {
      setError(t("invalidFileType"));
      return;
    }
    const audioUrl = URL.createObjectURL(file);
    setAudioUrl(audioUrl);
    if (onAnalysisComplete) {
      try {
        await onAnalysisComplete(file);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileSelect(file);
    e.target.value = "";
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    }
  };

  const removeAudio = () => {
    setAudioUrl(null);
    setRecordingTime(0);
    setError(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const supportedFormats = ["MP3", "WAV", "OGG", "WEBM"];
  const maxSizeMB = 10;

  return (
    <div className="card p-6">
      <input type="file" ref={fileInputRef} onChange={handleFileInputChange} accept="audio/*" className="hidden" />

      {!audioUrl ? (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              {isRecording && (
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-red-500 rounded-full animate-pulse"
                      style={{
                        animationDelay: `${i * 0.1}s`,
                        height: `${20 + Math.random() * 60}%`,
                      }}
                    ></div>
                  ))}
                </div>
              )}
              {!isRecording && <i className="bi bi-mic-fill text-4xl text-red-500"></i>}
            </div>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={disabled}
              className={`btn ${isRecording ? "bg-red-500 hover:bg-red-600" : "btn-primary"} mb-4`}
            >
              <i className={`bi ${isRecording ? "bi-stop-fill" : "bi-mic-fill"}`}></i>
              {isRecording ? t("stopRecording") : t("startRecording")}
            </button>
            {isRecording && (
              <div className="flex items-center justify-center gap-2 text-red-600">
                <i className="bi bi-record-circle animate-pulse"></i>
                <span className="font-mono font-bold">{formatTime(recordingTime)}</span>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-gray-500">{t("or")}</span>
            </div>
          </div>

          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary-400 bg-gray-50 transition-colors"
            onClick={triggerFileInput}
          >
            <i className="bi bi-file-earmark-music text-4xl text-primary-500 mb-4"></i>
            <h4 className="text-xl font-bold text-gray-900 mb-2">{t("uploadAudio")}</h4>
            <p className="text-gray-600 mb-4">{t("browseFiles")}</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <i className="bi bi-check-circle text-primary-500"></i>
                {t("supportedFormats")}: {supportedFormats.join(", ")}
              </span>
              <span className="flex items-center gap-1">
                <i className="bi bi-check-circle text-primary-500"></i>
                {t("maxSize")}: {maxSizeMB}MB
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h5 className="text-lg font-bold text-gray-900">{t("audioPreview")}</h5>
            <button
              onClick={removeAudio}
              disabled={isLoading}
              className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <i className="bi bi-x"></i>
            </button>
          </div>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <button
              onClick={playAudio}
              disabled={isPlaying || isLoading}
              className="w-12 h-12 bg-primary-500 hover:bg-primary-600 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <i className={`bi ${isPlaying ? "bi-pause-fill" : "bi-play-fill"} text-xl`}></i>
            </button>
            <div className="flex-1">
              <p className="font-mono font-bold text-gray-900">
                {recordingTime > 0 ? formatTime(recordingTime) : "--:--"}
              </p>
              <p className="text-sm text-gray-600">{isPlaying ? t("playing") : t("readyToPlay")}</p>
            </div>
          </div>
          {error && (
            <div className="alert alert-error">
              <i className="bi bi-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      {isLoading && (
        <div className="mt-4 flex items-center justify-center gap-3 p-4 bg-primary-50 rounded-lg">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-primary-700 font-medium">{t("processingAudio")}</span>
        </div>
      )}
    </div>
  );
};

export default VoiceUpload;
