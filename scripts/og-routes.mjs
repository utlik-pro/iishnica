/**
 * Отдельные OG-превью для маршрутов SPA.
 *
 * Зачем: краулеры соцсетей (Telegram, Meta, WhatsApp) не выполняют JavaScript.
 * Они читают тот HTML, что отдал сервер, поэтому теги, которые проставляет
 * react-helmet уже в браузере, до них не доходят — при шеринге любой страницы
 * подтягивалось бы общее превью сайта.
 *
 * Решение: после сборки кладём рядом с index.html его копии с подменёнными
 * мета-тегами, а в vercel.json заворачиваем нужный путь на такую копию.
 * Человек получает то же самое приложение (бандл тот же, роутер сам покажет
 * нужную страницу), а бот — правильные заголовок и картинку.
 *
 * Чтобы добавить маршрут: допиши запись в ROUTES и правило rewrite
 * в vercel.json ВЫШЕ общего catch-all.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const SITE = "https://iishnica.utlik.co";
const DIST = "dist";

const ROUTES = [
  {
    file: "v3.html",
    url: `${SITE}/v3`,
    title: "Партнёрство с ИИшницей — сезон 2026/2027",
    description:
      "Ваш бренд — перед 235 собственниками и руководителями за один вечер. " +
      "10 офлайн-встреч за сезон, до 800 человек в зале. Пакеты от 2 000 BYN.",
    image: `${SITE}/v3/og-partners.jpg`,
  },
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const indexPath = join(DIST, "index.html");
if (!existsSync(indexPath)) {
  console.error(`[og-routes] ${indexPath} не найден — сборка не выполнена?`);
  process.exit(1);
}

const template = readFileSync(indexPath, "utf8");

for (const r of ROUTES) {
  let html = template;

  // выкидываем исходные title и все og/twitter-теги, чтобы не было дублей:
  // при двух og:image краулер возьмёт произвольный
  html = html
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/[ \t]*<meta[^>]+(property|name)="(og:[^"]+|twitter:[^"]+)"[^>]*>\s*/gi, "")
    .replace(/[ \t]*<meta[^>]+name="description"[^>]*>\s*/gi, "")
    .replace(/[ \t]*<link[^>]+rel="canonical"[^>]*>\s*/gi, "");

  const tags = `
    <title>${esc(r.title)}</title>
    <meta name="description" content="${esc(r.description)}" />
    <link rel="canonical" href="${r.url}" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="ru_RU" />
    <meta property="og:site_name" content="ИИшница · M.AI.N Community" />
    <meta property="og:url" content="${r.url}" />
    <meta property="og:title" content="${esc(r.title)}" />
    <meta property="og:description" content="${esc(r.description)}" />
    <meta property="og:image" content="${r.image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${esc(r.title)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(r.title)}" />
    <meta name="twitter:description" content="${esc(r.description)}" />
    <meta name="twitter:image" content="${r.image}" />
`;

  html = html.replace(/<\/head>/i, `${tags}  </head>`);
  writeFileSync(join(DIST, r.file), html);
  console.log(`[og-routes] ${r.file} → ${r.image}`);
}
