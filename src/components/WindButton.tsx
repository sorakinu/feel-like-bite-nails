import React from 'react';
import { Wind } from 'lucide-react';
import { useSandSound } from '@/hooks/useSandSound';
import { useHaptics } from '@/hooks/useHaptics';
import { useLanguage } from '@/hooks/useLanguage';

interface WindButtonProps {
  onClear: () => void;
}

const WindButton: React.FC<WindButtonProps> = ({ onClear }) => {
  const { playWindSound } = useSandSound();
  const { heavyTap } = useHaptics();
  const { t } = useLanguage();

  const handleClick = () => {
    playWindSound();
    heavyTap();
    onClear();
  };

  return (
    <button
      onClick={handleClick}
      className="sand-button flex items-center gap-2 animate-fade-in-up"
      aria-label={t('smoothWithWind')}
    >
      <Wind className="w-5 h-5" />
      <span className="text-sm font-light tracking-wider">{t('smoothWithWind')}</span>
    </button>
  );
};

export default WindButton;
