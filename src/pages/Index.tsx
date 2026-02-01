import React, { useState, useCallback } from 'react';
import SandCanvas from '@/components/SandCanvas';
import WindButton from '@/components/WindButton';
import TextInput from '@/components/TextInput';

const Index = () => {
  const [clearTrigger, setClearTrigger] = useState(0);
  const [messages, setMessages] = useState<string[]>([]);

  const handleClear = useCallback(() => {
    setClearTrigger(prev => prev + 1);
  }, []);

  const handleTextSubmit = useCallback((text: string) => {
    // Store the message (for future AI integration)
    setMessages(prev => [...prev, text]);
    console.log('Message absorbed into sand:', text);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      {/* Sand drawing canvas */}
      <SandCanvas onClear={handleClear} clearTrigger={clearTrigger} />

      {/* UI Controls */}
      <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col items-center gap-4 pointer-events-none">
        {/* Text input in corner */}
        <div className="self-end mr-2 pointer-events-auto">
          <TextInput onSubmit={handleTextSubmit} />
        </div>

        {/* Wind button centered at bottom */}
        <div className="pointer-events-auto">
          <WindButton onClear={handleClear} />
        </div>
      </div>

      {/* Subtle instruction hint */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-none">
        <p className="text-muted-foreground/60 text-lg md:text-xl tracking-[0.3em] font-light animate-fade-in-up">
          指でなぞって砂に描く
        </p>
      </div>
    </div>
  );
};

export default Index;
