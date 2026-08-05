# jwmla — Luxury E-Commerce Site

A fast, framework-free (vanilla HTML/CSS/JS) storefront with a Firebase backend.
White/black luxury design, mobile-first, RTL support for Kurdish (Sorani) and Arabic,
no-login admin gated by a password popup.

## Files

| File | Purpose |
|---|---|
| `index.html` | Page structure — header, hero, product grid, modals, footer |
| `style.css` | All styling, animations, responsive + RTL rules |
| `script.js` | App logic: rendering, search/filter, i18n, admin gate |
| `firebase.js` | Firebase init + Firestore/Storage exports |

No build step. No npm install. Just static files.

## 1. Create your Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project**.
2. Once created, go to **Build → Firestore Database → Create database** (production mode, pick a nearby region).
3. Go to **Build → Storage → Get started** (production mode).
4. Go to **Project settings → General → Your apps → Add app → Web (`</>`)**.
   Register the app (no need for Firebase Hosting) and copy the `firebaseConfig` object.

## 2. Connect the app to your project

Open `firebase.js` and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

## 3. Security rules

This project has **no user accounts** — the admin password popup is a client-side
convenience gate only, exactly as requested. To keep the database usable by the
public storefront while still allowing the admin flows to write, use these rules
(Firestore → Rules, and Storage → Rules):

**Firestore rules:**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read: if true;
      allow write: if true; // gated client-side by the "1234Halo" password popup
    }
  }
}
```

**Storage rules:**
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if true; // gated client-side by the "1234Halo" password popup
    }
  }
}
```

> Want stronger protection later? Add Firebase App Check, or move writes behind
> a Cloud Function that checks a server-side secret instead of trusting the client.
> The current setup matches the brief: no login page, just a password popup.

## 4. Run it locally

Because `firebase.js` and `script.js` are ES modules, open the folder with any
static file server (opening `index.html` directly via `file://` will block module
imports in some browsers):

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then visit `http://localhost:8080` (or whatever port your server prints).

## 5. Deploy to Cloudflare Pages

1. Push this folder to a GitHub/GitLab repo (or drag-and-drop deploy in the
   Cloudflare dashboard).
2. Cloudflare Pages → **Create a project** → connect your repo.
3. Build settings:
   - **Framework preset:** None
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/` (the repo root, since these are static files)
4. Deploy. Cloudflare serves `index.html`, `style.css`, `script.js`, `firebase.js`
   directly — no build step needed.
5. Firebase will work from any domain by default; if you tighten API key
   restrictions in Google Cloud Console, add your `*.pages.dev` domain (and any
   custom domain) to the allowed referrers.

## How the admin flow works

- There's **no login page or account system**.
- Clicking **+ Add Product**, or **Edit**/**Delete** on any product, opens a
  password popup.
- Correct password (`1234Halo`) unlocks the action for that click; wrong
  password shows an inline error and denies access.
- Adding/editing writes straight to Firestore (`onSnapshot` keeps every visitor's
  grid live — no page reloads, no manual refresh).
- Images are uploaded to Firebase Storage; the resulting URLs are stored on the
  product document. Deleting a product also attempts to delete its images from
  Storage.
- Products persist forever until an admin explicitly deletes them.

## Customization notes

- **Phone number** appears in the contact strip, footer, floating Call/WhatsApp
  buttons, and product modal. It's set in `index.html` (`tel:07508457841` and
  `wa.me/9647508457841`) — update both if the number changes.
- **Languages**: `script.js` has an EN/KU/AR dictionary (`translations`). Add a
  new key to all three objects to add new translatable text.
- **Categories** are free-text on the add/edit form — the header's category
  menu and the form's autocomplete list rebuild automatically from whatever
  categories exist on your products.
