import { PubSub } from "graphql-subscriptions";
import { TypedPubSub } from "typed-graphql-subscriptions";
import { Link } from "./schema";

export type pubsubChannels = {
    newLink: [ { createdLink: Link}]
};

export const pubSub = new TypedPubSub<pubsubChannels>(new PubSub());