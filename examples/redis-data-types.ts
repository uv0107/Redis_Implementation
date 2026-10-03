import { error } from 'console';
import dotenv from 'dotenv';
import { createClient } from 'redis';

dotenv.config();

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const redis = createClient({ url: redisUrl });

async function run() {

    await redis.connect();
    console.log("Connected to Redis successfully!");
    console.log("ping", await redis.ping());

    // 1. strings

    // SET <key> <value>
    const stringKey = "demo:page_views";
    await redis.set(stringKey, "100");

    // GET <key>
    const page_views = await redis.get(stringKey);
    console.log("page_views", page_views);

    // INCR <key>
    await redis.incr(stringKey);
    const updated_page_views = await redis.get(stringKey);
    console.log("updated_page_views", updated_page_views);


    // SETEX <key> <time> <value>
    await redis.setEx(stringKey, 10, "100");
    console.log("with expiration time", await redis.get(stringKey));

    // DEL <key>
    await redis.del(stringKey);

    const deleted_page_views = await redis.get(stringKey);
    console.log("deleted_page_views", deleted_page_views);
    // ----------------------------------------------------------------------

    // hash

    const hashKey = "demo:user:profile";
    await redis.hSet(hashKey, {
        name: "uv",
        email: "uyyalavams37@gmail.com",
    })

    const getUserProfile = await redis.hGetAll(hashKey);
    console.log("user profile", getUserProfile);
    // ----------------------------------------------------------------------
    // list


    // redis list is the order collection of values
    // lpush and rpush are used to push values into the list
    // lpop and rpop are used to pop values from the list
    // lrange is used to get values from the list
    // ltrim is used to remove elements from the list

    const leftPushlistKey = "demo:messages";
    await redis.lPush(leftPushlistKey, "hello");
    await redis.lPush(leftPushlistKey, "world");
    await redis.lPush(leftPushlistKey, "how");
    await redis.lPush(leftPushlistKey, "are");
    await redis.lPush(leftPushlistKey, "you");

    const getMessages = await redis.lRange(leftPushlistKey, 0, -1);
    console.log("these messages are left push", getMessages);

    const rightPushlistKey = "demo:messages";
    await redis.rPush(rightPushlistKey, "hello");
    await redis.rPush(rightPushlistKey, "world");
    await redis.rPush(rightPushlistKey, "how");
    await redis.rPush(rightPushlistKey, "are");
    await redis.rPush(rightPushlistKey, "you");

    const rightMessages = await redis.lRange(rightPushlistKey, 0, -1);
    console.log("these messages are right push", rightMessages);

    await redis.lTrim(rightPushlistKey, 2, 10);
    const trimmedMessages = await redis.lRange(rightPushlistKey, 0, -1);
    console.log("trimmed messages", trimmedMessages);

    /*
    LRANGE is a Read-Only command that fetches a specific slice of a list (like page 1 of a feed) without changing the data in Redis.
    LTRIM is a Write-Only command that permanently deletes everything outside the specified range, keeping the list capped to a fixed maximum size to save RAM.
    LTRIM removes everything outside the specified range and keeps only the elements inside it.
    For example, if your list is [A, B, C, D, E], running LTRIM list 0 2 tells Redis to keep index 0 to 2 (A, B, C) and permanently delete D and E.
    */

    // ----------------------------------------------------------------------

    // set 
    // set stores unique values and it does not store duplicates

    const setKey = "demo:tags";
    await redis.sAdd(setKey, "nodejs");
    await redis.sAdd(setKey, "redis");
    await redis.sAdd(setKey, "javascript");
    await redis.sAdd(setKey, "typescript");
    await redis.sAdd(setKey, "redis");

    const tagsCount = await redis.sCard(setKey);
    console.log("tags count", tagsCount);

    // ----------------------------------------------------------------------

    const rankKey = "demo:highestScores";

    await redis.zAdd(rankKey, {
        score: 100,
        value: "uv"
    });
    await redis.zAdd(rankKey, {
        score: 200,
        value: "lokesh"
    });
    await redis.zAdd(rankKey, {
        score: 150,
        value: "gopi"
    });
    await redis.zAdd(rankKey, {
        score: 125,
        value: "gana"
    });

    const highest_score_position = await redis.zRevRank(rankKey, "uv");
    console.log("highest score position", highest_score_position);
    console.log("now i will increment the score of uv");

    const new_highest_score = await redis.zIncrBy(rankKey, 100, "uv");
    console.log("new highest score position", new_highest_score);
    const new_highest_score_position = await redis.zRevRank(rankKey, "uv");
    console.log("new highest score position", new_highest_score_position);

    // ----------------------------------------------------------------------

    // ttl
    // TTL stands for Time To Live.
    // It is a setting that tells Redis exactly how long to keep a piece of data in RAM 
    // before automatically deleting it.

    const demootp = "demo:otp:123456";
    await redis.set(demootp, "123456");
    await redis.expire(demootp, 60);
    const ttl = await redis.ttl(demootp);
    console.log("ttl", ttl);


    await redis.quit();

}

run().catch(error => {
    console.log("demo failed ", error);
    process.exit(1);
});
