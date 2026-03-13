import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";

interface TrackingPixel {
  id: number;
  page_slug: string;
  pixel_type: string;
  pixel_id: string;
  is_active: boolean;
}

export function TrackingPixels({ pageSlug = "home" }: { pageSlug?: string }) {
  const [pixels, setPixels] = useState<TrackingPixel[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await (supabase as any)
        .from("tracking_pixels")
        .select("*")
        .eq("is_active", true)
        .in("page_slug", [pageSlug, "all"]);

      if (data) setPixels(data);
    };
    fetch();
  }, [pageSlug]);

  if (pixels.length === 0) return null;

  const fbPixels = pixels.filter((p) => p.pixel_type === "facebook");
  const ttPixels = pixels.filter((p) => p.pixel_type === "tiktok");
  const gaPixels = pixels.filter((p) => p.pixel_type === "google");

  const scripts: string[] = [];

  // Facebook / Meta Pixel
  for (const px of fbPixels) {
    scripts.push(`
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${px.pixel_id}');
      fbq('track', 'PageView');
    `);
  }

  // TikTok Pixel
  for (const px of ttPixels) {
    scripts.push(`
      !function (w, d, t) {
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
        ttq.load('${px.pixel_id}');
        ttq.page();
      }(window, document, 'ttq');
    `);
  }

  // Google Tag (gtag.js)
  for (const px of gaPixels) {
    scripts.push(`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${px.pixel_id}');
    `);
  }

  return (
    <Helmet>
      {/* Google Tag external script */}
      {gaPixels.map((px) => (
        <script
          key={`ga-ext-${px.id}`}
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${px.pixel_id}`}
        />
      ))}

      {/* All pixel init scripts */}
      {scripts.map((s, i) => (
        <script key={`px-${i}`}>{s}</script>
      ))}

      {/* Facebook noscript fallbacks */}
      {fbPixels.map((px) => (
        <noscript key={`fb-ns-${px.id}`}>
          {`<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${px.pixel_id}&ev=PageView&noscript=1" />`}
        </noscript>
      ))}
    </Helmet>
  );
}
