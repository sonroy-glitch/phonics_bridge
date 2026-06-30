'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, Square } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { BASE_API_URL } from '@/lib/config';

interface RecordButtonProps {
  referenceText: string;
  onComplete: (data: any) => void;
}

export function RecordButton({ referenceText, onComplete }: RecordButtonProps) {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState('');

  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const inputRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const leftChannelRef = useRef<Float32Array[]>([]);
  const recordingLengthRef = useRef(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    setError('');
    leftChannelRef.current = [];
    recordingLengthRef.current = 0;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      const input = audioContext.createMediaStreamSource(stream);
      inputRef.current = input;

      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const left = e.inputBuffer.getChannelData(0);
        leftChannelRef.current.push(new Float32Array(left));
        recordingLengthRef.current += 4096;
      };

      input.connect(processor);
      processor.connect(audioContext.destination);

      setIsRecording(true);
      setRecordingTime(0);
    } catch (err: any) {
      console.error('Failed to start recording', err);
      setError('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setIsAnalyzing(true);

    try {
      if (processorRef.current) processorRef.current.disconnect();
      if (inputRef.current) inputRef.current.disconnect();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) await audioContextRef.current.close();

      const sampleRate = audioContextRef.current?.sampleRate || 44100;
      const recordingLength = recordingLengthRef.current;
      const leftBuffer = mergeBuffers(leftChannelRef.current, recordingLength);

      // Encode to WAV
      const wavBuffer = new ArrayBuffer(44 + recordingLength * 2);
      const view = new DataView(wavBuffer);

      writeString(view, 0, 'RIFF');
      view.setUint32(4, 36 + recordingLength * 2, true);
      writeString(view, 8, 'WAVE');
      writeString(view, 12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(view, 36, 'data');
      view.setUint32(40, recordingLength * 2, true);

      floatTo16BitPCM(view, 44, leftBuffer);

      const wavBlob = new Blob([view], { type: 'audio/wav' });

      // Send to backend
      const headers: any = {
        'referenceText': referenceText,
        'language': 'en-US',
      };
      if (user) {
        if (user.role === 'teacher' || user.role === 'learner') {
          headers['userId'] = user.id;
        } else {
          headers['studentId'] = user.id;
        }
      }

      const formData = new FormData();
      formData.append('audio', wavBlob, 'recording.wav');

      const response = await fetch(`${BASE_API_URL}/pronounciation-service`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.msg || 'Phonics assessment failed.');
      }

      const apiResult = await response.json();
      onComplete(apiResult);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRecord = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper functions for WAV encoding
  function mergeBuffers(channelBuffer: Float32Array[], recordingLength: number): Float32Array {
    const result = new Float32Array(recordingLength);
    let offset = 0;
    for (let i = 0; i < channelBuffer.length; i++) {
      const buffer = channelBuffer[i]!;
      result.set(buffer, offset);
      offset += buffer.length;
    }
    return result;
  }

  function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  function floatTo16BitPCM(output: DataView, offset: number, input: Float32Array) {
    for (let i = 0; i < input.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, input[i]!));
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
  }

  /* ── Analyzing state ── */
  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center gap-5 py-10">
        {/* Spinner ring */}
        <div className="relative w-24 h-24">
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: 'rgba(13,148,136,0.06)' }}
          />
          <div
            className="absolute inset-2 rounded-full border-4 border-t-transparent"
            style={{
              borderColor: 'rgba(13,148,136,0.15)',
              borderTopColor: '#0d9488',
              animation: 'spin 0.9s linear infinite',
            }}
          />
          {/* Mic icon centered */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Mic className="w-7 h-7" style={{ color: '#0d9488', opacity: 0.6 }} />
          </div>
        </div>
        <div className="text-center">
          <p
            className="text-lg font-bold"
            style={{ fontFamily: 'Outfit, sans-serif', color: '#1f2937' }}
          >
            Analyzing your phonics...
          </p>
          <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
            This may take a few seconds
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Error message */}
      {error && (
        <div
          className="w-full max-w-sm rounded-2xl p-4 text-sm text-center animate-fade-in"
          style={{
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            color: '#e11d48',
          }}
        >
          {error}
        </div>
      )}

      {/* Instruction text */}
      <p
        className="text-sm text-center max-w-xs animate-fade-in"
        style={{ color: '#6b7280', fontFamily: 'Inter, sans-serif' }}
      >
        {isRecording
          ? 'Tap the button to stop when you\'re done'
          : 'Tap the microphone and read the paragraph aloud'}
      </p>

      {/* Mic Button with ripple rings */}
      <div className="relative flex items-center justify-center">
        {/* Ripple rings when recording */}
        {isRecording && (
          <>
            <div
              className="mic-ripple absolute rounded-full"
              style={{
                width: 130,
                height: 130,
                background: 'rgba(239, 68, 68, 0.25)',
              }}
            />
            <div
              className="mic-ripple-delayed absolute rounded-full"
              style={{
                width: 130,
                height: 130,
                background: 'rgba(239, 68, 68, 0.15)',
              }}
            />
          </>
        )}

        {/* Idle glow ring */}
        {!isRecording && (
          <div
            className="absolute rounded-full"
            style={{
              width: 110,
              height: 110,
              background: 'rgba(13, 148, 136, 0.08)',
              animation: 'gentlePulse 2.5s ease-in-out infinite',
            }}
          />
        )}

        <button
          id="record-btn"
          onClick={handleRecord}
          className="relative z-10 w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-xl cursor-pointer transition-transform duration-200"
          style={
            isRecording
              ? {
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  boxShadow: '0 8px 32px rgba(239,68,68,0.4)',
                  animation: 'recordingGlow 1.5s ease-in-out infinite',
                }
              : {
                  background: 'linear-gradient(135deg, #0d9488, #0f766e)',
                  boxShadow: '0 8px 32px rgba(13,148,136,0.35)',
                }
          }
          onMouseEnter={e => {
            if (!isRecording) {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.06) translateY(-2px)';
            }
          }}
          onMouseLeave={e => {
            if (!isRecording) {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1) translateY(0)';
            }
          }}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isRecording ? (
            <Square className="w-9 h-9 fill-white" />
          ) : (
            <Mic className="w-9 h-9" />
          )}
        </button>
      </div>

      {/* Timer when recording */}
      {isRecording && (
        <div className="text-center animate-fade-in">
          <p
            className="text-3xl font-extrabold tabular-nums"
            style={{ fontFamily: 'Outfit, sans-serif', color: '#ef4444', letterSpacing: '-0.02em' }}
          >
            {formatTime(recordingTime)}
          </p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: '#ef4444', animation: 'gentlePulse 1s ease-in-out infinite' }}
            />
            <p className="text-sm font-medium" style={{ color: '#6b7280' }}>
              Recording...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
