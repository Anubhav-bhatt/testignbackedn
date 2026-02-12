---
description: Build an Android APK for Legal-IQ using Expo Application Services (EAS)
---

To generate a testable APK for your Android device, follow these steps:

### 1. Install EAS CLI
Open your terminal and install the Expo Application Services CLI globally:
```bash
npm install -g eas-cli
```

### 2. Login to Expo
You will need an Expo account. If you don't have one, create it at [expo.dev](https://expo.dev).
```bash
eas login
```

### 3. Configure the Build
Initialize the EAS configuration in your project:
```bash
eas build:configure
```

### 4. Update `eas.json` for APK
By default, EAS generates an `.aab` file for the Play Store. To get a direct `.apk` for testing, ensure your `eas.json` has the `buildType` set to `apk`. I have prepared this for you below.

### 5. Start the Build
Run the following command to start the cloud build:
```bash
eas build --platform android --profile preview
```

### 6. Install on Device
Once the build is finished (usually 5-10 mins), Expo will provide a QR code or a link to download the `.apk` file directly to your phone.
