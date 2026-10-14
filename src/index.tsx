import { Hono } from "hono";
import { AboutSection } from "./components/home/about-section";
import { ClosingSection } from "./components/home/closing-section";
import { HeroSection } from "./components/home/hero-section";
import { InterestsSection } from "./components/home/interests-section";
import { SiteDocument } from "./components/site-document";
import cms from "./cms";
import type { Bindings } from "./env";
import type { InterestArticle } from "./types/article";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", async (c) => {
  const { results: articles } = await c.env.DB.prepare(
    "SELECT id, title, excerpt, icon, theme FROM articles WHERE published = 1 ORDER BY sort_order, created_at DESC",
  ).all<InterestArticle>();

  return c.html(
    <SiteDocument
      title="Miyazaki — Profile"
      description="Miyazaki のプロフィールサイト。Web、デザイン、テクノロジーについて紹介します。"
      brand="Miyazaki"
      mark="M"
      headerLinks={[
        { href: "#about", label: "プロフィール" },
        { href: "#interests", label: "興味のあること" },
      ]}
      footerLinks={[
        { href: "#top", label: "Back to top ↑" },
        { href: "/admin", label: "管理画面" },
      ]}
    >
      <main id="top">
        <HeroSection />
        <AboutSection />
        <InterestsSection articles={articles} />
        <ClosingSection />
      </main>
    </SiteDocument>,
  );
});

app.route("/", cms);

app.get("/api/health", async (c) => {
  const result = await c.env.DB.prepare("SELECT 1 AS connected").first<{
    connected: number;
  }>();

  if (result?.connected !== 1) {
    return c.json({ status: "error", service: "D1" }, 503);
  }

  await c.env.FILES.list({ limit: 1 });

  return c.json({ status: "ok", d1: "connected", r2: "connected" });
});

app.notFound((c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
