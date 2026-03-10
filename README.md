# Steady

Daily speech pace trainer. Practice reading aloud and speaking at a calm, steady pace with guided exercises.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build for production

```bash
npm run build
npm run preview  # preview the build locally
```

## Deploy to Coolify

1. Create a new resource in Coolify and connect your Git repo
2. Set the build pack to **Nixpacks** (default)
3. Set the build command to `npm run build`
4. Set the publish directory to `dist`
5. Deploy

No environment variables needed.
