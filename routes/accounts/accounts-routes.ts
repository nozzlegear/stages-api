
import * as joi from "joi";
import {IReply} from "hapi";
import {strategies} from "../../modules/auth";
import {Server, Request, Account, Plan} from "gearworks";
import {notImplemented, notAcceptable, expectationFailed} from "boom";

export default function registerRoutes(server: Server)
{
    server.route({
        path: "/accounts",
        method: "GET",
        config: {
            auth: strategies.masterAuth,
        },
        handler: {
            async: (request, reply) => listAccounts(server, request, reply)
        }
    })

    server.route({
        path: "/accounts",
        method: "POST",
        config: {
            auth: strategies.accountAuth,
            validate: {
                payload: joi.object().keys({

                })
            }
        },
        handler: {
            async: (request, reply) => createAccount(server, request, reply)
        }
    })

    server.route({
        path: "/accounts/{id}",
        method: "GET",
        config: {
            auth: strategies.accountAuth,
            validate: {
                params: joi.string().required()
            }
        },
        handler: {
            async: (request, reply) => getAccount(server, request, reply)
        }
    })

    server.route({
        path: "/accounts/{id}",
        method: "PUT",
        config: {
            auth: strategies.accountAuth,
            validate: {
                params: joi.string().required()
            }
        },
        handler: {
            async: (request, reply) => updateAccount(server, request, reply)
        }
    })
}

export async function listAccounts(server: Server, request: Request, reply: IReply)
{
    return notImplemented();
}

export async function getAccount(server: Server, request: Request, reply: IReply)
{
    return notImplemented();
}

export async function createAccount(server: Server, request: Request, reply: IReply)
{
    return notImplemented();
}

export async function updateAccount(server: Server, request: Request, reply: IReply)
{
    return notImplemented();
}