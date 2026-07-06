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
| SoftSmith Store / DevHub | `BadBagger/softsmith-devhub` | `com.softsmith.devhub` | `v1.0.12-back-gesture` |
| Workday Planner | `BadBagger/workday-planner` | `com.example.workdayplanner` | `v2.15-widget-presets` |
| Renewal Radar | `BadBagger/renewal-radar` | `com.renewalradar.app` | `v1.1-logo-refresh` |
| Fridge Finish | `BadBagger/fridge-finish` | `com.fridgefinish.app` | `v1.23-receipt-ocr-fallback` |
| Paycheck Pilot | `BadBagger/paycheck-pilot` | `com.paycheckpilot` | `v1.0.1-icon-refresh` |
| Kid Chaos Calendar | `BadBagger/kid-chaos-calendar` | `com.softsmith.kidchaoscalendar` | no APK release yet |
| IconSmith Studio Mobile | `BadBagger/iconsmith-studio-mobile` | `com.softsmith.iconsmithstudio` | no APK release yet |
| FolderSmith Mobile | `BadBagger/foldersmith-mobile` | `com.foldersmith.mobile` | `v0.1.3-history-scroll-fix` |
| ClearCart | `BadBagger/clearcart` | `com.clearcart.app` | `v0.1.2` |
| PivotFit | `BadBagger/pivotfit` | `com.pivotfit.app` | `v0.1.3-completion-summary` |

## Local Working Folders Seen On This Machine

- DevHub: `C:\Users\KyleB\Documents\Codex\2026-07-05\create-a-private-developer-repository-hub\outputs\softsmith-devhub`
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
- Workday Planner `v2.15-widget-presets` was published at `https://github.com/BadBagger/workday-planner/releases/tag/v2.15-widget-presets` with `WorkdayPlanner.apk` and `WorkdayPlanner-v2.15-widget-presets-release.apk`; it adds polished checkable planner widget rows, task categories, Today Tasks, completed-task alarm cancellation, notification deep links, daily work notes with local smart organization, note filters/search, note-to-task conversion, organizer tests, and Compact/Standard/Detailed planner widget presets. Local `:app:testDebugUnitTest`, `:app:check`, and `:app:assembleRelease` passed before release.

## Open TODOs

- Add first APK releases for Kid Chaos Calendar and IconSmith Studio Mobile.
- Replace temporary ClearCart Store icon/preview when final artwork is available.
- Add real Play Store integration later. Do not auto-publish to production.
- Keep signing keys and Play Store service account credentials out of this repo.
