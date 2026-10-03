import { error } from 'console';
import dotenv from 'dotenv';
import { createClient } from 'redis';

dotenv.config();

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const redis = createClient({ url: redisUrl });

const cacheKey = "demo:products";
const cacheTtlSeconds = 60;
let dbproducts = ["laptop", "keyboard", "mouse", "monitor", "headphone", "charger", "powerbank", "speaker", "case", "screen-guard"];

export async function run() {
    await redis.connect();
    console.log("Connected to Redis successfully!");
    console.log("ping", await redis.ping());

    // first request ----it anyway cache miss only 
    // here i am simulating the request and processing time
    let cached = await redis.get(cacheKey);

    if (cached) {
        console.log("cache hit ", JSON.parse(cached));
    } else {
        console.log("cache miss ");
        const products = dbproducts;
        // now set /save the products into the cache.

        await redis.setEx(cacheKey, cacheTtlSeconds, JSON.stringify(products));
    }

    // stale problem
    dbproducts = ["laptop", "keyboard", "mouse", "monitor", "headphone", "charger", "powerbank", "speaker", "case", "screen-guard", "usb"];

    console.log("dbproducts are:", dbproducts);

    cached = await redis.get(cacheKey)
    if (cached) {
        console.log("cache hit ", JSON.parse(cached));
    } else {
        console.log("cache miss ");
    }

    // so to resolve this problem
    // so whenever there is a change in the primary database we have to del the cache.
    await redis.del(cacheKey);
    // now the cache is deleted . we will again check the cache.
    console.log("cache is deleted");
    cached = await redis.get(cacheKey);
    if (!cached) {
        console.log("cache miss ");
        const fresh_products = dbproducts;
        // now set /save the products into the cache.
        await redis.setEx(cacheKey, cacheTtlSeconds, JSON.stringify(fresh_products));
        console.log("updated cache with fresh data ", fresh_products);
    }
    await redis.quit();

}

run().catch(err => {
    console.log("demo failed ", err);
    process.exit(1)
});