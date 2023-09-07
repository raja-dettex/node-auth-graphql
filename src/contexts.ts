import { PrismaClient } from "@prisma/client";
import { User } from "./dtos/User";
import { FastifyRequest} from 'fastify';
import { authenticateUser } from "./auth";
import { pubSub } from "./pubsub";

export type  graphQLContext = {
    prisma: PrismaClient;
    currentUser: User | null;
    pubSub: typeof pubSub
};


const prisma = new PrismaClient();


export async function contextFactory(request: FastifyRequest) : Promise<graphQLContext> {
    return { 
        prisma,
        currentUser: await authenticateUser(prisma, request),
        pubSub
    };
}