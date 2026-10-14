export type Bindings = {
  ASSETS: Fetcher;
  DB: D1Database;
  FILES: R2Bucket;
  ADMIN_PASSWORD?: string;
  ADMIN_SESSION_SECRET?: string;
};
