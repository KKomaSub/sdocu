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
        for mode in threebutton gestural; do
            overlay=com.android.internal.systemui.navbar.$mode
            adb shell cmd overlay enable-exclusive --category "$overlay"
            sleep 2
            adb shell uiautomator dump /sdcard/mate-ui.xml
            adb shell cat /sdcard/mate-ui.xml > "$RUNNER_TEMP/mate-ui.xml"
            python3 android/qa/check-insets.py "$RUNNER_TEMP/mate-ui.xml" "$mode"
        done
        adb shell input keyevent KEYCODE_HOME
        adb shell am start -W -n "$pkg/.GameActivity"
        adb shell pidof "$pkg"
        # The emulator package uses a temporary signing key. Target its package
        # explicitly when testing the same browsable URL on cold and warm launch.
        adb shell am force-stop "$pkg"
        for code in 0041 0042; do
            adb shell am start -W -a android.intent.action.VIEW -c android.intent.category.BROWSABLE -d "https://xn--hq1b25zp3j.kro.kr/invite?room=$code" -p "$pkg"
            found=false
            for attempt in $(seq 1 10); do
                adb shell uiautomator dump /sdcard/mate-invite.xml >/dev/null 2>&1 || continue
                adb shell cat /sdcard/mate-invite.xml > "$RUNNER_TEMP/mate-invite.xml"
                if grep -Eq "$code|Connecting|connect|연결|room|Room|입장|찾지" "$RUNNER_TEMP/mate-invite.xml"; then found=true; break; fi
            done
            if ! $found; then cat "$RUNNER_TEMP/mate-invite.xml"; exit 1; fi
        done
        python3 android/qa/share-return.py "$apk"
        exit 0
    fi
    sleep 1
done
adb shell cat /sdcard/mate-ui.xml || true
adb logcat -b crash -d
exit 1
