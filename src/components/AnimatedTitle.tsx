import { useState, useEffect } from 'react';

const AnimatedTitle = () => {
  const words = ['энтузиастов', 'практиков', 'предпринимателей', 'новаторов', 'единомышленников'];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const currentWord = words[currentWordIndex];

    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, 1500);
      return () => clearTimeout(pauseTimer);
    }

    const typingSpeed = isDeleting ? 50 : 100;

    if (!isDeleting && displayText === currentWord) {
      setIsPaused(true);
      return;
    }

    if (isDeleting && displayText === '') {
      setIsDeleting(false);
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timer = setTimeout(() => {
      setDisplayText(prev => {
        if (isDeleting) {
          return currentWord.substring(0, prev.length - 1);
        } else {
          return currentWord.substring(0, prev.length + 1);
        }
      });
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, currentWordIndex, isPaused, words]);

  return (
    <span className="gradient-text">
      Клуб ИИ-{displayText}
      <span className="animate-blink inline-block w-[0.06em] h-[0.9em] bg-primary ml-1 align-middle rounded-full" style={{ transform: 'translateY(-0.05em)' }}></span>
    </span>
  );
};

export default AnimatedTitle;
