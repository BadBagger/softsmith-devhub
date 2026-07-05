# SoftSmith DevHub

`softsmith-devhub` is a private Windows-first control center for SoftSmith Android apps. It keeps app repository metadata in one place and provides one command surface for cloning, pulling, status checks, builds, tests, version bumps, release notes, and signed internal release builds.

This hub does not publish to production. The default release target is internal testing.

## Android companion app

An installable Android companion lives in `android-app/`. It is a phone-friendly dashboard for the app registry, package names, release tracks, maintenance steps, and release reminders.

The Android app does not run the Windows PowerShell automation directly. Use the phone app for quick reference, then run `smith.ps1` commands on Windows for cloning, building, testing, and release preparation.

The companion updater checks repos under `BadBagger/<app-id>`. It can tell the difference between:

- repo missing
- repo exists but has no GitHub release yet
- latest release is available
- installed app version is current or behind

When a release has an APK attached, the Android app can download it and open Android's installer directly from the app. Android still requires the normal install confirmation and may ask you to allow DevHub to install unknown apps the first time.

## First setup

1. Keep this repository private.
2. Edit `apps.yml` and replace placeholder repo URLs, package names, and notes with the real app details.
3. Make sure Git can access each private repo through your local GitHub auth or SSH keys.
4. Confirm each Android app has a Gradle wrapper: `gradlew.bat`.
5. Keep signing keys, Play Store credentials, and `.env` files outside this repo.

## Common commands

```powershell
.\smith.ps1 clone all
.\smith.ps1 status
.\smith.ps1 pull all
.\smith.ps1 build all
.\smith.ps1 build workday-planner
.\smith.ps1 test renewal-radar
.\smith.ps1 bump workday-planner patch
.\smith.ps1 notes renewal-radar
.\smith.ps1 release renewal-radar internal
.\smith.ps1 github check
.\smith.ps1 github create
```

## Connecting GitHub repos

The hub currently targets the `BadBagger` GitHub account. `foldersmith-mobile` and `softsmith-devhub` already exist there; the other app repos need to be created and populated.

Check current repo/release status:

```powershell
.\smith.ps1 github check
```

Create missing repos after setting a token locally:

```powershell
$env:GITHUB_TOKEN = "your-token-here"
.\smith.ps1 github create
```

The token must have permission to create repositories. Do not paste it into files and do not commit it.

After creating repos, push each app source to its matching repo, then publish a GitHub release with an APK attached. The Android companion can detect the repo immediately, but update detection needs a release tag such as `v1.0.0`.

## App registry

Each app in `apps.yml` has:

- `id`: stable command id, such as `renewal-radar`.
- `name`: friendly app name.
- `repoUrl`: Git clone URL.
- `localFolder`: folder under this hub where the repo is cloned.
- `packageName`: Android application id.
- `appType`: app family or framework note.
- `playStoreTrack`: default Play Store track, usually `internal`.
- `notes`: operational notes and TODOs.

## Release safety

The release script builds an Android App Bundle with `bundleRelease` and blocks production publishing. It does not upload to Google Play.

Future TODOs:

- Add Play Store service account credentials as CI secrets.
- Add signing keys as local environment variables or CI secrets.
- Add Fastlane or Google Play Publishing API integration.
- Add manual approval gates before any beta or production promotion.

## GitHub Actions

The workflows are manually triggered. They are templates for private repos and need repo access configured before they can clone private app repositories.

TODO for CI:

- Add `SOFTSMITH_REPO_ACCESS_TOKEN` or SSH deploy keys.
- Add temporary signing key material handling for release builds.
- Add artifact retention rules.
- Add Play Store internal testing upload after local release flow is trusted.

## Folder layout

```text
softsmith-devhub/
  apps.yml
  smith.ps1
  clone-all.ps1
  check-github-repos.ps1
  create-github-repos.ps1
  pull-all.ps1
  status.ps1
  build-all.ps1
  test-all.ps1
  bump-version.ps1
  release-notes.ps1
  release-app.ps1
  scripts/lib/SoftSmith.DevHub.ps1
  docs/
  .github/workflows/
```
