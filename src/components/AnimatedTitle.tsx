import { useState, useEffect } from 'react';

const AnimatedTitle = () => {
  const words = ['завтраков', 'ужинов', 'обедов', 'бранчей'];
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
    <div className="text-4xl md:text-6xl font-bold text-center">
      <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Клуб ИИ-{displayText}
        <span className="animate-blink inline-block w-[2px] h-[1em] bg-purple-600 ml-1 align-middle" style={{ transform: 'translateY(-0.05em)' }}></span>
      </span>
    </div>
  );
};

export default AnimatedTitle;
