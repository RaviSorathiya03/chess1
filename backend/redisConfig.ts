import { createClient } from "redis";

export const redis = createClient({
    url: "rediss://default:AUlLAAIncDI3MzdhNjRlOWIwNTk0OThiYjViZWZmNzJiZTQ2ZmJjZnAyMTg3NjM@relaxing-bulldog-18763.upstash.io:6379",
});

redis.on("error", (err) => console.error("Redis Client Error", err));

await redis.connect();
console.log("✅ Connected to Redis");