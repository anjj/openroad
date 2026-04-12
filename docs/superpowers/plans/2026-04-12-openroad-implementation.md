# openRoad Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a minimalist roadmap visualizer that connects to GitHub Milestones and calculates risk using a health index.

**Architecture:** Next.js App Router with Server Actions for data fetching. NextAuth.js for GitHub OAuth. Tailwind CSS for the UI.

**Tech Stack:** Next.js, Auth.js, Octokit, Tailwind CSS, Lucide.

---

### Task 1: Project Initialization and Dependencies

**Files:**
- Create: `package.json`
- Create: `tailwind.config.ts`
- Create: `next.config.mjs`
- Create: `postcss.config.js`

- [ ] **Step 1: Create `package.json` with required dependencies**

```json
{
  "name": "openroad",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@octokit/rest": "^20.1.1",
    "lucide-react": "^0.363.0",
    "next": "14.1.4",
    "next-auth": "^4.24.7",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.2"
  },
  "devDependencies": {
    "@types/node": "^20.12.2",
    "@types/react": "^18.2.73",
    "@types/react-dom": "^18.2.22",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.4.3"
  }
}
```

- [ ] **Step 2: Initialize Tailwind with Golive branding**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        golive: {
          red: "#E40032",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
        montserrat: ["var(--font-montserrat)"],
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 3: Run installation**

Run: `npm install`
Expected: Dependencies installed without errors.

- [ ] **Step 4: Commit**

```bash
git add package.json tailwind.config.ts next.config.mjs postcss.config.js
git commit -m "chore: initial project setup and dependencies"
```

---

### Task 2: Authentication Setup (Auth.js)

**Files:**
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `.env.local`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create `.env.local` template**

```text
GITHUB_ID=your_client_id
GITHUB_SECRET=your_client_secret
NEXTAUTH_SECRET=a_random_string
NEXTAUTH_URL=http://localhost:3000
```

- [ ] **Step 2: Configure NextAuth with GitHub Provider**

```typescript
import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";

const handler = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: { params: { scope: 'repo' } },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }: any) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
```

- [ ] **Step 3: Update `src/app/layout.tsx` with Fonts and Styling**

```tsx
import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });

export const metadata: Metadata = {
  title: "openRoad",
  description: "Minimalist GitHub Roadmap",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${montserrat.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/auth/ src/app/layout.tsx
git commit -m "feat: setup next-auth with github provider"
```

---

### Task 3: Risk Calculation Logic

**Files:**
- Create: `src/lib/risk.ts`
- Create: `src/lib/risk.test.ts`

- [ ] **Step 1: Implement Health Index calculation**

```typescript
export type RiskStatus = 'green' | 'yellow' | 'red';

export interface MilestoneData {
  title: string;
  closed_issues: number;
  open_issues: number;
  created_at: string;
  due_on: string | null;
}

export function calculateRisk(milestone: MilestoneData): RiskStatus {
  if (!milestone.due_on) return 'green';
  
  const total = milestone.open_issues + milestone.closed_issues;
  if (total === 0) return 'green';
  
  const progress = milestone.closed_issues / total;
  const start = new Date(milestone.created_at).getTime();
  const end = new Date(milestone.due_on).getTime();
  const now = new Date().getTime();
  
  if (now > end && milestone.open_issues > 0) return 'red';
  
  const totalDuration = end - start;
  const elapsedDuration = now - start;
  const timeProgress = Math.min(1, Math.max(0, elapsedDuration / totalDuration));
  
  const healthIndex = progress - timeProgress;
  
  if (healthIndex >= 0) return 'green';
  if (healthIndex > -0.2) return 'yellow';
  return 'red';
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/risk.ts
git commit -m "feat: implement health index risk calculation"
```

---

### Task 4: GitHub Data Fetching (Server Actions)

**Files:**
- Create: `src/lib/github.ts`
- Create: `src/lib/octokit.ts`

- [ ] **Step 1: Create Octokit Factory**

```typescript
import { Octokit } from "@octokit/rest";
import { getServerSession } from "next-auth/next";

export async function getOctokit() {
  const session = await getServerSession() as any;
  if (!session?.accessToken) {
    throw new Error("No access token found");
  }
  return new Octokit({ auth: session.accessToken });
}
```

- [ ] **Step 2: Implement Milestone Fetching**

```typescript
'use server';
import { getOctokit } from './octokit';
import { calculateRisk, RiskStatus } from './risk';

export interface MilestoneResult {
  id: number;
  title: string;
  description: string | null;
  state: string;
  open_issues: number;
  closed_issues: number;
  due_on: string | null;
  health: RiskStatus;
  progress: number;
}

export async function getMilestones(owner: string, repo: string): Promise<MilestoneResult[]> {
  const octokit = await getOctokit();
  const { data } = await octokit.rest.issues.listMilestones({
    owner,
    repo,
    state: 'open',
    sort: 'due_on',
    direction: 'asc',
  });

  return data.map(m => {
    const milestoneData = {
      title: m.title,
      closed_issues: m.closed_issues,
      open_issues: m.open_issues,
      created_at: m.created_at,
      due_on: m.due_on,
    };
    const total = m.open_issues + m.closed_issues;
    return {
      id: m.id,
      title: m.title,
      description: m.description,
      state: m.state,
      open_issues: m.open_issues,
      closed_issues: m.closed_issues,
      due_on: m.due_on,
      health: calculateRisk(milestoneData),
      progress: total > 0 ? (m.closed_issues / total) * 100 : 0,
    };
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/github.ts src/lib/octokit.ts
git commit -m "feat: add github server actions for milestones"
```

---

### Task 5: UI Components - Milestone Card

**Files:**
- Create: `src/components/MilestoneCard.tsx`

- [ ] **Step 1: Create `MilestoneCard` with dynamic risk colors**

```tsx
import { MilestoneResult } from "@/lib/github";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function MilestoneCard({ milestone }: { milestone: MilestoneResult }) {
  const healthColors = {
    green: "border-green-500 bg-green-50",
    yellow: "border-yellow-500 bg-yellow-50",
    red: "border-golive-red bg-red-50",
  };

  const barColors = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-golive-red",
  };

  return (
    <div className={cn("p-4 border-l-4 rounded-r-lg shadow-sm mb-6 bg-white", healthColors[milestone.health])}>
      <h3 className="font-montserrat font-bold text-lg">{milestone.title}</h3>
      <p className="text-sm text-gray-600 mb-2">
        {milestone.due_on ? `Due: ${new Date(milestone.due_on).toLocaleDateString()}` : "No due date"}
      </p>
      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-500", barColors[milestone.health])} 
          style={{ width: `${milestone.progress}%` }}
        />
      </div>
      <div className="flex justify-between mt-1 text-xs font-semibold">
        <span>{Math.round(milestone.progress)}% complete</span>
        <span>{milestone.open_issues} open issues</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/MilestoneCard.tsx
git commit -m "feat: add milestone card component"
```

---

### Task 6: Main Dashboard Assembly

**Files:**
- Create: `src/app/dashboard/page.tsx`
- Create: `src/components/Navbar.tsx`

- [x] **Step 1: Create Navbar**

```tsx
import { getServerSession } from "next-auth";

export async function Navbar() {
  const session = await getServerSession();
  return (
    <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-golive-red rounded-lg" />
        <span className="font-montserrat font-black text-xl tracking-tighter">openRoad</span>
      </div>
      {session?.user && (
        <div className="flex items-center gap-4 text-sm font-medium">
          <span>{session.user.name}</span>
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
            <img src={session.user.image || ""} alt="avatar" />
          </div>
        </div>
      )}
    </nav>
  );
}
```

- [x] **Step 2: Build the Dashboard page**

```tsx
import { getMilestones } from "@/lib/github";
import { MilestoneCard } from "@/components/MilestoneCard";
import { Navbar } from "@/components/Navbar";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default async function Dashboard({ searchParams }: { searchParams: { repo?: string } }) {
  const repoParam = searchParams.repo || "Golive-Global/openroad";
  const [owner, repo] = repoParam.split("/");
  
  const milestones = await getMilestones(owner, repo);

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto py-12 px-6">
        <h1 className="text-3xl font-montserrat font-black mb-12">Roadmap: {repo}</h1>
        <div className="relative border-l-2 border-gray-300 ml-3 pl-8">
          {milestones.map((m) => (
            <div key={m.id} className="relative">
              <div className={cn(
                "absolute -left-[41px] top-6 w-4 h-4 rounded-full border-4 border-white shadow-sm",
                m.health === 'green' ? 'bg-green-500' : m.health === 'yellow' ? 'bg-yellow-500' : 'bg-golive-red'
              )} />
              <MilestoneCard milestone={m} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
```

- [x] **Step 3: Commit**

```bash
git add src/app/dashboard/page.tsx src/components/Navbar.tsx
git commit -m "feat: assemble dashboard and vertical timeline"
```
