type SiteLink = {
  href: string;
  label: string;
};

type SiteHeaderProps = {
  brand: string;
  mark: string;
  links: SiteLink[];
};

export function SiteHeader({ brand, mark, links }: SiteHeaderProps) {
  return (
    <header class="site-header">
      <a class="wordmark" href="/" aria-label={`${brand} ホーム`}>
        <span class="wordmark-mark" aria-hidden="true">{mark}</span>
        <span>{brand}</span>
      </a>
      <nav class="site-nav" aria-label="メインナビゲーション">
        {links.map((link) => <a href={link.href}>{link.label}</a>)}
      </nav>
    </header>
  );
}
