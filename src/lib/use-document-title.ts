import { useEffect } from "react";

/**
 * Ставит заголовок вкладки.
 *
 * Зачем отдельный хук, если в проекте есть react-helmet-async: он в текущей
 * сборке молча не применяет теги — в DOM нет ни одного элемента с его
 * пометкой `data-rh`, заголовок остаётся тот, что пришёл в index.html.
 * Раньше это не мешало, потому что главная страница и статические теги
 * совпадали. Теперь на «/» партнёрский лендинг, и прежние версии сайта
 * унаследовали бы его заголовок при переходе по ссылке.
 *
 * Мета-описание и og-теги для краулеров приходят из статических HTML
 * (scripts/og-routes.mjs) — им JavaScript не нужен.
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
