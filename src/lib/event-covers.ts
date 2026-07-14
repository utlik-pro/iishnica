/**
 * Обложки страниц событий, привязанные к slug события.
 *
 * Файлы кладём в public/covers/<имя>. Если для события нет записи здесь и
 * нет cover_image_url в БД — используется дефолтное /og-image.png.
 *
 * Чтобы добавить обложку: положи файл в public/covers/ и добавь строку
 *   "<slug-события>": "/covers/<файл>",
 */
export const EVENT_COVERS: Record<string, string> = {
  "iishnica-12": "/covers/iishnica-12.jpg",
};

export const getEventCover = (slug?: string | null): string | undefined =>
  slug ? EVENT_COVERS[slug] : undefined;
