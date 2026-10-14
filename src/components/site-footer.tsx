type SiteLink = {
  href: string;
  label: string;
};

type SiteFooterProps = {
  brand: string;
  mark: string;
  links: SiteLink[];
};

export function SiteFooter({ brand, mark, links }: SiteFooterProps) {
  return (
    <footer class="site-footer">
      <a class="wordmark footer-wordmark" href="/">
        <span class="wordmark-mark" aria-hidden="true">{mark}</span>
        <span>{brand}</span>
      </a>
      <p>Made with curiosity <span aria-hidden="true">✳</span></p>
      {links.map((link) => <a class="back-to-top" href={link.href}>{link.label}</a>)}
    </footer>
  );
}
