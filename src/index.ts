import fastify from 'fastify';
import { processRequest, Request, getGraphQLParameters, sendResult, renderGraphiQL, shouldRenderGraphiQL} from 'graphql-helix';

import { schema } from './schema';

import { contextFactory } from './contexts';

const main = async ()=> {
    const server = fastify();
    server.route({
        method: ["POST", "GET"],
        url: '/graphql',
        handler: async (req, reply) => {
            const request: Request = {
                method: req.method,
                headers: (req.headers)?req.headers:{"content-type": "application/json"},
                body: req.body,
                query: req.query
            };
            if(shouldRenderGraphiQL(request)){
                reply.header("content-type", "text/html");
                reply.send(
                    renderGraphiQL({
                        endpoint: "/graphql"
                    })
                );
            }
            const { operationName, query, variables} = getGraphQLParameters(request);
            const result = await processRequest({
                request: request,
                schema: schema,
                operationName: operationName,
                query: query,
                variables: variables,
                contextFactory: ()=> contextFactory(req)
            });
            sendResult(result, reply.raw);

        }
    })

    server.listen({port: 3000, host: "0.0.0.0"}, ()=> console.log("server started") );
    
}


main().catch(err=> console.log(err));