
import * as joi from "joi";
import {IReply} from "hapi";
import {hashSync} from "bcrypt";
import {v4 as uuid} from "node-uuid";
import {findPlan} from "../../modules/plans";
import {strategies} from "../../modules/auth";
import {Users, Accounts} from "../../modules/database";
import {Server, Request, Account, User} from "gearworks";
import {notImplemented, notAcceptable, expectationFailed} from "boom";

export function registerRoutes(server: Server)
{
    server.route({
        path: "/users",
        method: "POST",
        config: {
            auth: strategies.masterAuth,
            validate:{ 
                payload: joi.object().keys({
                    name: joi.string().label("Name"),
                    username: joi.string().email().label("Username"),
                    password: joi.string().min(6).label("Password"),
                    accountId: joi.string().label("Account Id"),
                })
            },
        },
        handler: {
            async: (request, reply) => createUser(server, request, reply)
        }
    })

    server.route({
        path: "/users/{id}",
        method: "GET",
        config: {
            auth: strategies.accountAuth,
            validate: {
                params: joi.string().required().label("User Id")
            }
        },
        handler: {
            async: (request, reply) => getUser(server, request, reply)
        }
    })

    server.route({
        path: "/users/{id}",
        method: "PUT",
        config: {
            auth: strategies.accountAuth,
            validate: {
                params: joi.string().required().label("User Id")
            }
        },
        handler: {
            async: (request, reply) => updateUser(server, request, reply),
        }
    })
}

export async function createUser(server: Server, request: Request, reply: IReply)
{
    const payload = request.payload as {name: string, username: string, password: string, accountId: string};
    const account = await Accounts.Database.get<Account>(payload.accountId.toLowerCase());

    if (!account)
    {
        return reply(notAcceptable(`No account with id of ${payload.accountId} exists.`));
    }

    // Ensure adding another user won't go over the account's plan limit.
    const userCount = await Users.countByAccountId(payload.accountId.toLowerCase());
    const plan = findPlan(account.planId);
    
    if (userCount >= plan.totalUsers)
    {
        return reply(notAcceptable("Account's plan has reached its maximum number of users."));
    }

    let user: User = {
        _id: payload.username,
        _rev: undefined,
        accountId: payload.accountId.toLowerCase(),
        hashedPassword: hashSync(payload.password, 10),
        name: payload.name,
    }

    try
    {
        const update = await Users.Database.put(user);

        if (!update.ok)
        {
            return reply(expectationFailed("Failed to create user.", update));
        }

        user._rev = update.rev;
    }
    catch (e)
    {
        console.error("Error thrown when creating user", e);

        throw e;
    }

    // Do not reflect the user's hashedPassword.
    user.hashedPassword = undefined;

    return reply(user).code(201);
}

export async function getUser(server: Server, request: Request, reply: IReply)
{
    return reply(notImplemented());
}

export async function updateUser(server: Server, request: Request, reply: IReply)
{
    return reply(notImplemented());
}