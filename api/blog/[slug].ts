import type { VercelRequest, VercelResponse } from "@vercel/node";

const SUPABASE_URL = "https://ndpkxustvcijykzxqxrn.supabase.co";
const SUPABASE_KEY = "sb_publishable_SBb7mMchz99ZIfoPgnxQDQ_bbQpePNZ";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;

  if (!slug || typeof slug !== "string") {
    return res.status(400).json({ error: "Missing slug" });
  }

  try {
    // Fetch post from Supabase
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/posts?slug=eq.${encodeURIComponent(slug)}&is_published=eq.true&select=title,excerpt,featured_image_url,og_image_url,meta_title,meta_description,author,published_at`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    const posts = await response.json();

    if (!posts || posts.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    const post = posts[0];
    const baseUrl = "https://iishnica.utlik.co";

    const title = post.meta_title || post.title;
    const description = post.meta_description || post.excerpt || "Публикация от M.AI.N Community";
    const image = post.og_image_url || post.featured_image_url || `${baseUrl}/og-image.png`;
    const url = `${baseUrl}/blog/${slug}`;

    // Return HTML with correct OG meta tags for bots
    const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)} | M.AI.N - AI Community</title>
  <meta name="description" content="${escapeHtml(description)}" />

  <!-- OpenGraph -->
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="article" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${escapeHtml(url)}" />
  <meta property="og:site_name" content="M.AI.N - AI Community" />
  <meta property="og:locale" content="ru_RU" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(image)}" />

  <link rel="canonical" href="${escapeHtml(url)}" />
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
  <p><a href="${escapeHtml(url)}">Читать полностью</a></p>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
    return res.status(200).send(html);
  } catch (error) {
    console.error("Error fetching post:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

function escapeHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
