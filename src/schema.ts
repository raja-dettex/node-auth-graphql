import 'graphql-import-node'
import typdefs from './schema.graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { createLink, getAllLink } from './script';
import { graphQLContext } from './contexts';
import { compare, hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { APP_SECRET } from './auth';
import { pubsubChannels } from './pubsub';
export interface Link {
    id: Number;
    description: String;
    url: String
}
const resolvers = {
    Query: {
        info: ()=> "hello world",
        feed: async (parent: unknown, args: {}, context: graphQLContext) => {
            if(context.currentUser == null) {
                throw new Error("unauthenticated");
            }
            return await context.prisma.link.findMany();
        },
        me: async(parent: unknown, args: {}, context: graphQLContext) => {
            if(context.currentUser == null) {
                throw new Error("unauthenticated");
            }
            return context.currentUser;
        }
    },
    Mutation : {
        postLink: async ( parent: unknown, args: { desc: string; url: string}, context: graphQLContext) => {
            try {
                const newLink = await context.prisma.link.create({
                    data: { 
                        description: args.desc,
                        url: args.url
                    }
                });
                await context.pubSub.publish("newLink", { createdLink: newLink});
                return newLink;
            } catch(e) {
                throw e;
            }
        },
        signUp: async (parent: unknown, args: { name: string; email: string; password: string}, context: graphQLContext) => {
            const password = await hash(args.password, 10);
            const user = await context.prisma.user.create({data: {...args, password: password}});
            const token = sign({userId: user.id}, APP_SECRET);
            return {
                token,
                user
            }
        },
        login: async (parent: unknown, args: {email: string, password: string}, context:graphQLContext) => {
            const existingUser = await context.prisma.user.findUnique({
                where: {
                    email: args.email
                }
            });
            if(!existingUser) throw new Error("user does not exist");
            const valid = await compare(args.password, existingUser.password);
            if(!valid) throw new Error("incorrect password");
            const token = sign({userId: existingUser.id}, APP_SECRET);
            return {
                token,
                existingUser
            }
        }
    },
    Subscription: {
        newLink: {
            subscribe: (parent: unknown, args: {}, context: graphQLContext) => {
                if(context.currentUser == null) {
                    throw new Error("unauthenicated");
                }
                return context.pubSub.asyncIterator("newLink");
            },
            resolve: (payload: pubsubChannels["newLink"]) =>{
                payload.forEach((e)=> {
                    return e.createdLink;
                })
            }
        }
    }
};

export const schema = makeExecutableSchema({
    typeDefs: typdefs,
    resolvers: resolvers
});