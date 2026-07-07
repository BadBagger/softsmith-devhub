# Smithware DevHub Release Signing

Release APKs for `com.softsmith.devhub` must not be signed with the Android debug key. Debug-signed APKs are acceptable for local testing only and should not be used as the long-term identity for Smithware DevHub, GitHub Releases, direct APK installs, or Android developer verification.

## Files

- Local signing file: `android-app/keystore.properties`
- Safe sample file: `android-app/keystore.properties.example`
- Release keystore: keep outside git, for example under a private backup folder.

Never commit `keystore.properties`, `.jks`, `.keystore`, passwords, key aliases, Play service account credentials, or signing secrets.

## Create A Release Keystore

Run this from a private folder, not from a repo folder:

```powershell
keytool -genkeypair -v -keystore smithware-devhub-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias smithware-devhub
```

Back up the keystore securely. Losing it can break updates for APKs distributed outside Google Play because Android requires future updates to be signed with the same signing key.

## Configure Local Signing

Copy the example file:

```powershell
Copy-Item android-app\keystore.properties.example android-app\keystore.properties
```

Edit `android-app\keystore.properties` locally:

```properties
storeFile=C:/absolute/path/to/smithware-devhub-release.jks
storePassword=CHANGE_ME
keyAlias=smithware-devhub
keyPassword=CHANGE_ME
```

Use your real local keystore path and passwords. Do not paste those values into chat, commit them, or upload them.

## Build

Debug build:

```powershell
cd android-app
.\gradlew.bat clean
.\gradlew.bat :app:assembleDebug
```

Release build:

```powershell
cd android-app
.\gradlew.bat :app:assembleRelease
```

If `keystore.properties` is missing, `assembleRelease` should fail clearly. That is intentional and safer than producing a release APK signed with the Android debug key.

## Verify The APK

Make sure `apksigner` is on PATH. On this machine, the Android build tools are usually under the local SDK:

```powershell
$env:JAVA_HOME='C:\Users\KyleB\Documents\Codex\2026-07-04\build-a-native-android-app-using\.local-jdk\jdk-17.0.19+10'
$env:ANDROID_HOME='C:\Users\KyleB\Documents\Codex\2026-07-04\build-a-native-android-app-using\.android-sdk'
$env:ANDROID_SDK_ROOT=$env:ANDROID_HOME
$env:Path="$env:JAVA_HOME\bin;$env:ANDROID_HOME\build-tools\36.0.0;$env:Path"
```

Verify the signed release APK:

```powershell
apksigner verify --verbose --print-certs app\build\outputs\apk\release\app-release.apk
```

Copy the signer certificate SHA-256 digest from that output. For Android developer verification outside Google Play, register:

- Package name: `com.softsmith.devhub`
- SHA-256 certificate fingerprint: the real release certificate SHA-256, not the Android debug certificate.

The Android debug certificate DN is `C=US, O=Android, CN=Android Debug`. If the release APK shows that DN, do not publish it as the final outside-Play release.
