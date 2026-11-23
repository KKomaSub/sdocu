#!/bin/bash
set -euo pipefail
pkg=com.kkomaweb.sudokumate
tools="$ANDROID_HOME/build-tools/35.0.0"
apk=$(find "$RUNNER_TEMP/mate" -name '*-unsigned.apk' -print -quit)
keytool -genkeypair -keystore "$RUNNER_TEMP/emulator.p12" -alias emulator -keyalg RSA -validity 2 -storepass android -keypass android -dname CN=Emulator
"$tools/apksigner" sign --ks "$RUNNER_TEMP/emulator.p12" --ks-pass pass:android --out "$RUNNER_TEMP/emulator.apk" "$apk"
adb install "$RUNNER_TEMP/emulator.apk"
adb shell am start -W -n "$pkg/.GameActivity"
for _ in $(seq 1 20); do
    adb shell uiautomator dump /sdcard/mate-ui.xml >/dev/null 2>&1 || true
    if adb shell cat /sdcard/mate-ui.xml > "$RUNNER_TEMP/mate-ui.xml" 2>/dev/null && grep -Eq 'Tap a cell|Skip|Choose a puzzle|건너뛰기|문제 고르기' "$RUNNER_TEMP/mate-ui.xml"; then
        adb shell input keyevent KEYCODE_HOME
        adb shell am start -W -n "$pkg/.GameActivity"
        adb shell pidof "$pkg"
        exit 0
    fi
    sleep 1
done
adb shell cat /sdcard/mate-ui.xml || true
adb logcat -b crash -d
exit 1
