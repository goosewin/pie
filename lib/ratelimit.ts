import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const upstashRedisUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashRedisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | null = null;
let ratelimit: Ratelimit | null = null;

if (upstashRedisUrl && upstashRedisToken) {
  redis = new Redis({
    url: upstashRedisUrl,
    token: upstashRedisToken,
  });

  // Create a new ratelimiter, that allows 10 requests per 1 hour
  ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(10, "1h"), // 10 requests per 1 hour
    analytics: true, // Enable analytics
    /**
     * Optional prefix for the keys used in redis.
     * This is useful if you want to share a redis instance with other applications and want to avoid key collisions.
     * The default prefix is "@upstash/ratelimit"
     */
    prefix: "@upstash/ratelimit/piechart",
  });
} else {
  console.warn(
    "Upstash Redis URL or Token is not configured. Rate limiting will be disabled. " +
    "Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in your .env.local file."
  );
}

export { ratelimit, redis };
