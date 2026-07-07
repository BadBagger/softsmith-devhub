# Android Developer Verification Readiness

App:
- App name: Smithware Studios
- Package name / applicationId: `com.softsmith.devhub`
- Namespace: `com.softsmith.devhub`
- Version: `2.1.23-signed-app-refresh` (`versionCode` 46)
- Manifest package: not declared; Gradle `applicationId` is authoritative.
- Launcher Activity: `com.softsmith.devhub.MainActivity`
- Release artifact names:
  - Generated debug APK: `android-app/app/build/outputs/apk/debug/app-debug.apk`
  - Generated release APK: `android-app/app/build/outputs/apk/release/app-release.apk`
  - DevHub/GitHub release convention: `DevHub.apk`, `DevHub-release-<version>.apk`
- Distribution channels:
  - Google Play: possible/manual, not verified by this repo audit.
  - Smithware DevHub: yes.
  - GitHub Releases: yes.
  - Direct APK install: yes.

Signing:
- Debug builds use the Android debug key.
- Previous release builds used `signingConfigs.getByName("debug")`; that caused release APKs to be debug-signed.
- Release builds now use `signingConfigs.getByName("release")`.
- Release signing values are loaded from local-only `android-app/keystore.properties`.
- If `android-app/keystore.properties` is missing or incomplete, release tasks fail clearly instead of falling back to the debug key.
- `android-app/local.properties` exists locally and is ignored; its contents were not printed.
- No committed `.jks`, `.keystore`, `keystore.properties`, `signing.properties`, APK, or AAB files were found by `git ls-files` during the original audit.

APK fingerprints:

Debug APK:
- APK path: `android-app/app/build/outputs/apk/debug/app-debug.apk`
- Signer certificate DN: `C=US, O=Android, CN=Android Debug`
- Signer certificate SHA-256 digest: `2749d9ee3786a974665b0e6d039780143f4a0bc5215d20a05278ce16b06b75ed`
- Signer certificate SHA-1 digest: `7d80b41801d56f07dca30a60da65373dab3b4d9f`
- Use: temporary/local testing only.

Release APK:
- APK path: `android-app/app/build/outputs/apk/release/app-release.apk`
- Verified: yes
- Verified using APK Signature Scheme v2: true
- Signer certificate DN: `CN=Smithware DevHub, OU=Smithware Studios, O=Smithware Studios, L=Local, ST=NA, C=US`
- Signer certificate SHA-256 digest: `a7804e97db126da98c1b8959115ea24ef22d1986ab0f6c901601970f2c3e5342`
- Signer certificate SHA-1 digest: `851111ef8b48899048db878442596b6efd097d11`

Important signing conclusion:
- The Android debug SHA-256 is only for temporary/internal testing.
- Do not register the Android debug certificate as the final outside-Play signing identity.
- Register `com.softsmith.devhub` plus release certificate SHA-256 `a7804e97db126da98c1b8959115ea24ef22d1986ab0f6c901601970f2c3e5342` for outside-Play distribution.

Registration checklist:
- Confirm app exists in Play Console if distributed through Play.
- Confirm Play-distributed app was automatically registered.
- If distributing APK outside Play, register the package name and SHA-256 signing certificate fingerprint.
- If using a different release key outside Play than Google Play App Signing, register that additional key.
- Do not publicly distribute debug-signed APKs.
- Keep release keystore backed up securely.
- Do not commit signing secrets.

DevHub compatibility:
- Package name is stable: `com.softsmith.devhub`.
- Current versionName/versionCode are `2.1.23-signed-app-refresh` / `46`.
- App label is `Smithware Studios`.
- DevHub release asset naming convention expects `DevHub.apk` plus a versioned APK asset.
- Current Gradle release output is `app-release.apk`; GitHub release packaging scripts rename/copy it to `DevHub.apk`.
- No debug APK should be treated as a public release asset.

Commands used:
- `git status --short`
- `Get-Content AGENTS.md`
- `Get-Content PROJECT_CONTEXT.md`
- `Get-Content apps.yml`
- `Get-Content android-app/app/build.gradle.kts`
- `Get-Content .gitignore`
- `Get-ChildItem -Force android-app`
- `rg -n "signingConfig|signingConfigs|keystore|storePassword|keyAlias|debug|release" -S .`
- `./gradlew.bat clean`
- `./gradlew.bat :app:assembleDebug`
- `./gradlew.bat :app:assembleRelease`

Results:
- `clean`: passed after signing-config change.
- `assembleDebug`: passed after signing-config change.
- `assembleRelease`: passed after local release keystore creation.
- APK fingerprint extraction: passed.
- Issues found:
  - Release builds were explicitly configured to use the debug signing config.
  - The previous release APK was debug-signed and should not be registered as the final public/outside-Play signing identity.
- Fixes applied:
  - Replaced release debug signing with a dedicated `release` signing config.
  - Added local-only `android-app/keystore.properties` pattern.
  - Added `android-app/keystore.properties.example` with placeholders only.
  - Added `docs/RELEASE_SIGNING.md`.
  - Updated `scripts/android-verification-report.sh` to label debug-signed APKs and suspicious debug-signed release APKs.
  - Created a private local release keystore outside the repo.
  - Created ignored local `android-app/keystore.properties`.
- Manual steps still needed:
  - Register `com.softsmith.devhub` and the real release SHA-256 certificate fingerprint for outside-Play distribution.
  - Back up the private release keystore and ignored `android-app/keystore.properties` securely.
