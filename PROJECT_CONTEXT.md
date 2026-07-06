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
| SoftSmith Store / DevHub | `BadBagger/softsmith-devhub` | `com.softsmith.devhub` | `v1.0.8-paycheck-icon` |
| Workday Planner | `BadBagger/workday-planner` | `com.example.workdayplanner` | `v2.5-logo-refresh` |
| Renewal Radar | `BadBagger/renewal-radar` | `com.renewalradar.app` | `v1.1-logo-refresh` |
| Fridge Finish | `BadBagger/fridge-finish` | `com.fridgefinish.app` | `v1.2-recipe-database` |
| Paycheck Pilot | `BadBagger/paycheck-pilot` | `com.paycheckpilot` | `v1.0.1-icon-refresh` |
| Kid Chaos Calendar | `BadBagger/kid-chaos-calendar` | `com.softsmith.kidchaoscalendar` | no APK release yet |
| IconSmith Studio Mobile | `BadBagger/iconsmith-studio-mobile` | `com.softsmith.iconsmithstudio` | no APK release yet |
| FolderSmith Mobile | `BadBagger/foldersmith-mobile` | `com.foldersmith.mobile` | `v0.1.3-history-scroll-fix` |

## Local Working Folders Seen On This Machine

- DevHub: `C:\Users\KyleB\Documents\Codex\2026-07-05\create-a-private-developer-repository-hub\outputs\softsmith-devhub`
- Paycheck Pilot: `C:\Users\KyleB\Documents\Codex\2026-07-05\create-a-private-developer-repository-hub\outputs\paycheck-pilot`
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

- Fridge Finish did not show an update until `v1.2-recipe-database` was created as a GitHub Release with an APK asset. Source-only pushes do not update DevHub.
- FolderSmith History crash was fixed in `v0.1.3-history-scroll-fix` by removing nested scrollable layout inside history cards.
- Paycheck Pilot was connected as a real repo and has its own APK release.
- DevHub icon assets were refreshed with user-provided artwork through `v1.0.8-paycheck-icon`.

## Open TODOs

- Add first APK releases for Kid Chaos Calendar and IconSmith Studio Mobile.
- Add real Play Store integration later. Do not auto-publish to production.
- Keep signing keys and Play Store service account credentials out of this repo.

