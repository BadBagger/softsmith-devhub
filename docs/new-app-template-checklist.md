# New App Template Checklist

Use this when adding a new Android app to the SoftSmith suite.

## Repository setup

- [ ] Create a private GitHub repository.
- [ ] Add a clear README.
- [ ] Add Android Gradle wrapper files.
- [ ] Add `.gitignore` for Android build outputs and local secrets.
- [ ] Confirm the app builds from a clean clone on Windows.

## Android setup

- [ ] Choose package name under `com.softsmith`.
- [ ] Set initial `versionCode`.
- [ ] Set initial `versionName`.
- [ ] Configure release signing through environment variables or local files outside Git.
- [ ] Confirm debug and release build variants.

## DevHub registration

- [ ] Add the app to `apps.yml`.
- [ ] Use a stable lowercase `id`.
- [ ] Set `playStoreTrack` to `internal`.
- [ ] Run `.\smith.ps1 clone <app-id>`.
- [ ] Run `.\smith.ps1 build <app-id>`.
- [ ] Run `.\smith.ps1 test <app-id>`.

## Play Store preparation

- [ ] Create the Play Console app entry.
- [ ] Save service account credentials outside the repo.
- [ ] Add signing key handling to local environment or CI secrets.
- [ ] Prepare internal testing notes.
- [ ] Do not enable production publishing from DevHub.
