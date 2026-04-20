import { createClient } from "redis";

const redisURL =
  process.env.REDIS_URL || "redis://127.0.0.1:6379";

const client = createClient({
  url: redisURL,
});

client.on("error", (err) => {
  console.log("❌ Redis Error:", err.message);
});

const connectWithRetry = async () => {
  try {
    if (!client.isOpen) {
      await client.connect();
      console.log("⚡ Redis Connected:", redisURL);
    }
  } catch (err) {
    console.log("❌ Redis Retry in 5 sec...", err.message);
    setTimeout(connectWithRetry, 5000); // 🔥 retry loop
  }
};

export const connectRedis = async () => {
  connectWithRetry();
};

export default client;