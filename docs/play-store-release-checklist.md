# Play Store Release Checklist

Use this checklist before uploading any SoftSmith Android app release.

## Build readiness

- [ ] App repo is on the intended release branch.
- [ ] Working tree is clean except intentional release changes.
- [ ] `versionCode` has increased.
- [ ] `versionName` matches the release plan.
- [ ] Tests pass locally or in CI.
- [ ] Release AAB builds successfully.
- [ ] Signing configuration uses local secrets or CI secrets only.

## Store readiness

- [ ] Default release target is internal testing.
- [ ] Release notes are generated and reviewed.
- [ ] App name, package name, and store listing match the selected app.
- [ ] Screenshots are current if UI changed.
- [ ] Data safety answers still match the app behavior.
- [ ] Permissions are justified and expected.

## Safety rules

- [ ] Do not auto-publish to production.
- [ ] Do not commit Play Store service account JSON.
- [ ] Do not commit keystores, passwords, or signing config secrets.
- [ ] Promote from internal testing only after install verification.

## Future automation TODOs

- [ ] Add Fastlane or Google Play Publishing API upload for internal testing.
- [ ] Add service account credentials through GitHub Actions secrets.
- [ ] Add manual approval gates for beta and production tracks.
- [ ] Add release artifact checksums.
