# DecideLess-Mobile

A specialized React Native/Expo mobile application designed to help users combat decision fatigue. Whether you are struggling to pick what to eat, what to watch, or what to do next, DecideLess makes the choice for you.

## Features

- **Quick Randomization**: Instantly input options or use predefined categories to make quick, stress-free decisions.
- **Decision History**: Keep a log of past choices so you can track what you frequently decide.
- **Sleek Interface**: Built with an intuitive, minimalist UI designed for fast interactions.
- **Cross-Platform**: Developed using React Native and Expo, meaning it runs seamlessly on both iOS and Android.

## Tech Stack

- **Framework:** [React Native](https://reactnative.dev/)
- **Toolchain:** [Expo](https://expo.dev/) (SDK 54)
- **Routing:** [Expo Router](https://docs.expo.dev/router/introduction/) (v6)
- **Styling:** [NativeWind](https://www.nativewind.dev/) / Tailwind CSS
- **Icons:** [lucide-react-native](https://lucide.dev/guide/packages/lucide-react-native)

## Getting Started

### Prerequisites

- Node.js installed on your machine.
- [Expo Go](https://expo.dev/client) app installed on your iOS or Android device (for physical device testing).

### Installation

1. **Clone the repository** (if not already local):
   ```bash
   git clone https://github.com/Orman945/DecideLess-Mobile.git
   cd DecideLess-Mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   *or if utilizing yarn/bun:*
   ```bash
   yarn install
   # or
   bun install
   ```

### Running the App

To start the development server:

```bash
npm start
```
*(This will start Expo Metro bundler)*

From the terminal/bundler, you can:
- Press `a` to open in an Android Emulator.
- Press `i` to open in an iOS Simulator.
- Press `w` to open in a web browser.
- Scan the QR code with the **Expo Go** app on your physical device.

## Project Structure

A quick overview of the main directories:
- `/app`: Contains all the screens and routing logic powered by Expo Router.
- `/components`: Reusable UI components.
- `/assets`: Images, fonts, and static resources.
- `/constants`: Global app definitions (colors, themes, layouts).
- `/hooks`: Custom React hooks for shared logic.
- `/utils`: Helper functions.

## Building and Deployment

This project uses EAS (Expo Application Services) for deployment. 
To build the standalone app for app stores or test distribution, you leverage:
```bash
eas build
```
Check out the Expo documentation on [EAS Build](https://docs.expo.dev/build/introduction/) for detailed setup depending on your target OS.

## Environment Variables
If utilizing local API keys or secrets, ensure they are situated in `.env` files. 
*(Note: `.env` is ignored by git to protect sensitive data.)*
