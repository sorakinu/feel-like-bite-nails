// Haptic feedback hook for sand drawing interaction
export const useHaptics = () => {
  const vibrate = (pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  const lightTap = () => vibrate(5);
  const mediumTap = () => vibrate(15);
  const heavyTap = () => vibrate(30);
  const sandScratch = () => vibrate([5, 10, 5, 10, 5]);

  return { vibrate, lightTap, mediumTap, heavyTap, sandScratch };
};
