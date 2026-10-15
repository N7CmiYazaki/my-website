import { ProfileCard } from "./profile-card";

export function HeroSection() {
  return (
    <section class="hero page-width" aria-labelledby="hero-title">
      <canvas class="hero-grid" aria-hidden="true"></canvas>
      <div class="hero-copy">
        <p class="eyebrow"><span class="eyebrow-dot"></span>MY LITTLE CORNER OF THE WEB</p>
        <h1 id="hero-title" aria-label="好奇心のままに、つくってみる。">
          <span data-typewriter aria-hidden="true">好奇心のままに、</span>
          <br />
          <span class="hero-title-accent" data-typewriter aria-hidden="true">つくってみる。</span>
          <span class="hero-caret" aria-hidden="true"></span>
        </h1>
        <p class="hero-description">
          Webとデザインが好きな Miyazaki の小さなプロフィールサイトです。
          気になったことを学びながら、少しずつ形にしています。
        </p>
        <a class="text-link" href="#about">
          もう少し知る <span aria-hidden="true">↘</span>
        </a>
      </div>
      <ProfileCard />
      <div class="hero-orbit orbit-one" aria-hidden="true"></div>
      <div class="hero-orbit orbit-two" aria-hidden="true"></div>
    </section>
  );
}
