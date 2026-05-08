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
- **Design Flexibility**: Use Vuetify Material Design components; minimal custom styling
- **Authentication**: Simple role switcher; no real auth flow
- **Testing Scope**: **Minimal unit tests only** for critical logic (deduplication, search)
- **Development Environment**: Modern development tools and IDE available
- **Mock Data**: Simple JSON file with 50-100 deals
- **Browser Support**: Chrome only for development; responsive testing in DevTools
- **No Backend Development**: Frontend-only implementation with mocked API
- **Single Developer**: One developer working in focused 8-12 hour blocks
- **Code Over Polish**: Working features with good architecture over perfect UI
- **Reuse Components**: Use Vuetify components (v-data-table, v-card, v-date-picker, etc.)

## 24-Hour Work Breakdown Structure

### BLOCK 1: Foundation (Hours 0-4) - Day 1 Morning
| Task | Time | Priority | Notes |
|------|------|----------|-------|
| Project setup (Vue 3, Vite, Vuetify) | 2h | P0 | **COMPLETED** |
| Configure i18n, folder structure | 0.5h | P0 | Quick setup |
| Create TypeScript interfaces | 0.5h | P0 | Deal, Filter, Status types |
| Generate mock data (50-100 deals) | 0.5h | P0 | Simple JSON file |
| Setup Pinia store + deduplication | 0.5h | P0 | Use Map for dedup by dealId |
| **Subtotal** | **4h** | | **2h completed** |

### BLOCK 2: Core Features (Hours 4-9) - Day 1 Afternoon
| Task | Time | Priority | Notes |
|------|------|----------|-------|
| Build DealList with v-data-table | 1h | P0 | Vuetify table with built-in features |
| Create DealCard component for mobile | 0.5h | P0 | v-card for responsive view |
| Add pagination (v-pagination) | 0.5h | P0 | Vuetify built-in pagination |
| Create DealDetails page + routing | 1h | P0 | v-card with all fields, back button |
| Implement loading/empty states | 0.5h | P0 | v-progress-circular, v-empty-state |
| Mock API service with delays | 1.5h | P0 | Simulate fetch, 500 errors, timeouts |
| **Subtotal** | **5h** | | **Total: 9h** |

### BLOCK 3: Search & Filters (Hours 9-14) - Day 2 Morning
| Task | Time | Priority | Notes |
|------|------|----------|-------|
| Create SearchBar with v-text-field + debounce | 0.5h | P1 | Vuetify text field with prepend-icon |
| Multi-field search logic in store | 1h | P1 | Search name, account, status, trim/lowercase |
| Build Filter panel with v-navigation-drawer | 1h | P1 | Vuetify collapsible drawer |
| Status multi-select (v-select multiple) | 0.5h | P1 | Vuetify multi-select with chips |
| Amount range filter (v-text-field) | 0.5h | P1 | Two number inputs |
| Date range filter (v-date-picker) | 0.5h | P1 | Vuetify date picker component |
| Text filters (v-text-field) | 0.5h | P1 | Account, deal name filters |
| Clear all filters + v-chip indicators | 0.5h | P1 | Chip badges, clear button |
| **Subtotal** | **5h** | | **Total: 14h** |

### BLOCK 4: Responsive + i18n (Hours 14-18) - Day 2 Afternoon
| Task | Time | Priority | Notes |
|------|------|----------|-------|
| Mobile layout with v-app-bar-nav-icon | 0.5h | P1 | Vuetify responsive nav drawer |
| Use v-row/v-col for responsive grid | 0.5h | P1 | Vuetify 12-column grid system |
| Hide/show components with v-if="$vuetify.display" | 0.5h | P1 | Vuetify breakpoint helper |
| Configure i18n plugin | 0.5h | P1 | Setup useI18n composable |
| Extract strings to en.json | 0.5h | P1 | All UI text |
| Add ja, de, es translations | 1h | P1 | Use Google Translate API/DeepL |
| Language switcher with v-select | 0.5h | P1 | v-select in app bar |
| Test responsive + translations | 0.5h | P1 | Chrome DevTools responsive mode |
| **Subtotal** | **4h** | | **Total: 18h** |

### BLOCK 5: Technical Requirements (Hours 18-22) - Day 3 Morning
| Task | Time | Priority | Notes |
|------|------|----------|-------|
| **Security** | | | |
| - Role-based access (Admin/Partner) | 0.5h | P1 | Simple role filter in store |
| - Role switcher with v-select in app bar | 0.5h | P1 | v-select to switch roles |
| - XSS prevention (use v-text) | 0.5h | P1 | Review components, sanitize inputs |
| **Real-Time Updates** | | | |
| - WebSocket-based real-time updates** | 1h | P1 | Mock WebSocket with auto-reconnect (replaces polling) |
| - Connection status indicator | 0.25h | P1 | Wi-Fi icon in app bar showing connection status |
| - Merge with deduplication | (included) | P2 | Already implemented |
| **Caching** | | | |
| - Simple in-memory cache | 0.5h | P2 | Map with timestamps |
| - Cache invalidation (5min TTL) | 0.5h | P2 | Auto-clear on timeout + WebSocket invalidation |
| **Error Handling** | | | |
| - HTTP 500 + timeout handling | 0.5h | P1 | Try-catch, show v-snackbar |
| - Retry button with v-btn | 0.5h | P1 | Vuetify snackbar with action |
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
| ✅ Real-Time Updates | 1h | Mandatory | WebSocket approach |
| ✅ Caching | 1h | Mandatory | In-memory with TTL |
| ✅ Error Handling | 1h | Mandatory | 500, timeout, retry |
| ✅ Testing | 1h | Mandatory | Unit tests for logic |
| ✅ Documentation | 2h | Mandatory | 3 markdown files |
| ❌ AI Features | 0h | **SKIPPED** | No time available |
| **TOTAL** | **24h** | | **All required met** |

## Strategic Shortcuts for 24-Hour Delivery

### What We're Leveraging:
1. **UI Design**: Vuetify Material Design components (professional out-of-the-box)
2. **Data Tables**: v-data-table with built-in pagination, filtering
3. **Forms**: v-text-field, v-select, v-checkbox (no custom components needed)
4. **Date Picker**: v-date-picker (better than native HTML inputs)
5. **Responsive**: Vuetify's v-row/v-col grid system + $vuetify.display
6. **Icons**: Material Design Icons (@mdi/font) - 7000+ icons ready
7. **Navigation**: v-navigation-drawer for mobile menu

### What We're Simplifying:
1. **Testing**: Unit tests for core logic only (dedup, search, filter)
2. **Translations**: Google Translate/DeepL (good enough for demo)
3. **Error Handling**: v-snackbar notifications (Vuetify built-in)
4. **Caching**: Simple Map with timestamps (no Redis/IndexedDB)
5. **Real-Time**: WebSocket with auto-reconnect (mock implementation)
6. **AI Features**: **SKIPPED** - no time available

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
| Use Vuetify instead of custom UI | 5h | Material Design (professional, not custom) |
| v-data-table for list view | 2h | Built-in pagination, filtering |
| v-date-picker for dates | 1h | Better than native HTML5 inputs |
| Skip E2E tests | 4h | Unit tests for core logic only |
| Use Google Translate | 3h | May have minor translation issues |
| Vuetify responsive grid | 1.5h | v-row/v-col handles breakpoints |
| Skip AI features entirely | 15h | Bonus points lost, but core complete |
| v-snackbar for notifications | 0.5h | Vuetify built-in component |
| **TOTAL SAVED** | **32h** | **Enables 24h delivery** |

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
