# Cover to Cover — web

Marketing and legal site for **Cover to Cover**, the book discovery app where
you swipe through covers and match with your next read. Built with
[Expo](https://expo.dev) + [expo-router](https://docs.expo.dev/router/introduction)
and exported as a static site.

## Pages

| Route             | What it is                                            |
| ----------------- | ----------------------------------------------------- |
| `/`               | Landing page — tagline and App Store link             |
| `/about`          | Mission and how the app works                         |
| `/privacy`        | Privacy policy                                        |
| `/support`        | Contact — help@covertocoverapp.com                    |
| `/auth`           | Supabase auth redirect target (password recovery)     |
| `/reset-password` | Where `/auth` lands after a recovery link signs you in |

## Develop

```bash
npm install
npx expo start --web
```

Supabase credentials come from `.env` (git-ignored):

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

The client is created lazily, so a build without them still succeeds — only the
auth redirect degrades.

## Build

```bash
npx expo export --platform web --output-dir dist
```

## Deploy

`scripts/deploy.sh` runs on the server (safe to cron): it fetches `origin/main`,
rebuilds only when the deployed commit differs, and updates `dist/` in place so
the nginx bind mount stays valid.
