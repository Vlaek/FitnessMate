This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load Inter, a custom Google Font.

## Deploy on Vercel

To deploy this application on Vercel, we recommend using the Vercel Web UI:

### Connect your Git Repository (Recommended)

1. Push this repository to GitHub/GitLab/Bitbucket
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project" and import your project
4. In project settings, configure:
   - **FRAMEWORK PRESET**: Auto-detected (Next.js)
   - **ROOT DIRECTORY**: `apps/web` (important to set this!)
   - **BUILD COMMAND**: `cd ../.. && pnpm --dir apps/web run build`
   - **OUTPUT DIRECTORY**: `apps/web/.next`
5. Click "Deploy"

⚠️ **Note:** Due to monorepo complexity, CLI deployment (`vercel --prod`) may fail with "Command 'npm install' exited with 1". If this occurs, use the Vercel Web UI approach as described above.

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
