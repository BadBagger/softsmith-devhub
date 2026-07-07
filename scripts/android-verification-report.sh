#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="$ROOT/android-app"
APP_GRADLE="$ANDROID_DIR/app/build.gradle.kts"
MANIFEST="$ANDROID_DIR/app/src/main/AndroidManifest.xml"

echo "Android Developer Verification local report"
echo "Root: $ROOT"
echo

echo "Identity"
grep -E 'namespace =|applicationId =|versionCode =|versionName =' "$APP_GRADLE" || true
grep -E 'android:label=|android:name=".MainActivity"|android.intent.action.MAIN|android.intent.category.LAUNCHER' "$MANIFEST" || true
echo

echo "Signing config references"
grep -nE 'signingConfig|signingConfigs|storeFile|storePassword|keyAlias|keyPassword' "$APP_GRADLE" || true
echo

cd "$ANDROID_DIR"
echo "Building debug APK"
./gradlew clean :app:assembleDebug
echo

echo "Building release APK"
if ./gradlew :app:assembleRelease; then
  RELEASE_BUILD_RESULT="passed"
else
  RELEASE_BUILD_RESULT="failed"
  echo "assembleRelease failed. If android-app/keystore.properties is missing, this is expected and prevents debug-signed releases."
fi
echo

APK_SIGNER="${APKSIGNER:-apksigner}"
if ! command -v "$APK_SIGNER" >/dev/null 2>&1; then
  echo "apksigner not found on PATH. Set APKSIGNER=/path/to/apksigner or add Android build-tools to PATH."
  exit 0
fi

echo "APK certificate fingerprints"
find "$ANDROID_DIR/app/build/outputs/apk" -name '*.apk' -type f | sort | while read -r apk; do
  echo
  echo "APK: $apk"
  CERT_OUTPUT="$("$APK_SIGNER" verify --verbose --print-certs "$apk")"
  echo "$CERT_OUTPUT"
  if echo "$CERT_OUTPUT" | grep -q 'CN=Android Debug'; then
    if echo "$apk" | grep -q '/release/'; then
      echo "WARNING: suspicious release APK signed by Android debug key."
    else
      echo "Label: debug-signed APK."
    fi
  elif echo "$apk" | grep -q '/release/'; then
    echo "Label: release-signed APK."
  fi
done

echo
echo "assembleRelease: $RELEASE_BUILD_RESULT"
