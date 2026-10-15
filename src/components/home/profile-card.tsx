export function ProfileCard() {
  return (
    <aside class="profile-card" aria-label="プロフィール">
      <div class="profile-topline">
        <span>PROFILE</span>
        <span class="online-indicator"><span></span>こんにちは</span>
      </div>
      <div class="profile-person">
        <div class="avatar" role="img" aria-label="Miyazaki のプロフィールアイコン">
          <span>M</span>
          <i class="avatar-spark avatar-spark-one"></i>
          <i class="avatar-spark avatar-spark-two"></i>
        </div>
        <div class="profile-copy">
          <h2>Miyazaki</h2>
          <p>プログラミング・Webデザイン</p>
        </div>
      </div>
      <div class="profile-divider"></div>
      <p class="profile-note">
        自分のアイデアや感じたことなど<br class="desktop-break" />日々のノウハウをまとめていきます。<br class="desktop-break" />Web、デザイン、テクノロジーについて紹介します。
      </p>
      <div class="profile-tags">
        <span>Google Cloud</span>
        <span>Azure</span>
        <span>AWS</span>
        <span>Javascript</span>
        <span>TypeScript</span>
        <span>AI</span>
        <span>Figma</span>
      </div>
      <div class="profile-decoration" aria-hidden="true">
        <span></span><span></span><span></span><span></span>
      </div>
    </aside>
  );
}
