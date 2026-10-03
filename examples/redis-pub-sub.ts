// pub-sub is nothing but the Publish and Subscribe.
// In redis we can use pub-sub for the real time messaging
// pub is nothing but the one who sends the message.
// sub is nothing but the one who listens and receives the message.

// in real life we can use pub-sub for the real time chat application.
// one terminal acts as the publisher and the other terminal acts as the subscriber.
// channel: the channel is nothing but the topic on both sides use.

// pubsub doesn't store messages. it just sends them to the subscribers
// if the subscriber is not listening to the messages, it will not receive them
// if the subscriber is not connected to the redis server, it will not receive the messages

import { error } from 'console';
import dotenv from 'dotenv';
import { createClient } from 'redis';

dotenv.config();

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const channel = "demo:notification";

async function run() {
    // we need to clients here.
    // first client for subscribing the message
    // second client for publishing the message

    const publisher = createClient({ url: redisUrl });
    const subscriber = createClient({ url: redisUrl });

    // connect both the clients
    await publisher.connect();
    await subscriber.connect();

    console.log(" publisher Connected");
    console.log("subscriber connected");
    console.log("ping->", await publisher.ping());
    console.log("ping->", await subscriber.ping());

    //subsciber must be listen for the messages before the publisher publish the messages
    await subscriber.subscribe(channel, (message) => {
        const data = JSON.parse(message);
        console.log("subscriber recieved")
        console.log("title: ", data.title)
        console.log("messaeg: ", data.message)
        console.log("--------------------------")
    });
    console.log("subscribe to channel", channel);
    console.log("publisher is now sending events");

    const event = {
        title: "user login",
        message: "New user logged in at"
    }

    const receiverCount = await publisher.publish(channel, JSON.stringify(event))
    console.log("message sent by publisher", event)
    console.log("number of receivers: ", receiverCount)

    await new Promise((resolve) => setTimeout(resolve, 300))
    //finally close the connectio   n
    await subscriber.unsubscribe(channel);
    await subscriber.quit();
    await publisher.quit()
    console.log("all done")


}
run().catch(err => {
    console.log("pub/sub demo failed ", err);
    process.exit(1)
});