# SoftSmith DevHub Agent Instructions

Future Codex chats working in this repository must read this file and
`PROJECT_CONTEXT.md` before editing source, creating releases, or changing app
metadata.

## Primary Rule

DevHub is the coordination point for SoftSmith Android apps. Cross-app changes
must be recorded here so separate Codex chats do not lose track of app status,
release tags, package names, or publishing requirements.

## Required Startup Flow

1. Read `AGENTS.md`.
2. Read `PROJECT_CONTEXT.md`.
3. Inspect `apps.yml`.
4. Inspect the target app source before editing.
5. Check Git status before changing files.

## Publishing Rule

Pushing code is not enough for DevHub updates.

For any Android app update:

1. Bump `versionCode`.
2. Set a new `versionName`.
3. Run tests.
4. Build the APK.
5. Commit and push source changes.
6. Create a GitHub Release with a matching tag.
7. Attach an APK asset to the release.
8. Verify the release is marked latest and contains the APK.
9. Update `PROJECT_CONTEXT.md` with the result.

DevHub detects updates from GitHub Releases with APK assets attached. It does
not detect source-only pushes.

## GitHub CLI

`gh` may not be on PATH. On this machine, use:

```powershell
& 'C:\Program Files\GitHub CLI\gh.exe'
```

Only stop for missing GitHub tooling after checking that exact path and any
available GitHub connector.

## App Registry

When adding or changing an app, update:

- `apps.yml`
- `android-app/app/src/main/AndroidManifest.xml` package queries
- `android-app/app/src/main/java/com/softsmith/devhub/MainActivity.java`
- DevHub drawable assets, if the Store listing needs icon or preview updates
- `PROJECT_CONTEXT.md`

## Release Asset Naming

Prefer two APK assets when publishing:

- A simple name, such as `DevHub.apk`, `FridgeFinish.apk`, or `PaycheckPilot.apk`
- A descriptive build name with version info

The simple APK name makes Android downloads easier.

## Safety

Do not commit secrets, signing keys, keystores, Play Store credentials, or
service account files. Signing and Play Publishing API integration remain TODOs.

