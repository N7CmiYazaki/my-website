import { Hono } from "hono";

type Bindings = {
  ASSETS: Fetcher;
  DB: D1Database;
  FILES: R2Bucket;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) =>
  c.html(
    <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Yazaki のプロフィールサイト。Web、デザイン、テクノロジーについて紹介します。"
        />
        <link rel="stylesheet" href="/styles.css" />
        <title>Yazaki — Profile</title>
      </head>
      <body>
        <header class="site-header">
          <a class="wordmark" href="/" aria-label="Yazaki ホーム">
            <span class="wordmark-mark" aria-hidden="true">Y</span>
            <span>Yazaki</span>
          </a>
          <nav class="site-nav" aria-label="メインナビゲーション">
            <a href="#about">プロフィール</a>
            <a href="#interests">興味のあること</a>
          </nav>
        </header>

        <main id="top">
          <section class="hero page-width" aria-labelledby="hero-title">
            <div class="hero-copy">
              <p class="eyebrow"><span class="eyebrow-dot"></span>MY LITTLE CORNER OF THE WEB</p>
              <h1 id="hero-title">好奇心のままに、<br /><span>つくってみる。</span></h1>
              <p class="hero-description">
                Webとデザインが好きな Yazaki の小さなプロフィールサイトです。
                気になったことを学びながら、少しずつ形にしています。
              </p>
              <a class="text-link" href="#about">
                もう少し知る <span aria-hidden="true">↘</span>
              </a>
            </div>

            <aside class="profile-card" aria-label="プロフィール">
              <div class="profile-topline">
                <span>PROFILE</span>
                <span class="online-indicator"><span></span>こんにちは</span>
              </div>
              <div class="profile-person">
                <div class="avatar" role="img" aria-label="Yazaki のプロフィールアイコン">
                  <span>Y</span>
                  <i class="avatar-spark avatar-spark-one"></i>
                  <i class="avatar-spark avatar-spark-two"></i>
                </div>
                <div class="profile-copy">
                  <h2>Yazaki</h2>
                  <p>Web・デザイン・テクノロジー</p>
                </div>
              </div>
              <div class="profile-divider"></div>
              <p class="profile-note">
                日々の発見や、つくったものを<br class="desktop-break" />ここにまとめていきます。
              </p>
              <div class="profile-tags">
                <span>Curious</span>
                <span>Creative</span>
                <span>Always learning</span>
              </div>
              <div class="profile-decoration" aria-hidden="true">
                <span></span><span></span><span></span><span></span>
              </div>
            </aside>
            <div class="hero-orbit orbit-one" aria-hidden="true"></div>
            <div class="hero-orbit orbit-two" aria-hidden="true"></div>
          </section>

          <section class="intro-section page-width" id="about" aria-labelledby="about-title">
            <div class="section-heading">
              <p class="eyebrow">A LITTLE ABOUT ME</p>
              <h2 id="about-title">好きなことを、<br class="mobile-break" />好きなペースで。</h2>
            </div>
            <p class="intro-text">
              アイデアを試して、うまくいかなかったらまた考える。
              そんなプロセスを楽しんでいます。このサイトもそのひとつ。
              これから少しずつ、自分らしい場所に育てていく予定です。
            </p>
          </section>

          <section class="interests-section page-width" id="interests" aria-labelledby="interests-title">
            <div class="interests-heading">
              <div>
                <p class="eyebrow">THINGS I LIKE</p>
                <h2 id="interests-title">最近、気になること</h2>
              </div>
              <span class="heading-spark" aria-hidden="true">✳</span>
            </div>
            <div class="interest-grid">
              <article class="interest-card interest-blue">
                <span class="interest-number">01</span>
                <div class="interest-icon" aria-hidden="true">⌘</div>
                <h3>Webをつくる</h3>
                <p>使いやすくて、心地よいWebのこと。</p>
                <span class="card-arrow" aria-hidden="true">↗</span>
              </article>
              <article class="interest-card interest-yellow">
                <span class="interest-number">02</span>
                <div class="interest-icon" aria-hidden="true">◉</div>
                <h3>デザインを考える</h3>
                <p>色や形で、伝わり方を工夫すること。</p>
                <span class="card-arrow" aria-hidden="true">↗</span>
              </article>
              <article class="interest-card interest-green">
                <span class="interest-number">03</span>
                <div class="interest-icon" aria-hidden="true">✳</div>
                <h3>新しいことを学ぶ</h3>
                <p>知らなかった世界をのぞいてみること。</p>
                <span class="card-arrow" aria-hidden="true">↗</span>
              </article>
            </div>
          </section>

          <section class="closing page-width">
            <p>ここまで読んでくれて、ありがとうございます。</p>
            <span aria-hidden="true">✳</span>
          </section>
        </main>

        <footer class="site-footer">
          <a class="wordmark footer-wordmark" href="/">
            <span class="wordmark-mark" aria-hidden="true">Y</span>
            <span>Yazaki</span>
          </a>
          <p>Made with curiosity <span aria-hidden="true">✳</span></p>
          <a class="back-to-top" href="#top">
            Back to top ↑
          </a>
        </footer>
      </body>
    </html>,
  ),
);

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
