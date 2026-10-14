import { ProfileCard } from "./profile-card";

export function HeroSection() {
  return (
    <section class="hero page-width" aria-labelledby="hero-title">
      <div class="hero-copy">
        <p class="eyebrow"><span class="eyebrow-dot"></span>MY LITTLE CORNER OF THE WEB</p>
        <h1 id="hero-title">好奇心のままに、<br /><span>つくってみる。</span></h1>
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
