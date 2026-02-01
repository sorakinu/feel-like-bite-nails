import React from 'react';
import { Wind } from 'lucide-react';
import { useSandSound } from '@/hooks/useSandSound';
import { useHaptics } from '@/hooks/useHaptics';

interface WindButtonProps {
  onClear: () => void;
}

const WindButton: React.FC<WindButtonProps> = ({ onClear }) => {
  const { playWindSound } = useSandSound();
  const { heavyTap } = useHaptics();

  const handleClick = () => {
    playWindSound();
    heavyTap();
    onClear();
  };

  return (
    <button
      onClick={handleClick}
      className="sand-button flex items-center gap-2 animate-fade-in-up"
      aria-label="風でならす"
    >
      <Wind className="w-5 h-5" />
      <span className="text-sm font-light tracking-wider">風でならす</span>
    </button>
  );
};

export default WindButton;
