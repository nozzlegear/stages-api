
import * as joi from "joi";
import {IReply} from "hapi";
import {notImplemented} from "boom";
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

    server.route({
        path: "/users",
        method: "POST",
        config: {
            auth: strategies.masterAuth,
            validate: joi.object().keys({
                fullName: joi.string().label("Full Name"),
                email: joi.string().email().label("Email Address"),
                password: joi.string().min(6).label("Password"),
            }),
        },
        handler: {
            async: (request, reply) => createUser(server, request, reply)
        }
    })
}

export async function listUsers(server: Server, request: Request, reply: IReply)
{
    return reply(notImplemented());
}

export async function createUser(server: Server, request: Request, reply: IReply)
{
    return reply(notImplemented());
}