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

To deploy this application on Vercel, you have two options:

### Option 1: Using Vercel CLI

1. Install the Vercel CLI:
```bash
npm i -g vercel
```

2. Navigate to the web app directory:
```bash
cd apps/web
```

3. Run the deploy command:
```bash
vercel --prod
```

### Option 2: Connect your Git Repository

1. Push this repository to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import your project from GitHub
5. Configure your project:
   - Framework Preset: Next.js
   - Root Directory: `apps/web`
6. Click "Deploy"

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
