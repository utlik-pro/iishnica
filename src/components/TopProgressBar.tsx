import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * Нативная полоска загрузки сверху страницы (в духе NProgress).
 * Показывается при переходах между страницами: заполняется и исчезает.
 */
const TopProgressBar: React.FC = () => {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    setProgress(12);
    const t1 = window.setTimeout(() => setProgress(65), 120);
    const t2 = window.setTimeout(() => setProgress(90), 320);
    const t3 = window.setTimeout(() => setProgress(100), 560);
    const t4 = window.setTimeout(() => setVisible(false), 820);
    const t5 = window.setTimeout(() => setProgress(0), 900);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
      window.clearTimeout(t5);
    };
  }, [location.pathname]);

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none">
      <div
        className="h-full bg-primary transition-[width,opacity] duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
          boxShadow: "0 0 10px hsl(var(--primary) / 0.8), 0 0 4px hsl(var(--primary))",
        }}
      />
    </div>
  );
};

export default TopProgressBar;
