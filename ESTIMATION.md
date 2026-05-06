# Estimation Plan - Partner Portal Deal Management Dashboard

## Time Constraint: 24 Hours Total

This project must be completed within **24 hours** (approximately 3 days × 8 hours or 2 days × 12 hours).

## Estimation Method

Given the tight timeline, this estimation uses a **priority-based approach with aggressive scope management**:

1. **Mandatory First**: All required features must be included, but implemented minimally
2. **Demonstrate Skills**: Focus on showing architectural thinking and code quality over polish
3. **Strategic Shortcuts**: Use libraries, components, and smart simplifications
4. **Documentation as Proof**: When time is short, document decisions to show understanding
5. **No Buffer**: 24 hours is fixed; prioritization is critical

## Assumptions

- **API Contract**: Mock API data structure is simple and pre-defined
- **Design Flexibility**: Use Tailwind's defaults; minimal custom styling
- **Authentication**: Simple role switcher; no real auth flow
- **Testing Scope**: **Minimal unit tests only** for critical logic (deduplication, search)
- **Development Environment**: Modern development tools and IDE available
- **Mock Data**: Simple JSON file with 50-100 deals
- **Browser Support**: Chrome only for development; responsive testing in DevTools
- **No Backend Development**: Frontend-only implementation with mocked API
- **Single Developer**: One developer working in focused 8-12 hour blocks
- **Code Over Polish**: Working features with good architecture over perfect UI
- **Reuse Components**: Use Tailwind UI patterns, no custom component library

## 24-Hour Work Breakdown Structure

### BLOCK 1: Foundation (Hours 0-4) - Day 1 Morning
| Task | Time | Priority | Notes |
|------|------|----------|-------|
| ✓ Project setup (Vue 3, Vite, Tailwind) | 2h | P0 | **COMPLETED** |
| ✓ Configure i18n, folder structure | 0.5h | P0 | Quick setup |
| Create TypeScript interfaces | 0.5h | P0 | Deal, Filter, Status types |
| Generate mock data (50-100 deals) | 0.5h | P0 | Simple JSON file |
| Setup Pinia store + deduplication | 0.5h | P0 | Use Map for dedup by dealId |
| **Subtotal** | **4h** | | **2h completed** |

### BLOCK 2: Core Features (Hours 4-9) - Day 1 Afternoon
| Task | Time | Priority | Notes |
|------|------|----------|-------|
| Build DealList component (table + cards) | 1.5h | P0 | Desktop table, mobile cards |
| Add pagination (simple prev/next) | 1h | P0 | Skip fancy UI, just functional |
| Create DealDetails page + routing | 1h | P0 | Display all fields, back button |
| Implement loading/empty states | 0.5h | P0 | Basic spinners and messages |
| Mock API service with delays | 1h | P0 | Simulate fetch, 500 errors, timeouts |
| **Subtotal** | **5h** | | **Total: 9h** |

### BLOCK 3: Search & Filters (Hours 9-14) - Day 2 Morning
| Task | Time | Priority | Notes |
|------|------|----------|-------|
| Create SearchBar with debounce (300ms) | 1h | P1 | Use useDebouncedRef composable |
| Multi-field search logic in store | 1h | P1 | Search name, account, status, trim/lowercase |
| Build Filter panel component | 1.5h | P1 | Collapsible sidebar/drawer |
| Status multi-select (checkboxes) | 0.5h | P1 | Simple checkboxes |
| Amount range filter (min/max inputs) | 0.5h | P1 | Number inputs |
| Date range filter (date inputs) | 0.5h | P1 | Native date inputs (no date picker lib) |
| Text filters (account, deal name) | 0.5h | P1 | Contains logic |
| Clear all filters + active indicators | 0.5h | P1 | Badge count, clear button |
| **Subtotal** | **5h** | | **Total: 14h** |

### BLOCK 4: Responsive + i18n (Hours 14-18) - Day 2 Afternoon
| Task | Time | Priority | Notes |
|------|------|----------|-------|
| Mobile-first layout (360px) | 1h | P1 | Cards, stacked filters, hamburger menu |
| Tablet layout adjustments (768px) | 0.5h | P1 | 2-column, sidebar filters |
| Desktop polish (1280px) | 0.5h | P1 | Full table, side-by-side layout |
| Configure i18n plugin | 0.5h | P1 | Setup useI18n composable |
| Extract strings to en.json | 0.5h | P1 | All UI text |
| Add ja, de, es translations | 1h | P1 | Use Google Translate API/DeepL |
| Language switcher dropdown | 0.5h | P1 | Simple select in header |
| Test responsive + translations | 0.5h | P1 | Chrome DevTools responsive mode |
| **Subtotal** | **4h** | | **Total: 18h** |

### BLOCK 5: Technical Requirements (Hours 18-22) - Day 3 Morning
| Task | Time | Priority | Notes |
|------|------|----------|-------|
| **Security** | | | |
| - Role-based access (Admin/Partner) | 0.5h | P1 | Simple role filter in store |
| - Role switcher in header | 0.5h | P1 | Dropdown to switch roles |
| - XSS prevention (use v-text) | 0.5h | P1 | Review components, sanitize inputs |
| **Real-Time Updates** | | | |
| - Polling mechanism (60s interval) | 0.5h | P2 | setInterval in composable |
| - Merge with deduplication | (included) | P2 | Already implemented |
| **Caching** | | | |
| - Simple in-memory cache | 0.5h | P2 | Map with timestamps |
| - Cache invalidation (5min TTL) | 0.5h | P2 | Clear on timeout |
| **Error Handling** | | | |
| - HTTP 500 + timeout handling | 0.5h | P1 | Try-catch, show error toast |
| - Retry button | 0.5h | P1 | Simple reload action |
| **Testing** | | | |
| - Unit tests (dedup, search, filter) | 1h | P2 | Core logic only, skip UI tests |
| **Subtotal** | **4h** | | **Total: 22h** |

### BLOCK 6: Documentation (Hours 22-24) - Day 3 Afternoon
| Task | Time | Priority | Notes |
|------|------|----------|-------|
| Write README.md | 1h | P0 | Setup, architecture, security, i18n, decisions |
| Write DECISIONS.md | 0.5h | P0 | Architecture, state mgmt, scalability, risks |
| Write REPORT.md | 0.5h | P0 | Planned vs actual, challenges, improvements |
| Update ESTIMATION.md | (ongoing) | P0 | Track actual time |
| **Subtotal** | **2h** | | **Total: 24h** |

## 24-Hour Summary

| Block | Hours | Focus Area | Deliverable |
|-------|-------|------------|-------------|
| **Block 1** | 0-4 | Foundation | Project setup, data layer, mock data |
| **Block 2** | 4-9 | Core Features | Deal list, details, pagination, API |
| **Block 3** | 9-14 | Search & Filters | Global search, all filters working |
| **Block 4** | 14-18 | UX & i18n | Responsive design, 4 languages |
| **Block 5** | 18-22 | Technical | Security, caching, errors, tests |
| **Block 6** | 22-24 | Documentation | README, DECISIONS, REPORT |
| **TOTAL** | **24h** | **All mandatory features** | **Production demo** |

## Mandatory vs Optional Features

| Feature | Time | Status | Notes |
|---------|------|--------|-------|
| ✅ Deal List & Details | 4h | Mandatory | Core functionality |
| ✅ Pagination | 1h | Mandatory | Simple prev/next |
| ✅ Deduplication | 0.5h | Mandatory | Map-based by dealId |
| ✅ Global Search | 2h | Mandatory | Debounced, multi-field |
| ✅ All Filters | 3h | Mandatory | Status, amount, date, text |
| ✅ Responsive Design | 2h | Mandatory | 360/768/1280px |
| ✅ i18n (4 languages) | 2h | Mandatory | EN, JA, DE, ES |
| ✅ Security | 1.5h | Mandatory | XSS, roles, sanitization |
| ✅ Real-Time Updates | 1h | Mandatory | Polling approach |
| ✅ Caching | 1h | Mandatory | In-memory with TTL |
| ✅ Error Handling | 1h | Mandatory | 500, timeout, retry |
| ✅ Testing | 1h | Mandatory | Unit tests for logic |
| ✅ Documentation | 2h | Mandatory | 3 markdown files |
| ❌ AI Features | 0h | **SKIPPED** | No time available |
| **TOTAL** | **24h** | | **All required met** |

## Strategic Shortcuts for 24-Hour Delivery

### What We're Simplifying:
1. **UI Design**: Tailwind defaults, minimal custom styling
2. **Testing**: Unit tests for core logic only (dedup, search, filter)
3. **Pagination**: Simple prev/next, skip page numbers
4. **Date Picker**: Native HTML date inputs (no library)
5. **Translations**: Google Translate/DeepL (good enough for demo)
6. **Error Handling**: Basic try-catch with toast notifications
7. **Caching**: Simple Map with timestamps (no Redis/IndexedDB)
8. **Real-Time**: Polling every 60s (no WebSocket complexity)
9. **AI Features**: **SKIPPED** - no time available

### What We're NOT Compromising:
1. **Architecture**: Clean component structure, Pinia store pattern
2. **Security**: XSS prevention, input sanitization, role-based access
3. **Deduplication**: Proper Map-based deduplication logic
4. **Search/Filter**: Full functionality as required
5. **Responsive Design**: All 3 breakpoints working
6. **Documentation**: Clear README, DECISIONS, REPORT files

## Execution Strategy

**Day 1 (8 hours)**: Foundation + Core Features (Blocks 1-2)
- By EOD: Working deal list, details, pagination, mock API

**Day 2 (8 hours)**: Search, Filters, UX (Blocks 3-4)
- By EOD: Full search/filter, responsive, i18n complete

**Day 3 (8 hours)**: Technical + Documentation (Blocks 5-6)
- By EOD: Security, caching, errors, tests, all docs complete

## Critical Risks for 24-Hour Timeline

| Risk | Impact | Mitigation | Time Saved |
|------|--------|------------|------------|
| **Scope creep** | High | Stick to plan, no extras | N/A |
| **Over-engineering** | High | Use simplest solution that works | 4-6h |
| **Translation delays** | Low | Use automated translation | 3h |
| **Responsive testing** | Medium | DevTools only, no real devices | 1-2h |
| **Complex UI components** | Medium | Use Tailwind patterns, no custom libs | 3-4h |
| **Perfect code** | Low | Working > perfect, refactor if time | 2-3h |
| **Extensive testing** | Medium | Test core logic only | 10h |

## Time Saving Decisions

| Decision | Time Saved | Trade-off |
|----------|------------|-----------|
| Skip custom date picker library | 1h | Use native HTML5 date inputs |
| Skip fancy pagination UI | 0.5h | Simple prev/next buttons |
| Skip E2E tests | 4h | Unit tests for core logic only |
| Use Google Translate | 3h | May have minor translation issues |
| Skip perfect mobile polish | 2h | Functional but not pixel-perfect |
| Skip AI features entirely | 15h | Bonus points lost, but core complete |
| Simple toast notifications | 1h | No fancy notification library |
| **TOTAL SAVED** | **26.5h** | **Enables 24h delivery** |

## Evaluation Score Optimization

Given evaluation criteria, here's where we allocate focus:

| Criteria | Weight | Our Approach | Time |
|----------|--------|--------------|------|
| Architecture & code structure | 25% | Clean components, Pinia patterns, TypeScript | Throughout |
| Code quality & maintainability | 20% | ESLint, comments, clear naming | Throughout |
| API & data handling | 20% | Mock API, deduplication, caching | 3h |
| Responsive UI | 15% | Mobile-first, 3 breakpoints | 2h |
| i18n | 10% | vue-i18n, 4 languages | 2h |
| Security | 5% | XSS prevention, roles, sanitization | 1.5h |
| Estimation & reporting | 5% | This document + REPORT.md | 2h |
| AI (bonus) | Bonus | **SKIP** - focus on core 100% | 0h |

**Strategy**: Prioritize the high-weight items (Architecture 25%, Code Quality 20%, API 20%) = 65% of score.

## Final Notes

- **Zero Buffer**: 24 hours is fixed - no contingency time available
- **Actual Time Tracking**: Will update this document with actual hours spent per block
- **MVP First**: Get all features working minimally, then polish if time remains
- **Documentation Matters**: Good docs can explain decisions when code isn't perfect
- **Demo-Ready**: Focus on "working demo" not "production system"
- **Code Quality**: Clean code with good architecture > more features
- **Evaluation Focus**: 65% of score from architecture, code quality, and API handling

## Success Criteria

✅ **All mandatory features working** (even if simple)
✅ **Clean, understandable code** with good structure
✅ **All 3 documentation files** complete and thoughtful
✅ **Responsive on all 3 breakpoints**
✅ **4 languages working**
✅ **Security measures documented** and implemented
✅ **Deduplication working** correctly
✅ **Search + filters combined** properly

**Target**: 90%+ on core requirements, 0% on bonus AI features = Still strong submission
