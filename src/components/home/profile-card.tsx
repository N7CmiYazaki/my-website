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
  );
}
