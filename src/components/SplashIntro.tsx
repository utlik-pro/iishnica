import React, { useEffect, useRef, useState } from "react";

/**
 * Видео-заставка (интро) вместо спиннера загрузки.
 * Проигрывается один раз за сессию, затем плавно раскрывает сайт.
 * Работает на десктопе и мобиле (muted + playsInline автоплей).
 */
const SplashIntro: React.FC = () => {
  const [show, setShow] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    if (window.location.pathname.startsWith("/admin")) return false;
    try {
      return !sessionStorage.getItem("introSeen");
    } catch {
      return true;
    }
  });
  const [fading, setFading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const dismissedRef = useRef(false);

  const dismiss = () => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    try {
      sessionStorage.setItem("introSeen", "1");
    } catch {
      /* ignore */
    }
    setFading(true);
    window.setTimeout(() => setShow(false), 600);
  };

  useEffect(() => {
    if (!show) return;
    // не даём странице скроллиться под заставкой
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // страховка: если видео не доиграет/зависнет — раскрываем сайт
    const safety = window.setTimeout(dismiss, 40000);

    // на всякий случай пробуем запустить воспроизведение
    videoRef.current?.play?.().catch(() => {});

    return () => {
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(safety);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center transition-opacity duration-500 ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        src="/intro.mp4"
        poster="/intro-poster.jpg"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={dismiss}
        onError={dismiss}
      />

      <button
        onClick={dismiss}
        className="absolute bottom-6 right-6 md:bottom-8 md:right-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 backdrop-blur-md px-5 py-2.5 text-sm font-semibold text-white/90 hover:bg-white/10 transition-colors"
        aria-label="Пропустить заставку"
      >
        Пропустить
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
};

export default SplashIntro;
