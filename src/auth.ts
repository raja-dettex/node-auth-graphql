export const APP_SECRET = "this is app secret";
import { PrismaClient } from "@prisma/client";
import { User } from "./dtos/User";
import { JwtPayload, verify } from "jsonwebtoken";
import { FastifyRequest} from 'fastify';


export async function authenticateUser(prisma: PrismaClient, request: FastifyRequest): Promise<User|null> {
    if(request?.headers?.authorization) {
        const token = request.headers.authorization.split(" ")[1];
        const tokenPayload = verify(token, APP_SECRET) as JwtPayload;
        const userId = tokenPayload.userId;
        return await prisma.user.findUnique({ where: { id: userId}});
    }
    return null;
}