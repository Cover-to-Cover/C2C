// constants/links.ts
export const APP_STORE_URL =
  "https://apps.apple.com/us/app/halalfinders/id6758252277";

/** Custom scheme registered by the mobile app (app.json "scheme"). */
export const APP_SCHEME = "halalfinders://";

export function appDeepLink(path: string) {
  return `${APP_SCHEME}${path.replace(/^\//, "")}`;
}
