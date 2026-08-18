# Scholar — Windows Desktop App

An installable Windows app that opens the Scholar web app in its own window. It
uses the same **cloud database (Supabase)** as the website, so every computer
that installs it sees the same data. Links (WhatsApp / SMS / Telegram) open in
your system's default app, and the window auto-retries if the connection drops.

## Build the installer

Requires **Node.js** installed (which you already have).

```bash
cd desktop
npm install        # downloads Electron (~1–2 min the first time)
npm run dist       # builds the Windows installer
```

The installer is created at:

```
desktop/dist/Scholar Setup 1.0.0.exe
```

Double-click it to install (creates a Start-menu + desktop shortcut). To put
Scholar on other computers, just copy that `Scholar Setup 1.0.0.exe` to each PC
and run it — no Node.js needed on those machines.

Prefer a no-install version? `npm run dist:portable` builds a single portable
`Scholar 1.0.0.exe` you can run directly.

## Test without building

```bash
cd desktop
npm install
npm start
```

## Point it at a different URL

The app opens `https://schoolmanagementwebappp.netlify.app` by default. If you
rename the Netlify site or add a custom domain, edit `APP_URL` at the top of
`main.js` and rebuild.
