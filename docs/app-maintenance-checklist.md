# App Maintenance Checklist

Use this during routine SoftSmith app maintenance.

## Weekly

- [ ] Run `.\smith.ps1 status`.
- [ ] Pull current changes with `.\smith.ps1 pull all`.
- [ ] Build all apps with `.\smith.ps1 build all`.
- [ ] Run tests with `.\smith.ps1 test all`.
- [ ] Review dependency update notices in each app.
- [ ] Check open GitHub issues and PRs.

## Before feature work

- [ ] Confirm the app id in `apps.yml`.
- [ ] Confirm the local repo path exists.
- [ ] Pull latest changes.
- [ ] Create or switch to a feature branch inside the app repo.
- [ ] Run a quick build before editing.

## Before release work

- [ ] Run status and confirm no unrelated local changes.
- [ ] Bump app version with `.\smith.ps1 bump <app-id> patch`.
- [ ] Generate notes with `.\smith.ps1 notes <app-id>`.
- [ ] Build internal release with `.\smith.ps1 release <app-id> internal`.
- [ ] Install and test the release build on a real device or emulator.

## Security hygiene

- [ ] Keep secrets out of `apps.yml`.
- [ ] Keep signing keys outside this repo.
- [ ] Rotate credentials if they were ever copied into a working tree.
- [ ] Prefer fine-scoped tokens and deploy keys for CI.
