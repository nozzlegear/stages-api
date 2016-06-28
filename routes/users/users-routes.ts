
import {IReply} from "hapi";
import {Server, Request} from "gearworks";
import {strategies} from "../../modules/auth";

export function registerRoutes(server: Server)
{
    server.route({
        path: "/users",
        method: "GET",
        config: {
            auth: strategies.masterAuth,
        },
        handler: {
            async: (request, reply) => listUsers(server, request, reply)
        }
    })
}

export async function listUsers(server: Server, request: Request, reply: IReply)
{
    return reply("Hello, world!");
}