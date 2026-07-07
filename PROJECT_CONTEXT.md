# SoftSmith DevHub Project Context

This file is the shared handoff point for Codex chats working across SoftSmith
Android apps.

## DevHub Repo

- Repo: `https://github.com/BadBagger/softsmith-devhub`
- Android package: `com.softsmith.devhub`
- Current role: private Android app store and repository control center
- Update source: GitHub Releases with APK assets

## Current Connected Apps

| App | Repo | Package | Latest Known Release |
| --- | --- | --- | --- |
| Smithware Studios / DevHub | `BadBagger/softsmith-devhub` | `com.softsmith.devhub` | `v2.1.9-printout-scanner-pro` |
| Workday Planner | `BadBagger/workday-planner` | `com.example.workdayplanner` | `v2.30-manager-dashboard` |
| Renewal Radar | `BadBagger/renewal-radar` | `com.renewalradar.app` | `v1.1-logo-refresh` |
| Fridge Finish | `BadBagger/fridge-finish` | `com.fridgefinish.app` | `v1.23-receipt-ocr-fallback` |
| Paycheck Pilot | `BadBagger/paycheck-pilot` | `com.paycheckpilot` | `v1.0.1-icon-refresh` |
| Kid Chaos Calendar | `BadBagger/kid-chaos-calendar` | `com.softsmith.kidchaoscalendar` | no APK release yet |
| IconSmith Studio Mobile | `BadBagger/iconsmith-studio-mobile` | `com.softsmith.iconsmithstudio` | no APK release yet |
| FolderSmith Mobile | `BadBagger/foldersmith-mobile` | `com.foldersmith.mobile` | `v0.1.3-history-scroll-fix` |
| ClearCart | `BadBagger/clearcart` | `com.clearcart.app` | `v0.1.2` |
| PivotFit | `BadBagger/pivotfit` | `com.pivotfit.app` | `v0.1.3-completion-summary` |
| Order Radar | `BadBagger/order-radar` | `com.smithware.orderradar` | `v0.4.3-delivery-check` |
| Printout Scanner Pro | `BadBagger/printout-scanner-pro` | `com.smithware.printoutscannerpro` | `v0.1.0-mvp` |
| BuildSmith Studio | `BadBagger/buildsmith` | `com.smithware.buildsmith` | `v0.2.0-studio-command-center` |
| Codex Buddy | `BadBagger/codex-buddy` | `com.softsmith.codexbuddy` | `v0.2.1-panel-history` |

## Local Working Folders Seen On This Machine

- DevHub: `C:\Users\KyleB\Documents\Codex\2026-07-05\create-a-private-developer-repository-hub\outputs\softsmith-devhub`
- Order Radar: `C:\Users\KyleB\Documents\Codex\2026-07-06\build-a-native-android-app-called-2`
- Paycheck Pilot: `C:\Users\KyleB\Documents\Codex\2026-07-05\create-a-private-developer-repository-hub\outputs\paycheck-pilot`
- PivotFit: `C:\Users\KyleB\Documents\Codex\2026-07-05\create-a-private-developer-repository-hub\outputs\pivotfit`
- ClearCart: `C:\Users\KyleB\Documents\Codex\2026-07-05\build-a-native-android-app-inspired`
- Fridge Finish: `C:\Users\KyleB\Documents\Codex\2026-07-04\build-a-native-android-app-called-2`
- Older Paycheck Pilot source, not the published git repo: `C:\Users\KyleB\Documents\Codex\2026-07-04\build-a-native-android-app-called`

When updating Paycheck Pilot, prefer the published repo folder under
`outputs\paycheck-pilot`, not the older non-git source folder.

## Android Toolchain

Known working local toolchain:

```powershell
$env:JAVA_HOME='C:\Users\KyleB\Documents\Codex\2026-07-04\build-a-native-android-app-using\.local-jdk\jdk-17.0.19+10'
$env:ANDROID_HOME='C:\Users\KyleB\Documents\Codex\2026-07-04\build-a-native-android-app-using\.android-sdk'
$env:ANDROID_SDK_ROOT=$env:ANDROID_HOME
$env:Path="$env:JAVA_HOME\bin;$env:Path"
```

## Publishing Checklist

For app updates, use this sequence:

```powershell
.\gradlew.bat testDebugUnitTest assembleDebug
git status --short
git add .
git commit -m "Describe update"
git push origin main
& 'C:\Program Files\GitHub CLI\gh.exe' release create TAG APK_PATH --repo OWNER/REPO --title "TITLE" --notes "NOTES"
& 'C:\Program Files\GitHub CLI\gh.exe' release list --repo OWNER/REPO --limit 3
```

If the release already exists, use `release upload --clobber`.

## Recent Notes

- DevHub `v2.1.9-printout-scanner-pro` adds Printout Scanner Pro to the private app registry and Android store list, with package visibility for `com.smithware.printoutscannerpro` and pinned fallback asset `PrintoutScannerPro.apk`.
- BuildSmith Studio `v0.2.0-studio-command-center` was published at `https://github.com/BadBagger/buildsmith/releases/tag/v0.2.0-studio-command-center` with `BuildSmith.apk` and `BuildSmith-release-v0.2.0-studio-command-center.apk`; it refocuses BuildSmith as a Smithware Studios command center with Studio Dashboard, Command Center, Asset Tracker, Bug/Update Log, expanded prompt types, launch checklist, and Icon Studio. DevHub pinned release was updated in `v2.1.11-buildsmith-studio`, and `BadBagger/buildsmith` is public so unauthenticated DevHub installs can read and download the APK.
- Printout Scanner Pro `v0.1.0-mvp` was published at `https://github.com/BadBagger/printout-scanner-pro/releases/tag/v0.1.0-mvp` with `PrintoutScannerPro.apk` and `PrintoutScannerPro-v0.1.0.apk`; it is a local-first work-printout-to-tracker MVP with CameraX/ML Kit OCR, mandatory editable Training Report review, Room-backed associates/training items, Training Radar priority sorting, working-today toggles, and copy/share reports.
- DevHub `v2.1.8-ui-refresh` improves the private app home UI with a compact status summary, separated section header actions, rounded app cards, tighter spacing, and hidden update buttons until an install/update action is available.
- Order Radar `v0.4.3-delivery-check` was published at `https://github.com/BadBagger/order-radar/releases/tag/v0.4.3-delivery-check` with `OrderRadar.apk` and `OrderRadar-release-v0.4.3-delivery-check.apk`; it creates expected delivery checklists from placed order drafts and lets managers adjust actual received quantities with short/over/not-received status. DevHub pinned release was updated in `v2.1.7-order-radar-delivery-check`.
- Order Radar `v0.4.2-forecast-add` was published at `https://github.com/BadBagger/order-radar/releases/tag/v0.4.2-forecast-add` with `OrderRadar.apk` and `OrderRadar-release-v0.4.2-forecast-add.apk`; it makes forecast recommendation cards create or update editable order draft lines using linked truck schedules. DevHub pinned release was updated in `v2.1.6-order-radar-forecast-add`.
- Order Radar `v0.4.1-order-draft-edit` was published at `https://github.com/BadBagger/order-radar/releases/tag/v0.4.1-order-draft-edit` with `OrderRadar.apk` and `OrderRadar-release-v0.4.1-order-draft-edit.apk`; it adds editable imported draft quantities, zero-quantity line removal, copyable order summaries, and mark placed for photo-scanned order drafts. DevHub pinned release was updated in `v2.1.5-order-radar-draft-edit`.
- Order Radar `v0.4.0-order-photo-import` was published at `https://github.com/BadBagger/order-radar/releases/tag/v0.4.0-order-photo-import` with `OrderRadar.apk` and `OrderRadar-release-v0.4.0-order-photo-import.apk`; it adds a CameraX/ML Kit order-photo import workflow that scans order sheets or handwritten lists, suggests product/quantity lines, requires user confirmation, and saves the result as an editable local order draft. DevHub pinned release was updated in `v2.1.4-order-radar-photo-import`.
- Order Radar `v0.3.0-products` was published at `https://github.com/BadBagger/order-radar/releases/tag/v0.3.0-products` with `OrderRadar.apk` and `OrderRadar-release-v0.3.0-products.apk`; it adds product database search/filter, product add/edit forms, category/unit/vendor/location/safety-stock/reorder-point setup, and product detail edit actions. DevHub pinned release was updated in `v2.1.3-order-radar-products`.
- Order Radar `v0.2.1-colors` was published at `https://github.com/BadBagger/order-radar/releases/tag/v0.2.1-colors` with `OrderRadar.apk` and `OrderRadar-release-v0.2.1-colors.apk`; it replaces the harsh lime accent with a muted emerald/steel palette and toned-down app/DevHub artwork. DevHub metadata and pinned release were updated in `v2.1.2-order-radar-colors`.
- DevHub `v2.1.1-order-radar-status` makes Order Radar release detection robust by falling back to the pinned `OrderRadar.apk` asset when GitHub returns a private/not-found response, and `BadBagger/order-radar` is public so unauthenticated DevHub installs can read and download the APK.
- Order Radar `v0.2.0` was published at `https://github.com/BadBagger/order-radar/releases/tag/v0.2.0` with `OrderRadar.apk` and `OrderRadar-release-v0.2.0.apk`; it is a local-first order forecasting and delivery variance tracker with manual cooler counts, movement averages, truck schedules, order forecasts, delivery variance logs, display forecasts, reports, and CameraX/ML Kit OCR assist that requires user confirmation before saving counts. DevHub connection was added in `v2.1.0-order-radar` with the supplied green radar box logo.
- Workday Planner `v2.30-manager-dashboard` was published at `https://github.com/BadBagger/workday-planner/releases/tag/v2.30-manager-dashboard` with `WorkdayPlanner.apk` and `WorkdayPlanner-release-v2.30-manager-dashboard.apk`; it replaces the Training tab with Manager, adds a manager dashboard with actionable training filters, moves follow-up task creation into the dashboard, and keeps training intake compact unless the training list is empty. Local `:app:testDebugUnitTest` and `:app:assembleRelease` passed before release.
- Workday Planner `v2.29-settings-tab` was published at `https://github.com/BadBagger/workday-planner/releases/tag/v2.29-settings-tab` with `WorkdayPlanner.apk` and `WorkdayPlanner-release-v2.29-settings-tab.apk`; it adds a dedicated Settings bottom tab, moves Appearance, pay, widget, and calendar sync controls there, removes Import from the crowded bottom bar, and puts schedule import inside the Schedule screen. Local `:app:testDebugUnitTest` and `:app:assembleRelease` passed before release.
- Workday Planner `v2.28-logo-theme` was published at `https://github.com/BadBagger/workday-planner/releases/tag/v2.28-logo-theme` with `WorkdayPlanner.apk` and `WorkdayPlanner-release-v2.28-logo-theme.apk`; it adds a separate selectable Logo theme inspired by the supplied calendar/check/clock artwork, using a dark navy base, teal primary accents, and lime secondary highlights while keeping the existing Blue, Teal, and Amber themes available. Local `:app:testDebugUnitTest` and `:app:assembleRelease` passed before release.
- DevHub `v2.0.0-version-compare` fixes release comparison so suffix digits in tags like `1.0.18-github-403-fallback` do not make old versions look newer than later releases. The major version jump lets installed buggy builds detect this update.
- DevHub `v1.0.20-smithware-icons` refreshes the SmithWare Studios application logo and the DevHub row icon, plus Workday Planner, Fridge Finish, Renewal Radar, Paycheck Pilot, and FolderSmith Mobile icons using transparent SmithWare app artwork from the Beta Hub asset set.
- DevHub `v1.0.19-codex-buddy-live-feed` updates Codex Buddy metadata and pinned fallback to `v0.2.1-panel-history`, which adds live temporary overlay bubbles and persisted panel history for Codex activity events.
- Workday Planner `v2.27-training-pay-refine` was published at `https://github.com/BadBagger/workday-planner/releases/tag/v2.27-training-pay-refine` with `WorkdayPlanner.apk` and `WorkdayPlanner-release-v2.27-training-pay-refine.apk`; it adds manual training entry, training follow-up task creation, Training queue filters, associate grouping, a combined Manual/Photo add-training card, cleaner bottom navigation, removes Ask manager, and expands pay estimates with adjustable tax/deduction percentages plus weekly gross/net earnings summary. Local `:app:testDebugUnitTest` and `:app:assembleRelease` passed before release.
- Workday Planner `v2.26-training-tracker` was published at `https://github.com/BadBagger/workday-planner/releases/tag/v2.26-training-tracker` with `WorkdayPlanner.apk` and `WorkdayPlanner-release-v2.26-training-tracker.apk`; it adds a Training tab for associate CBT tracking with OCR photo import, editable detected text, parsed associate/training/due-date rows, local training database search, completion toggles, urgency summary counts, and parser tests. It also includes task priority/color coding, category colors, task view filters, deadline buckets, and a Focus card. Local `:app:testDebugUnitTest` and `:app:assembleRelease` passed before release.
- Workday Planner `v2.25-manager-messages` was published at `https://github.com/BadBagger/workday-planner/releases/tag/v2.25-manager-messages` with `WorkdayPlanner.apk` and `WorkdayPlanner-release-v2.25-manager-messages.apk`; it adds pay estimation, personal timecard tracking with lunch and missed-punch notes, Today watch-outs, checklist templates, and Ask manager copy-ready messages. Local `:app:testDebugUnitTest` and `:app:assembleRelease` passed before release.
- Codex Buddy `v0.2.1-panel-history` was published at `https://github.com/BadBagger/codex-buddy/releases/tag/v0.2.1-panel-history` with `CodexBuddy.apk` and `CodexBuddy-release-v0.2.1-panel-history.apk`; it adds Twitch-chat-style live overlay event bubbles and persists recent events in the floating panel.
- DevHub `v1.0.18-github-403-fallback` adds a public GitHub releases-page fallback when the unauthenticated GitHub API returns 403, so installed apps can still detect APK-backed releases without showing every repo as blocked.
- DevHub `v1.0.17-codex-buddy-status-bridge` updates Codex Buddy metadata and pinned fallback to `v0.2.0-status-bridge`, which is a local status bridge for existing Codex work rather than a separate OpenAI chat.
- Codex Buddy `v0.2.0-status-bridge` was published at `https://github.com/BadBagger/codex-buddy/releases/tag/v0.2.0-status-bridge` with `CodexBuddy.apk` and `CodexBuddy-release-v0.2.0-status-bridge.apk`; it listens on phone port 8787 for Codex status events and includes a sample Windows Stop-hook sender.
- DevHub `v1.0.16-codex-buddy-start-fix` updates the Codex Buddy pinned fallback to `v0.1.1-overlay-start-fix` after the foreground service permission crash fix.
- Codex Buddy `v0.1.1-overlay-start-fix` was published at `https://github.com/BadBagger/codex-buddy/releases/tag/v0.1.1-overlay-start-fix` with `CodexBuddy.apk` and `CodexBuddy-release-v0.1.1-overlay-start-fix.apk`; it fixes Start Floating Buddy crashes on Android 14+ by declaring the required foreground-service data sync permission.
- DevHub `v1.0.15-codex-buddy-fallback` adds a pinned Codex Buddy APK fallback so the detail page still shows an installable release when unauthenticated GitHub API checks return 403.
- DevHub `v1.0.13-smithware-brand` renames the visible Android app brand from SoftSmith Store to Smithware Studios while keeping package names and repository names unchanged for update compatibility.
- Codex Buddy `v0.1.0-overlay-chat` was published at `https://github.com/BadBagger/codex-buddy/releases/tag/v0.1.0-overlay-chat` with `CodexBuddy.apk` and `CodexBuddy-release-v0.1.0.apk`; DevHub connection was added in `v1.0.14-codex-buddy`.
- DevHub `v1.0.12-back-gesture` fixes Android gesture back on app detail pages by registering the Android 13+ back callback and routing toolbar and system back through the same home-navigation handler.
- DevHub `v1.0.11-clean-updates` simplifies the store home screen by removing the oversized self-detail preview and featured carousel, keeps SoftSmith Store as a normal app row with the same install/update button behavior as other apps, and promotes installed apps with available updates into a top Updates available section.
- Fridge Finish did not show an update until `v1.2-recipe-database` was created as a GitHub Release with an APK asset. Source-only pushes do not update DevHub.
- Fridge Finish `v1.23-receipt-ocr-fallback` is the latest published GitHub Release with APK assets. It fixes receipt import when OCR returns flattened text instead of clean rows by adding fallback parsing for Costco item-number receipts, Walmart UPC rows, and produce price-boundary receipts. Tests and `assembleDebug` passed locally before release.
- A mistaken Fridge Finish Plus commit was reverted out of FolderSmith Mobile; FolderSmith's latest known APK release remains `v0.1.3-history-scroll-fix`.
- FolderSmith History crash was fixed in `v0.1.3-history-scroll-fix` by removing nested scrollable layout inside history cards.
- Paycheck Pilot was connected as a real repo and has its own APK release.
- DevHub icon assets were refreshed with user-provided artwork through `v1.0.8-paycheck-icon`.
- ClearCart `v0.1.2` was published at `https://github.com/BadBagger/clearcart/releases/tag/v0.1.2` with `ClearCart.apk` and `ClearCart-debug-v0.1.2.apk`; it adds a dedicated product search screen, text search provider support for Open Food Facts and Open Beauty Facts, and mock search fallback. DevHub connection was added in `v1.0.9-clearcart`.
- PivotFit `v0.1.0-mvp` was published at `https://github.com/BadBagger/pivotfit/releases/tag/v0.1.0-mvp` with `PivotFit.apk` and `PivotFit-v0.1.0-mvp-release.apk`; DevHub connection was added in `v1.0.10-pivotfit`.
- PivotFit `v0.1.1-adaptive-tests` adds JVM coverage for adaptive workout generation and Pivot substitutions, tightens sore-area avoidance, and honors low-sweat mode for gentler cardio choices.
- PivotFit `v0.1.2-onboarding` adds first-run onboarding for goal, experience, preferred length, equipment, beginner mode, quiet workouts, low-sweat defaults, and flexible planning.
- PivotFit `v0.1.3-completion-summary` improves the workout completion flow with completed exercises, pivots, skipped exercises, soreness flags, minutes, RPE, and next recommendation.
- Workday Planner `v2.19-schedule-changes` was published at `https://github.com/BadBagger/workday-planner/releases/tag/v2.19-schedule-changes` with `WorkdayPlanner.apk` and `WorkdayPlanner-release-v2.19-schedule-changes.apk`; it adds a schedule change detector to the import preview for changed shifts, added shifts, removed shifts, new days off, removed days off, and overtime/near-overtime warnings before applying a schedule import. Local `:app:testDebugUnitTest` and `:app:assembleRelease` passed before release, including focused `ScheduleChangeDetector` tests.
- Workday Planner `v2.18-work-images` was published at `https://github.com/BadBagger/workday-planner/releases/tag/v2.18-work-images` with `WorkdayPlanner.apk` and `WorkdayPlanner-release-v2.18-work-images.apk`; it adds searchable work images to the Notes tab, copies images into private app storage, indexes detected text with on-device OCR, and tags common references like plannograms and Fresh Slice. Local `:app:testDebugUnitTest` and `:app:assembleRelease` passed before release.
- Workday Planner `v2.17-notes-tab` was published at `https://github.com/BadBagger/workday-planner/releases/tag/v2.17-notes-tab` with `WorkdayPlanner.apk` and `WorkdayPlanner-release-v2.17-notes-tab.apk`; it moves daily work notes out of the Tasks screen into a dedicated Notes bottom tab while keeping note capture, search, filters, note-to-task conversion, and deletion. Local `:app:testDebugUnitTest` and `:app:assembleRelease` passed before release.
- Workday Planner `v2.16-chip-wrap` was published at `https://github.com/BadBagger/workday-planner/releases/tag/v2.16-chip-wrap` with `WorkdayPlanner.apk` and `WorkdayPlanner-release-v2.16-chip-wrap.apk`; it fixes the Today at work summary chips so the notes count wraps cleanly on narrow screens instead of being squeezed into vertical text. Local `:app:testDebugUnitTest` and `:app:assembleRelease` passed before release.
- Workday Planner `v2.15-widget-presets` was published at `https://github.com/BadBagger/workday-planner/releases/tag/v2.15-widget-presets` with `WorkdayPlanner.apk` and `WorkdayPlanner-v2.15-widget-presets-release.apk`; it adds polished checkable planner widget rows, task categories, Today Tasks, completed-task alarm cancellation, notification deep links, daily work notes with local smart organization, note filters/search, note-to-task conversion, organizer tests, and Compact/Standard/Detailed planner widget presets. Local `:app:testDebugUnitTest`, `:app:check`, and `:app:assembleRelease` passed before release.

## Open TODOs

- Add first APK releases for Kid Chaos Calendar and IconSmith Studio Mobile.
- Replace temporary ClearCart Store icon/preview when final artwork is available.
- Add real Play Store integration later. Do not auto-publish to production.
- Keep signing keys and Play Store service account credentials out of this repo.
