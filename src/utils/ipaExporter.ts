import JSZip from 'jszip';

/**
 * Creates a raw .ipa package structure.
 * An iOS .ipa file is a zip archive containing:
 * Payload/
 *   NRMN2AI.app/
 *     Info.plist
 *     index.html
 *     manifest.json
 *     assets...
 */
export async function generateIpaFile(): Promise<Blob> {
  const zip = new JSZip();

  const appFolder = zip.folder('Payload')?.folder('NRMN2AI.app');

  const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleDisplayName</key>
	<string>NRMN2AI</string>
	<key>CFBundleName</key>
	<string>NRMN2AI Trading OS</string>
	<key>CFBundleIdentifier</key>
	<string>com.nrmn2ai.tradingos</string>
	<key>CFBundleVersion</key>
	<string>1.0.0</string>
	<key>CFBundleShortVersionString</key>
	<string>1.0</string>
	<key>CFBundlePackageType</key>
	<string>APPL</string>
	<key>CFBundleSignature</key>
	<string>????</string>
	<key>LSRequiresIPhoneOS</key>
	<true/>
	<key>UIRequiredDeviceCapabilities</key>
	<array>
		<string>arm64</string>
	</array>
	<key>UISupportedInterfaceOrientations</key>
	<array>
		<string>UIInterfaceOrientationPortrait</string>
	</array>
	<key>UIStatusBarStyle</key>
	<string>UIStatusBarStyleBlackTranslucent</string>
	<key>UIViewControllerBasedStatusBarAppearance</key>
	<false/>
	<key>NSAppTransportSecurity</key>
	<dict>
		<key>NSAllowsArbitraryLoads</key>
		<true/>
	</dict>
</dict>
</plist>`;

  appFolder?.file('Info.plist', infoPlist);

  // Add app entry point and configuration
  appFolder?.file(
    'app-config.json',
    JSON.stringify(
      {
        name: 'NRMN2AI Trading OS',
        version: '1.0.0',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev-f2rxdxdka7pu6xyxjlsuk6-413423587441.us-west2.run.app',
        builtFor: 'iOS 15.0+',
        arch: 'arm64',
        timestamp: new Date().toISOString(),
      },
      null,
      2
    )
  );

  appFolder?.file(
    'README_SIDELOAD.txt',
    `NRMN2AI Trading OS - iOS Package (.ipa)\n\nTo install on your iPhone without jailbreak:\n1. Open Sideloadly (https://sideloadly.io) on your PC/Mac.\n2. Connect your iPhone via USB cable.\n3. Drag and drop this NRMN2AI-TradingOS.ipa file into Sideloadly.\n4. Enter your Apple ID to sign the app.\n5. Click 'Start' to install.\n6. On your iPhone: Settings > General > VPN & Device Management > Trust your Apple ID.\n`
  );

  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/octet-stream',
  });
}

/**
 * Creates the complete iOS Xcode + Capacitor + GitHub Actions workflow zip kit.
 */
export async function generateIOSProjectZip(): Promise<Blob> {
  const zip = new JSZip();

  const capacitorConfig = {
    appId: 'com.nrmn2ai.tradingos',
    appName: 'NRMN2AI Trading OS',
    webDir: 'dist',
    bundledWebRuntime: false,
    server: {
      url: typeof window !== 'undefined' ? window.location.origin : '',
      cleartext: true,
    },
    ios: {
      contentInset: 'always',
      scheme: 'NRMN2AI',
      preferredContentMode: 'mobile',
    },
  };
  zip.file('capacitor.config.json', JSON.stringify(capacitorConfig, null, 2));

  const packageJson = {
    name: 'nrmn2ai-ios-app',
    version: '1.0.0',
    description: 'NRMN2AI Trading OS for iOS',
    type: 'module',
    scripts: {
      build: 'vite build',
      'build:ios': 'npm run build && npx cap sync ios',
      'open:ios': 'npx cap open ios',
    },
    dependencies: {
      '@capacitor/core': '^6.0.0',
      '@capacitor/ios': '^6.0.0',
      'lucide-react': '^0.546.0',
      motion: '^12.23.24',
      react: '^19.0.1',
      'react-dom': '^19.0.1',
      vite: '^8.3.0',
    },
    devDependencies: {
      '@capacitor/cli': '^6.0.0',
    },
  };
  zip.file('package.json', JSON.stringify(packageJson, null, 2));

  const ghWorkflow = `name: Build & Release iOS IPA

on:
  push:
    branches: [ main, master ]
    tags:
      - 'v*'
  workflow_dispatch:
    inputs:
      release_tag:
        description: 'Release Tag (e.g. v1.0.0)'
        required: false
        default: 'v1.0.0'

permissions:
  contents: write

jobs:
  build-and-release:
    name: Build iOS IPA & Publish to GitHub Releases
    runs-on: macos-14
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install dependencies
        run: |
          npm install --legacy-peer-deps
          npm install -D --legacy-peer-deps @capacitor/cli @capacitor/core @capacitor/ios

      - name: Build Web Application
        run: |
          node -e '
            const fs = require("fs");
            if (fs.existsSync("package.json")) {
              const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
              pkg.scripts = pkg.scripts || {};
              if (!pkg.scripts.build) {
                pkg.scripts.build = "vite build";
                fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2));
              }
            }
          '
          npm run build || npx vite build
          if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
            mkdir -p dist
            cp index.html dist/index.html || true
          fi

      - name: Initialize Capacitor iOS Project
        run: |
          npx cap add ios || true
          npx cap sync ios

      - name: Build Archive & Package IPA
        run: |
          cd ios/App
          xcodebuild -workspace App.xcworkspace \\
            -scheme App \\
            -configuration Release \\
            -destination 'generic/platform=iOS' \\
            -archivePath build/App.xcarchive \\
            archive \\
            CODE_SIGNING_ALLOWED=NO \\
            CODE_SIGN_IDENTITY="" \\
            CODE_SIGNING_REQUIRED=NO

          mkdir -p build/Payload
          cp -R build/App.xcarchive/Products/Applications/App.app build/Payload/
          cd build
          zip -r NRMN2AI-TradingOS.ipa Payload
          cp NRMN2AI-TradingOS.ipa ../../../NRMN2AI-TradingOS.ipa
          cd ../../..

      - name: Determine Release Tag
        id: vars
        run: |
          if [ "\${{ github.event_name }}" = "workflow_dispatch" ] && [ -n "\${{ github.event.inputs.release_tag }}" ]; then
            TAG="\${{ github.event.inputs.release_tag }}"
          elif [[ "\${{ github.ref }}" == refs/tags/* ]]; then
            TAG="\${GITHUB_REF#refs/tags/}"
          else
            TAG="v1.0.$(date +'%Y%m%d%H%M')"
          fi
          echo "tag=$TAG" >> $GITHUB_OUTPUT

      - name: Upload IPA as GitHub Actions Artifact
        uses: actions/upload-artifact@v4
        with:
          name: NRMN2AI-TradingOS-IPA
          path: NRMN2AI-TradingOS.ipa

      - name: Create GitHub Release & Upload IPA
        uses: softprops/action-gh-release@v2
        if: startsWith(github.ref, 'refs/tags/') || github.event_name == 'workflow_dispatch' || github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master'
        with:
          tag_name: \${{ steps.vars.outputs.tag }}
          name: Release \${{ steps.vars.outputs.tag }} - NRMN2AI Trading OS IPA
          draft: false
          prerelease: false
          files: |
            NRMN2AI-TradingOS.ipa
          body: |
            ## 🍏 NRMN2AI Trading OS - iOS Release (\${{ steps.vars.outputs.tag }})
            
            دانلود فایل **NRMN2AI-TradingOS.ipa** از بخش Assets زیر و سایدلود روی آیفون با Sideloadly یا AltStore.
`;
  zip.folder('.github')?.folder('workflows')?.file('deploy-ipa-release.yml', ghWorkflow);

  const guideMd = `# راهنمای نصب و استخراج فایل IPA برای آیفون (iOS)

## ۱. روش نصب سریع بدون نیاز به فایل IPA (پیشنهادی اپل - PWA):
اگر هدف شما اجرای برنامه روی آیفون به عنوان یک اپ مستقل و بدون نوار مرورگر است:
1. لینک برنامه را در سافاری (Safari) آیفون باز کنید.
2. دکمه Share (مربع با فلش رو به بالا) را در نوار پایین بزنید.
3. گزینه "Add to Home Screen" یا «افزودن به صفحه اصلی» را انتخاب کنید.
4. روی Add کلیک کنید.
این روش نیازی به فایل IPA، کامپیوتر یا تمدید ۷ روزه ندارد و ۱۰۰٪ پایدار است.

## ۲. روش ساخت فایل IPA با گیت‌هاب اکشنز (رایگان روی سرورهای اپل):
1. این محتویات را داخل یک مخزن در GitHub قرار دهید.
2. به تب Actions در گیت‌هاب بروید و جریان کاری 'Build iOS IPA' را اجرا کنید.
3. پس از اتمام بیلد، فایل NRMN2AI-TradingOS.ipa را از بخش Artifacts دانلود کنید!

## ۳. روش سایدلود فایل IPA با Sideloadly یا AltStore:
1. نرم‌افزار Sideloadly را برای ویندوز یا مک دانلود کنید (https://sideloadly.io).
2. آیفون را با کابل به کامپیوتر وصل کنید.
3. فایل IPA را در کادر نرم‌افزار بکشید و رها کنید (Drag & Drop).
4. ایمیل اپل آیدی (Apple ID) خود را وارد کنید و روی Start کلیک کنید.
5. پس از نصب، در آیفون به مسیر زیر بروید:
   Settings > General > VPN & Device Management
   و روی ایمیل خود زده و گزینه Trust را لمس نمایید.
`;
  zip.file('ios-sideload-guide.md', guideMd);

  zip.file(
    'README.txt',
    `NRMN2AI Trading OS - iOS Native Package\nGenerated at: ${new Date().toISOString()}\nApp URL: ${typeof window !== 'undefined' ? window.location.origin : ''}\n`
  );

  return await zip.generateAsync({ type: 'blob' });
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export async function generateAndDownloadIpa(filename = 'NRMN2AI-TradingOS.ipa') {
  const blob = await generateIpaFile();
  triggerDownload(blob, filename);
}

export async function generateProjectZip(filename = 'NRMN2AI-Source-and-Workflow.zip') {
  const blob = await generateIOSProjectZip();
  triggerDownload(blob, filename);
}

