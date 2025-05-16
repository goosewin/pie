# Weekly Time Allocation Pie-Chart

This project helps visualize how you spend your week using an interactive pie chart.

## Development

### Prerequisites

*   [Bun](https://bun.sh/) (v1.2 or higher recommended)
*   Node.js (LTS version)
*   Access to Vercel, Neon, Upstash, and OAuth providers (GitHub, Google, X) as configured.

### Setup

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd pie-chart-project 
    ```

2.  **Install dependencies:**

    ```bash
    bun install
    ```

3.  **Environment Variables:**

    Create a `.env.local` file in the root directory and add the necessary environment variables obtained from Vercel, Neon, Upstash, and your OAuth providers. Refer to `.env.example` (to be created) for the required variables.

    *   `BETTER_AUTH_SECRET` (Generate using `openssl rand -base64 32` or similar)
    *   `BETTER_AUTH_URL` (e.g., `http://localhost:3000`)
    *   `NEON_DATABASE_URL`
    *   `UPSTASH_REDIS_REST_URL`
    *   `UPSTASH_REDIS_REST_TOKEN`
    *   `GITHUB_CLIENT_ID`
    *   `GITHUB_CLIENT_SECRET`
    *   `GOOGLE_CLIENT_ID`
    *   `GOOGLE_CLIENT_SECRET`
    *   `X_CLIENT_ID` 
    *   `X_CLIENT_SECRET` 

4.  **Run the development server:**

    ```bash
    bun dev
    ```

    The application should now be running on [http://localhost:3000](http://localhost:3000).

## Deployment

Deploy the application using [Vercel](https://vercel.com/). Ensure all necessary environment variables are configured in the Vercel project settings.
