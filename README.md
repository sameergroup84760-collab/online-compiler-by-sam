# Online Compiler By Sam — multi-language online compiler

A starter production-style website for running C, C++, Python, Java, SQL and PHP online.

## 1. Install

Install Node.js 18+ and run:

```bash
npm install
cp .env.example .env
npm start
```

Open http://localhost:3000

## 2. Execution

The backend sends code to Judge0. By default it uses `https://ce.judge0.com`. For a real public website, use a hosted Judge0 plan or self-host Judge0 and put its URL in `.env`. Do not expose an API key in browser JavaScript; keep it server-side.

Environment variables:
- `PORT`
- `JUDGE0_URL`
- `JUDGE0_API_KEY` (optional)
- `JUDGE0_API_HOST` (optional)

## 3. Deploy

Deploy the Node app to any host that supports Node.js. Set the environment variables in the host dashboard.

## 4. Ads

There are two visible ad placeholders in the page. After your site is approved by an ad provider, replace those placeholders with the provider's official ad code. Do not click your own ads or encourage users to click them.

## 5. Before launch

Add Privacy Policy, Terms, Contact, About, tutorials/practice pages, rate limiting, abuse protection, logging, HTTPS, and a production execution backend. For a public service, avoid relying on an unprotected public compiler endpoint for unlimited traffic.
