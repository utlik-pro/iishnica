const BOT_USER_AGENTS = [
  "Twitterbot",
  "facebookexternalhit",
  "TelegramBot",
  "LinkedInBot",
  "Slackbot",
  "WhatsApp",
  "Discordbot",
  "vkShare",
  "Pinterest",
];

export default async function middleware(request) {
  const userAgent = request.headers.get("user-agent") || "";
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Only process blog post pages (not /blog itself)
  if (pathname.startsWith("/blog/") && pathname !== "/blog/") {
    const isBot = BOT_USER_AGENTS.some((bot) =>
      userAgent.toLowerCase().includes(bot.toLowerCase())
    );

    if (isBot) {
      // Rewrite to API endpoint for bots
      const slug = pathname.replace("/blog/", "");
      url.pathname = `/api/blog/${slug}`;
      return fetch(url.toString(), {
        headers: request.headers,
      });
    }
  }
}

export const config = {
  matcher: ["/blog/:path*"],
};
