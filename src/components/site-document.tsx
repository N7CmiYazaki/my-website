import type { JSX } from "hono/jsx/jsx-runtime";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

type SiteLink = {
  href: string;
  label: string;
};

type SiteDocumentProps = {
  title: string;
  description?: string;
  brand: string;
  mark: string;
  headerLinks: SiteLink[];
  footerLinks: SiteLink[];
  children: JSX.Element;
};

export function SiteDocument({
  title,
  description = title,
  brand,
  mark,
  headerLinks,
  footerLinks,
  children,
}: SiteDocumentProps) {
  return (
    <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={description} />
        <link rel="stylesheet" href="/styles.css" />
        <script src="/hero-animation.js" defer></script>
        <script src="/interest-carousel.js" defer></script>
        <title>{title}</title>
      </head>
      <body>
        <SiteHeader brand={brand} mark={mark} links={headerLinks} />
        {children}
        <SiteFooter brand={brand} mark={mark} links={footerLinks} />
      </body>
    </html>
  );
}
