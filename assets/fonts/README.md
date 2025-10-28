This project uses the Satoshi font family. To enable it, add the following font files to this directory:

- Satoshi-Regular.ttf
- Satoshi-Medium.ttf
- Satoshi-SemiBold.ttf
- Satoshi-Bold.ttf
- Satoshi-Mono.ttf

Place the exact filenames above in `assets/fonts/` (they are referenced in `app/_layout.tsx`).

Notes:
- Satoshi is not bundled here due to licensing. Obtain the fonts from the vendor or your design team.
- After adding fonts, rebuild your dev client if you are testing native builds, or restart Metro (`expo start -c`).
