# Getting Started

Follow these steps to set up and run **openRoad** locally.

## 1. Prerequisites

- Node.js (v18 or higher)
- A GitHub account
- A GitHub OAuth App (for authentication)

## 2. GitHub OAuth Setup

1. Go to your GitHub [Developer Settings](https://github.com/settings/developers).
2. Create a **New OAuth App**:
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
3. Generate a **Client Secret**.

## 3. Environment Configuration

Create a `.env.local` file in the root directory:

```text
GITHUB_ID=your_client_id
GITHUB_SECRET=your_client_secret
NEXTAUTH_SECRET=a_random_secure_string
NEXTAUTH_URL=http://localhost:3000
```

## 4. Installation

```bash
npm install
```

## 5. Running the Application

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 6. Organization Access

To see milestones from a GitHub Organization:
1. Log in to openRoad.
2. In the GitHub authorization screen, ensure you **Grant access** to your organization.
3. If the organization has restricted access, an administrator must approve the application.
