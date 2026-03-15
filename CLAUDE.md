# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

This is an **Expo React Native** app using **expo-router** for file-based routing, targeting Android, iOS, and web.

### Routing

Routes live in `app/`. The root layout (`app/_layout.tsx`) sets up a `Stack` navigator with React Navigation theming. The main content is under `app/(tabs)/` with a bottom-tab navigator. A `modal` route is registered at the root stack level.

### State & Data

- **Zustand** for global client state
- **expo-sqlite** for local persistence (configured as an Expo plugin in `app.json`)
- **@supabase/supabase-js** for backend/auth
- **react-hook-form + Zod** for form validation

### Key Libraries

- **victory-native** for charts (uses react-native-reanimated + react-native-worklets)
- **dayjs** for date handling
- **@expo/vector-icons** for icons

### Theming

Colors are defined in `constants/theme.ts` (exports `Colors` for light/dark and `Fonts` per platform). Components consume the color scheme via `hooks/use-color-scheme.ts` (with a web-specific override at `hooks/use-color-scheme.web.ts`) and `hooks/use-theme-color.ts`.

### Aliases & TypeScript

`@/` maps to the project root (e.g. `import { Colors } from '@/constants/theme'`). TypeScript strict mode is enabled.

### Expo Config

- New Architecture enabled (`newArchEnabled: true`)
- React Compiler enabled (`experiments.reactCompiler: true`)
- Typed routes enabled (`experiments.typedRoutes: true`)
- Deep link scheme: `finanzasapp`
