# 24-Hour Execution Plan

## Quick Reference

**Total Time**: 24 hours (3 days × 8 hours)
**Project**: Partner Portal Deal Management Dashboard
**Framework**: Vue 3 + TypeScript + Vuetify (Material Design)

## Day 1: Foundation + Core (8 hours)

### Block 1: Foundation (Hours 0-4)
- [ ] Project setup (Vue 3, Vite, Vuetify, Pinia, Router, i18n)
- [ ] Create `/src/types/index.ts` with Deal, Status, Filter interfaces
- [ ] Generate `/src/data/mockDeals.json` with 50-100 deals
- [ ] Create `/src/stores/dealStore.ts` with Pinia store
- [ ] Implement deduplication logic using Map

**Checkpoint**: Store working with mock data, deduplication tested

### Block 2: Core Features (Hours 4-9)
- [ ] Create `/src/components/DealList.vue` using `v-data-table`
- [ ] Create `/src/components/DealCard.vue` using `v-card` (mobile view)
- [ ] Create `/src/views/DealListView.vue`
- [ ] Create `/src/views/DealDetailView.vue` with `v-card`
- [ ] Add pagination using `v-pagination` component
- [ ] Create `/src/services/api.ts` with mock API
- [ ] Add loading states with `v-progress-circular`
- [ ] Add empty states with `v-empty-state` or custom message

**Checkpoint**: Navigate between list and details, pagination works

---

## Day 2: Search, Filters & UX (8 hours)

### Block 3: Search & Filters (Hours 9-14)
- [ ] Create `/src/components/SearchBar.vue` using `v-text-field` with debounce (300ms)
- [ ] Create `/src/composables/useDebounce.ts`
- [ ] Add search logic to store (multi-field, case-insensitive, trim)
- [ ] Create `/src/components/FilterPanel.vue` using `v-navigation-drawer`
- [ ] Status filter using `v-select` with `multiple` and `chips`
- [ ] Amount filter using two `v-text-field` components (min/max)
- [ ] Date range filter using `v-date-picker` component
- [ ] Text filters using `v-text-field` (account name, deal name)
- [ ] Clear all filters button with `v-btn` + active indicators with `v-chip`

**Checkpoint**: Search + all filters working together

### Block 4: Responsive + i18n (Hours 14-18)
- [ ] Mobile layout (360px): cards, stacked filters, hamburger menu
- [ ] Tablet layout (768px): 2-column, sidebar filters
- [ ] Desktop layout (1280px): full table, side filters
- [ ] Configure i18n plugin in `main.ts`
- [ ] Create `/src/locales/en.json`
- [ ] Extract all UI strings to en.json
- [ ] Create `/src/locales/ja.json`, `de.json`, `es.json` (use Google Translate)
- [ ] Create `/src/components/LanguageSwitcher.vue`
- [ ] Test responsive + all languages

**Checkpoint**: Responsive on all breakpoints, 4 languages working

---

## Day 3: Technical + Documentation (8 hours)

### Block 5: Technical Requirements (Hours 18-22)
- [ ] **Security**:
  - [ ] Add `role` to store (Admin/Partner)
  - [ ] Filter deals by role (Partner sees assigned only)
  - [ ] Role switcher in header
  - [ ] Review all components for XSS (use v-text, sanitize inputs)
- [ ] **Real-Time Updates**:
  - [ ] Create `/src/composables/usePolling.ts`
  - [ ] Implement 60s polling interval
  - [ ] Merge updates with deduplication
- [ ] **Caching**:
  - [ ] Add in-memory cache (Map with timestamps) to API service
  - [ ] 5-minute TTL cache invalidation
- [ ] **Error Handling**:
  - [ ] Try-catch in API service
  - [ ] Handle HTTP 500, timeout (AbortController)
  - [ ] Create toast notification component
  - [ ] Add retry button
- [ ] **Testing**:
  - [ ] Write unit tests for deduplication logic
  - [ ] Write unit tests for search logic
  - [ ] Write unit tests for filter logic

**Checkpoint**: All technical features working, tests passing

### Block 6: Documentation (Hours 22-24)
- [ ] **README.md** (1 hour):
  - [ ] Setup instructions
  - [ ] Architecture explanation (components, store, routing)
  - [ ] Responsive design approach
  - [ ] i18n strategy
  - [ ] Top 5 security risks + mitigations
  - [ ] Pagination/infinite scroll decision
  - [ ] Deduplication approach
- [ ] **DECISIONS.md** (0.5 hour):
  - [ ] Architecture choice (Composition API, component structure)
  - [ ] State management choice (Pinia)
  - [ ] Scalability approach (virtual scrolling, backend pagination)
  - [ ] Bottlenecks and risks (client-side filtering, state growth)
- [ ] **REPORT.md** (0.5 hour):
  - [ ] Planned vs actual time spent (by block)
  - [ ] Challenges encountered
  - [ ] Design decisions made
  - [ ] What would improve with one more day
  - [ ] Known limitations/technical debt

**Checkpoint**: All documentation complete, project ready to submit

---

## Hourly Checklist

### Day 1
- [ ] Hour 0-1: Types, mock data
- [ ] Hour 1-2: Pinia store, deduplication
- [ ] Hour 2-3: Mock API service
- [ ] Hour 3-4: Test data flow
- [ ] Hour 4-5: DealList component (table)
- [ ] Hour 5-6: DealCard component (mobile)
- [ ] Hour 6-7: DealDetail page, routing
- [ ] Hour 7-8: Pagination, loading states
- [ ] Hour 8-9: Polish, test navigation

### Day 2
- [ ] Hour 9-10: SearchBar + debounce
- [ ] Hour 10-11: Search logic in store
- [ ] Hour 11-12: FilterPanel structure
- [ ] Hour 12-13: All filter types
- [ ] Hour 13-14: Clear filters, combine logic
- [ ] Hour 14-15: Mobile responsive
- [ ] Hour 15-16: Tablet/desktop responsive
- [ ] Hour 16-17: i18n setup + English
- [ ] Hour 17-18: Other languages, switcher

### Day 3
- [ ] Hour 18-19: Security (roles, XSS)
- [ ] Hour 19-20: Real-time + caching
- [ ] Hour 20-21: Error handling
- [ ] Hour 21-22: Unit tests
- [ ] Hour 22-23: README.md
- [ ] Hour 23-24: DECISIONS.md, REPORT.md

---

## Critical Path (Must Not Slip)

1. **Hours 0-4**: Foundation must be solid (store, data, dedup)
2. **Hours 4-9**: Core features must work end-to-end
3. **Hours 9-14**: Search + filters are high-value (20% of grade)
4. **Hours 14-18**: Responsive + i18n are mandatory (25% of grade)
5. **Hours 18-22**: Technical features show depth
6. **Hours 22-24**: Documentation demonstrates thinking (5% of grade + demonstrates understanding)

## Emergency Time Savers (If Behind Schedule)

If running behind, cut in this order:
1. ❌ Skip unit tests (save 1h) - add TODO comments instead
2. ❌ Skip polling (save 1h) - document why in DECISIONS.md
3. ❌ Simplify caching (save 0.5h) - just document strategy
4. ❌ Skip tablet breakpoint (save 0.5h) - mobile + desktop only
5. ❌ Reduce to 2 languages (save 1h) - EN + one other

**Last Resort**: Cut real-time updates entirely, focus on core features + docs.

## Quality Checkpoints

After each block, verify:
- ✅ Code is clean and readable
- ✅ TypeScript types are correct
- ✅ No console errors
- ✅ ESLint passes
- ✅ Feature works as expected
- ✅ Responsive (if applicable)
- ✅ Git commit with clear message

## Git Commit Strategy

Commit after each major feature:
- `feat: add project setup with Vue 3, Pinia, Tailwind`
- `feat: implement deal store with deduplication logic`
- `feat: add deal list with pagination`
- `feat: add deal detail page with routing`
- `feat: implement global search with debounce`
- `feat: add comprehensive filter panel`
- `feat: implement responsive design for mobile/tablet/desktop`
- `feat: add i18n support with 4 languages`
- `feat: implement security features (XSS prevention, role-based access)`
- `feat: add real-time updates with polling`
- `feat: implement caching strategy`
- `feat: add error handling and retry logic`
- `test: add unit tests for core logic`
- `docs: add comprehensive documentation`

## Success Metrics

At the end of 24 hours, you should have:
- ✅ All mandatory features working
- ✅ Clean, documented code
- ✅ 3 comprehensive documentation files
- ✅ Responsive on mobile, tablet, desktop
- ✅ 4 languages implemented
- ✅ Security measures in place
- ✅ Deduplication working correctly
- ✅ Search + filters combined
- ✅ Basic tests for core logic
- ✅ Professional README

**Target**: 90%+ score on mandatory features, demonstrate strong engineering skills through code quality and documentation.

## Final Pre-Submission Checklist

- [ ] All features from requirements document implemented
- [ ] No console errors
- [ ] ESLint passes (no errors)
- [ ] TypeScript compiles without errors
- [ ] Tests pass (if any)
- [ ] README.md complete and accurate
- [ ] DECISIONS.md explains all major choices
- [ ] REPORT.md reflects actual experience
- [ ] ESTIMATION.md updated with actual times
- [ ] Git history shows clear, logical commits
- [ ] package.json has correct scripts
- [ ] Project runs with `npm install && npm run dev`
- [ ] Code is formatted consistently
- [ ] Sensitive data not committed (if any)

---

**Remember**: Working features with good architecture > Perfect UI. Demonstrate thinking through documentation when time is short.

**You've got this!** Stick to the plan, focus on mandatory requirements, and showcase your engineering skills through clean code and thoughtful documentation.
