import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";

const ChatInput = ({ onSendMessage, isLoading, disabled }) => {
  const { t, isUrdu } = useLanguage();
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const streamRef = useRef(null);
  const componentMountedRef = useRef(true);
  const recognitionRef = useRef(null);

  // Set mounted ref and cleanup on unmount
  useEffect(() => {
    componentMountedRef.current = true;

    // Initialize speech recognition
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = isUrdu ? "ur-PK" : "en-US";

      recognitionRef.current.onstart = () => {
        console.log("🎤 [FRONTEND] Google Speech Recognition started");
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log(
          "📝 [FRONTEND] Google Speech Recognition result:",
          transcript
        );

        if (componentMountedRef.current && transcript.trim()) {
          onSendMessage(transcript.trim(), "text");
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error(
          "❌ [FRONTEND] Google Speech Recognition error:",
          event.error
        );
        if (componentMountedRef.current) {
          setIsTranscribing(false);
          let errorMessage = "Speech recognition error";

          switch (event.error) {
            case "not-allowed":
            case "permission-denied":
              errorMessage =
                t("microphoneAccessDenied") ||
                "Microphone access denied. Please allow microphone access and try again.";
              break;
            case "no-speech":
              errorMessage =
                t("noSpeechDetected") ||
                "No speech detected. Please try again.";
              break;
            case "audio-capture":
              errorMessage =
                t("noMicrophone") ||
                "No microphone detected. Please check your microphone.";
              break;
            case "network":
              errorMessage =
                t("networkError") ||
                "Network error occurred. Please check your connection.";
              break;
            default:
              errorMessage =
                t("speechRecognitionError") ||
                "Speech recognition failed. Please try again.";
          }

          alert(errorMessage);
        }
      };

      recognitionRef.current.onend = () => {
        console.log("🛑 [FRONTEND] Google Speech Recognition ended");
        if (componentMountedRef.current) {
          setIsRecording(false);
          setIsTranscribing(false);
        }
      };
    }

    return () => {
      console.log("🧹 [FRONTEND] Component unmounting, cleaning up...");
      componentMountedRef.current = false;

      // Stop speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors when stopping
        }
      }

      // Stop recording if active
      if (mediaRecorderRef.current && isRecording) {
        console.log("🛑 [FRONTEND] Stopping recording due to unmount");
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          console.error("❌ [FRONTEND] Error stopping recorder on unmount:", e);
        }
      }

      // Stop all media tracks
      if (streamRef.current) {
        console.log("🔇 [FRONTEND] Stopping media tracks");
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
          console.log("🔇 [FRONTEND] Track stopped:", track.kind);
        });
        streamRef.current = null;
      }

      // Clear interval
      if (recordingIntervalRef.current) {
        console.log("⏰ [FRONTEND] Clearing recording interval");
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    };
  }, [isUrdu, onSendMessage, t]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim(), "text");
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onSendMessage(event.target.result, "image");
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const startGoogleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert(
        t("speechRecognitionNotSupported") ||
          "Speech recognition is not supported in your browser. Please use Chrome or Edge."
      );
      return;
    }

    // Check if already recording
    if (isRecording) {
      return;
    }

    try {
      console.log("🎤 [FRONTEND] Starting Google Speech Recognition...");

      // Set language based on current UI language
      recognitionRef.current.lang = isUrdu ? "ur-PK" : "en-US";

      setIsRecording(true);
      setIsTranscribing(true);
      setRecordingTime(0);

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        if (!componentMountedRef.current) {
          clearInterval(recordingIntervalRef.current);
          return;
        }
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      recognitionRef.current.start();
    } catch (error) {
      console.error("❌ [FRONTEND] Error starting speech recognition:", error);
      if (componentMountedRef.current) {
        setIsRecording(false);
        setIsTranscribing(false);
        alert(
          t("speechRecognitionError") ||
            "Error starting speech recognition. Please try again."
        );
      }
    }
  };

  const stopGoogleSpeechRecognition = () => {
    if (recognitionRef.current && isRecording) {
      console.log("🛑 [FRONTEND] Stopping Google Speech Recognition...");
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error(
          "❌ [FRONTEND] Error stopping speech recognition:",
          error
        );
      }

      // Clean up timer
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const handleVoiceRecord = () => {
    if (!componentMountedRef.current) return;

    if (!isRecording) {
      console.log(
        "🎤 [FRONTEND] User pressed record button - Using Google Speech Recognition"
      );
      startGoogleSpeechRecognition();
    } else {
      console.log("🛑 [FRONTEND] User pressed stop button");
      stopGoogleSpeechRecognition();
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const canSend = message.trim() && !isLoading && !disabled;

  // Check browser support
  const isSpeechRecognitionSupported =
    "webkitSpeechRecognition" in window || "SpeechRecognition" in window;

  return (
    <div className={`space-y-2 sm:space-y-3 ${isUrdu ? "urdu-layout" : ""}`}>
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />

        <div className="flex gap-1 sm:gap-2 items-center">
          <button
            type="button"
            onClick={triggerFileInput}
            disabled={isLoading || disabled || isRecording || isTranscribing}
            className="p-2 sm:p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
            title={t("uploadImage")}
          >
            <i className="bi bi-image text-gray-700 text-sm sm:text-base"></i>
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleVoiceRecord}
              disabled={
                isLoading ||
                disabled ||
                isTranscribing ||
                !isSpeechRecognitionSupported
              }
              className={`p-2 sm:p-3 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0 ${
                isRecording
                  ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                  : isTranscribing
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              } ${
                !isSpeechRecognitionSupported
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              title={
                !isSpeechRecognitionSupported
                  ? t("speechRecognitionNotSupported") ||
                    "Speech recognition not supported"
                  : isTranscribing
                  ? t("transcribing") || "Transcribing..."
                  : isRecording
                  ? t("stopRecording") || "Stop Recording"
                  : t("recordVoice")
              }
            >
              {isTranscribing ? (
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <i
                  className={`bi ${
                    isRecording ? "bi-stop-circle" : "bi-mic"
                  } text-sm sm:text-base`}
                ></i>
              )}
            </button>
            {isRecording && (
              <span className="text-xs text-red-600 font-medium">
                {Math.floor(recordingTime / 60)}:
                {(recordingTime % 60).toString().padStart(2, "0")}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder={t("typeMessage")}
            disabled={isLoading || disabled || isRecording || isTranscribing}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 rounded-lg border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none disabled:opacity-50 text-sm sm:text-base"
            rows="1"
            dir={isUrdu ? "rtl" : "ltr"}
          />
        </div>

        <button
          type="submit"
          disabled={!canSend || isRecording || isTranscribing}
          className={`p-2 sm:p-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ${
            canSend && !isRecording && !isTranscribing
              ? "bg-primary-500 hover:bg-primary-600 text-white shadow-md hover:shadow-lg"
              : "bg-gray-300 text-gray-500"
          }`}
        >
          {isLoading ? (
            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <i className="bi bi-send text-base sm:text-lg"></i>
          )}
        </button>
      </form>

      {/* Debug info */}
      {(isRecording || isTranscribing) && (
        <div className="text-xs text-gray-500 space-y-1">
          {isRecording && (
            <div>
              Recording: {recordingTime}s | Using Google Speech Recognition
            </div>
          )}
          {isTranscribing && (
            <div>Transcribing audio with Google Speech Recognition...</div>
          )}
        </div>
      )}

      {/* Browser support warning */}
      {!isSpeechRecognitionSupported && (
        <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded-lg">
          ⚠️{" "}
          {t("speechRecognitionNotSupported") ||
            "Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari for voice input."}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm">
        <span className="text-gray-600">{t("quickQuestions")}:</span>
        <button
          type="button"
          onClick={() => onSendMessage(t("sampleQuestion1"), "text")}
          disabled={isLoading || disabled || isRecording || isTranscribing}
          className="px-2 sm:px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors disabled:opacity-50 text-xs sm:text-sm"
        >
          {t("sampleQuestion1")}
        </button>
        <button
          type="button"
          onClick={() => onSendMessage(t("sampleQuestion2"), "text")}
          disabled={isLoading || disabled || isRecording || isTranscribing}
          className="px-2 sm:px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors disabled:opacity-50 text-xs sm:text-sm"
        >
          {t("sampleQuestion2")}
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
