import React, { useState, useRef } from 'react';
import { Send } from 'lucide-react';
import { useHaptics } from '@/hooks/useHaptics';

interface TextInputProps {
  onSubmit?: (text: string) => void;
}

const TextInput: React.FC<TextInputProps> = ({ onSubmit }) => {
  const [text, setText] = useState('');
  const [isAbsorbing, setIsAbsorbing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mediumTap } = useHaptics();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    mediumTap();
    setIsAbsorbing(true);

    setTimeout(() => {
      onSubmit?.(text);
      setText('');
      setIsAbsorbing(false);
    }, 800);
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`flex items-center gap-2 transition-all duration-300 ${
        isAbsorbing ? 'animate-absorb' : 'animate-fade-in-up'
      }`}
    >
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="想いを砂に..."
        className="sand-input w-48 text-sm"
        disabled={isAbsorbing}
      />
      <button
        type="submit"
        disabled={!text.trim() || isAbsorbing}
        className="sand-button p-3 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="送信"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
};

export default TextInput;
