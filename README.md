# partner-portal-dashboard

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Project Structure

```
src/
├── assets/          # Static assets (images, global styles)
├── components/      # Reusable Vue components
├── composables/     # Composition API utilities
├── data/            # Mock data
├── locales/         # i18n translations (json files)
├── plugins/         # Vue plugins configuration
├── router/          # Vue Router configuration
├── services/        # API services and business logic
├── stores/          # Pinia state management
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── views/           # Page components
├── App.vue         # Root component
└── main.ts         # Application entry point
```

## Technology Stack & Architecture

### Technology Stack

- **Core Framework**: Vue.js 3.5
- **State Management**: Pinia
- **UI Framework/Styling**: Vuetify 3
- **Router**: Vue Router 4
- **Build Tooling**: Vite

### Architecture Overview
- Client-side Vue 3 application (SPA)
- Component-based UI structure
- Pinia-based global state management
- Client-side filtering, searching, and computed derivations
- Client-side pagination (slice-based, 10 items per page)
- Responsive UI behavior
- Mock API layer simulating backend responses
- Simulated WebSocket service for real-time updates

Explanation of taken decisions see in DECISIONS.md

## Some Approaches & Strategies Description

### Responsive Design Approach

- Mobile-first responsive layout using Vuetify 3 breakpoints
- Layout adapts for mobile, tablet, and desktop views
- Uses useDisplay() and Vuetify grid system for responsiveness
- Mobile (< 960px): card-based layout, bottom filter drawer
- Tablet (960–1280px): hybrid layout (cards + table behavior)
- Desktop (> 1280px): full data table with persistent filter sidebar
- Components dynamically adjust based on screen size (table vs cards, drawer behavior, pagination density)

### Internationalization (i18n) Implementation

- Vue I18n (Vue 3 Composition API mode)
- 4 supported languages: en, ja, de, es
- Translation files stored in /src/locales
- Reactive language switching across the entire UI
- Language preference persisted in localStorage
- $t() used for template translations, useI18n() for script logic
- Locale-aware formatting for dates and UI text

### Frontend Security

The application implements basic frontend security practices to mitigate common risks.

- XSS protection: input sanitization + Vue auto-escaping (v-html avoided)
- Safe dependency usage: only essential, regularly updated packages (npm audit supported)
- No sensitive data exposure: no secrets or tokens stored in frontend (only mock data / preferences)
- Secure error handling: user-facing errors are generic, technical details logged separately
- Authentication safety (best practice): tokens should be handled via httpOnly cookies (not localStorage)
- Environment variables used for configuration (.env, excluded from git)
- Role-based access control applied in UI logic (frontend-only simulation)


### AI Tools Usage

This project was developed using Claude Code (AI coding assistant) as a development support tool
for faster implementation, debugging, and documentation.

AI was used as a supporting tool, while all architectural decisions, feature design, 
and final implementations were defined and controlled by the developer.

Areas supported by AI:

- Code scaffolding and boilerplate generation (Vue components, stores, services)
- Debugging assistance and issue resolution
- UI component implementation (Vuetify-based layout)
- Mock API and WebSocket simulation
- Internationalization setup and translation generation
- Tests creation
- Documentation drafting and structuring
