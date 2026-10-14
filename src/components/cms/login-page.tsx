type LoginPageProps = {
  error?: string;
};

export function LoginPage({ error = "" }: LoginPageProps) {
  return (
    <main class="page-width cms-main">
      <section class="cms-panel login-panel">
        <p class="eyebrow">ADMINISTRATOR</p>
        <h1>管理画面にログイン</h1>
        <p class="cms-intro">記事を編集するには管理者パスワードを入力してください。</p>
        {error && <p class="form-error" role="alert">{error}</p>}
        <form action="/admin/login" method="post" class="cms-form">
          <label>
            管理者パスワード
            <input name="password" type="password" autocomplete="current-password" required />
          </label>
          <button class="button button-primary" type="submit">ログイン</button>
        </form>
      </section>
    </main>
  );
}
