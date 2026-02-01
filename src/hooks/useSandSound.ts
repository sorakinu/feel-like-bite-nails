import { useRef, useCallback, useEffect } from 'react';

// Sand scratching sound using Web Audio API
export const useSandSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const isPlayingRef = useRef(false);

  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const createNoiseBuffer = useCallback((context: AudioContext) => {
    const bufferSize = context.sampleRate * 0.5;
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Brown noise for sand-like sound
      output[i] = (Math.random() * 2 - 1) * 0.5;
    }

    return buffer;
  }, []);

  const startSound = useCallback(() => {
    if (isPlayingRef.current) return;

    const context = initAudio();
    if (context.state === 'suspended') {
      context.resume();
    }

    const noiseBuffer = createNoiseBuffer(context);
    
    noiseNodeRef.current = context.createBufferSource();
    noiseNodeRef.current.buffer = noiseBuffer;
    noiseNodeRef.current.loop = true;

    // Filter to make it sound more like sand
    filterNodeRef.current = context.createBiquadFilter();
    filterNodeRef.current.type = 'lowpass';
    filterNodeRef.current.frequency.value = 800;
    filterNodeRef.current.Q.value = 1;

    // Gain control
    gainNodeRef.current = context.createGain();
    gainNodeRef.current.gain.value = 0;

    noiseNodeRef.current.connect(filterNodeRef.current);
    filterNodeRef.current.connect(gainNodeRef.current);
    gainNodeRef.current.connect(context.destination);

    noiseNodeRef.current.start();
    
    // Fade in
    gainNodeRef.current.gain.linearRampToValueAtTime(0.15, context.currentTime + 0.05);
    
    isPlayingRef.current = true;
  }, [initAudio, createNoiseBuffer]);

  const stopSound = useCallback(() => {
    if (!isPlayingRef.current || !gainNodeRef.current || !audioContextRef.current) return;

    const context = audioContextRef.current;
    
    // Fade out
    gainNodeRef.current.gain.linearRampToValueAtTime(0, context.currentTime + 0.1);

    setTimeout(() => {
      if (noiseNodeRef.current) {
        try {
          noiseNodeRef.current.stop();
          noiseNodeRef.current.disconnect();
        } catch (e) {
          // Already stopped
        }
        noiseNodeRef.current = null;
      }
      isPlayingRef.current = false;
    }, 150);
  }, []);

  const playWindSound = useCallback(() => {
    const context = initAudio();
    if (context.state === 'suspended') {
      context.resume();
    }

    const duration = 1.5;
    const bufferSize = context.sampleRate * duration;
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const output = buffer.getChannelData(0);

    // Wind-like white noise with envelope
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      const envelope = Math.sin(t * Math.PI) * 0.3;
      output[i] = (Math.random() * 2 - 1) * envelope;
    }

    const source = context.createBufferSource();
    source.buffer = buffer;

    const filter = context.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400;
    filter.Q.value = 0.5;

    const gain = context.createGain();
    gain.gain.value = 0.2;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);

    source.start();
    source.stop(context.currentTime + duration);
  }, [initAudio]);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return { startSound, stopSound, playWindSound };
};
