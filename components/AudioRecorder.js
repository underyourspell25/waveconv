'use client';

import { useState, useRef, useEffect } from 'react';

export default function AudioRecorder({ onRecordingComplete, onClose }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const intervalRef = useRef(null);
  const audioElementRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    requestMicrophonePermission();
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      setHasPermission(true);
      streamRef.current = stream;
      setupAudioContext(stream);
    } catch (error) {
      console.error('Erreur d\'accès au microphone:', error);
      setHasPermission(false);
    }
  };

  const setupAudioContext = (stream) => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    
    analyserRef.current.fftSize = 256;
    source.connect(analyserRef.current);
    
    updateAudioLevel();
  };

  const updateAudioLevel = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
    setAudioLevel(average / 255);
    
    animationRef.current = requestAnimationFrame(updateAudioLevel);
  };

  const startRecording = async () => {
    try {
      if (!streamRef.current) {
        await requestMicrophonePermission();
      }

      audioChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(streamRef.current);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Erreur de démarrage d\'enregistrement:', error);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      clearInterval(intervalRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      clearInterval(intervalRef.current);
    }
  };

  const playRecording = () => {
    if (audioBlob && audioElementRef.current) {
      const url = URL.createObjectURL(audioBlob);
      audioElementRef.current.src = url;
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  const stopPlayback = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const useRecording = () => {
    if (audioBlob) {
      // Convertir le blob en fichier
      const file = new File([audioBlob], `recording-${Date.now()}.webm`, {
        type: 'audio/webm'
      });
      onRecordingComplete(file);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (hasPermission === null) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #1a1a1a, #2a2a2a)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '20px',
          padding: '2rem',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎙️</div>
          <div>Demande d'accès au microphone...</div>
        </div>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #1a1a1a, #2a2a2a)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '20px',
          padding: '2rem',
          textAlign: 'center',
          color: 'white',
          maxWidth: '400px'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🚫</div>
          <h3 style={{ color: '#ef4444', marginBottom: '1rem' }}>Accès au microphone refusé</h3>
          <p style={{ color: '#c4b5fd', marginBottom: '1.5rem' }}>
            Pour enregistrer de l'audio, veuillez autoriser l'accès au microphone dans les paramètres de votre navigateur.
          </p>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(139, 92, 246, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              color: '#c4b5fd',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a1a, #2a2a2a)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '20px',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%',
        textAlign: 'center',
        color: 'white'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            color: '#c4b5fd',
            fontSize: '1.5rem',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎙️</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Enregistrer un audio</h2>
          <p style={{ color: '#c4b5fd' }}>Cliquez sur le bouton pour commencer l'enregistrement</p>
        </div>

        {/* Visualiseur audio */}
        <div style={{
          height: '60px',
          background: 'rgba(139, 92, 246, 0.1)',
          borderRadius: '12px',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}>
          <div style={{
            width: '80%',
            height: '4px',
            background: 'rgba(139, 92, 246, 0.3)',
            borderRadius: '2px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${audioLevel * 100}%`,
              height: '100%',
              background: isRecording ? 
                'linear-gradient(90deg, #8b5cf6, #c084fc)' : 
                'rgba(139, 92, 246, 0.5)',
              borderRadius: '2px',
              transition: 'width 0.1s ease'
            }}></div>
          </div>
        </div>

        {/* Timer */}
        <div style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: isRecording ? '#ef4444' : '#8b5cf6',
          marginBottom: '2rem',
          fontFamily: 'monospace'
        }}>
          {formatTime(recordingTime)}
        </div>

        {/* Contrôles d'enregistrement */}
        {!audioBlob ? (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1rem' }}>
            {!isRecording ? (
              <button
                onClick={startRecording}
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '50px',
                  border: 'none',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '1.1rem'
                }}
              >
                <div style={{
                  width: '12px',
                  height: '12px',
                  background: 'white',
                  borderRadius: '50%',
                  animation: 'pulse 1.5s infinite'
                }}></div>
                Enregistrer
              </button>
            ) : (
              <>
                {!isPaused ? (
                  <button
                    onClick={pauseRecording}
                    style={{
                      background: 'rgba(139, 92, 246, 0.2)',
                      border: '1px solid rgba(139, 92, 246, 0.4)',
                      color: '#c4b5fd',
                      padding: '1rem 1.5rem',
                      borderRadius: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    ⏸️ Pause
                  </button>
                ) : (
                  <button
                    onClick={resumeRecording}
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      color: 'white',
                      padding: '1rem 1.5rem',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    ▶️ Reprendre
                  </button>
                )}
                
                <button
                  onClick={stopRecording}
                  style={{
                    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                    color: 'white',
                    padding: '1rem 1.5rem',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  ⏹️ Arrêter
                </button>
              </>
            )}
          </div>
        ) : (
          /* Contrôles de lecture */
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ marginBottom: '1rem', color: '#c4b5fd' }}>
                📄 Enregistrement terminé ({formatTime(recordingTime)})
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                {!isPlaying ? (
                  <button
                    onClick={playRecording}
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    ▶️ Écouter
                  </button>
                ) : (
                  <button
                    onClick={stopPlayback}
                    style={{
                      background: 'rgba(139, 92, 246, 0.2)',
                      border: '1px solid rgba(139, 92, 246, 0.4)',
                      color: '#c4b5fd',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    ⏸️ Arrêter
                  </button>
                )}
                
                <button
                  onClick={() => {
                    setAudioBlob(null);
                    setRecordingTime(0);
                  }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#ef4444',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  🗑️ Refaire
                </button>
              </div>
            </div>

            <button
              onClick={useRecording}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                color: 'white',
                padding: '1rem',
                borderRadius: '12px',
                border: 'none',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                cursor: 'pointer'
              }}
            >
              ✅ Utiliser cet enregistrement
            </button>
          </div>
        )}

        <audio
          ref={audioElementRef}
          onEnded={() => setIsPlaying(false)}
          style={{ display: 'none' }}
        />
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}