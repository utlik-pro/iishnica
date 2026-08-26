/**
 * Отправка событий в подключённые системы аналитики.
 *
 * Пиксели живут в таблице `tracking_pixels` и подключаются компонентом
 * TrackingPixels — сейчас активен Meta, но TikTok и Google-тег включаются
 * из админки в любой момент. Поэтому событие уходит во все три сразу:
 * какой системы нет на странице, в ту просто ничего не отправится.
 */

type TrackParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    fbq?: (command: string, name: string, params?: TrackParams) => void;
    ttq?: { track?: (name: string, params?: TrackParams) => void };
    gtag?: (command: string, name: string, params?: TrackParams) => void;
  }
}

/**
 * Стандартные события Meta. Их можно выбрать целью рекламной кампании,
 * поэтому для них шлём `track`, а для остальных — `trackCustom`:
 * нестандартное имя, отправленное через `track`, Meta молча игнорирует.
 */
const META_STANDARD = new Set([
  "Lead",
  "Contact",
  "ViewContent",
  "CompleteRegistration",
  "Subscribe",
  "InitiateCheckout",
]);

export function trackEvent(name: string, params: TrackParams = {}) {
  if (typeof window === "undefined") return;

  try {
    window.fbq?.(META_STANDARD.has(name) ? "track" : "trackCustom", name, params);
    window.ttq?.track?.(name, params);
    window.gtag?.("event", name, params);
  } catch {
    // аналитика не должна ронять страницу, если пиксель отвалился
  }

  if (import.meta.env.DEV) {
    // в разработке пикселей нет — печатаем, чтобы события можно было проверить
    console.info("[analytics]", name, params);
  }
}
