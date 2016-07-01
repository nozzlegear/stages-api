
import * as joi from "joi";
import {IReply} from "hapi";
import {v4 as uuid} from "node-uuid";
import {strategies} from "../../modules/auth";
import {Accounts} from "../../modules/database";
import {Server, Request, Account, Plan} from "gearworks";
import {makeKeysOptional} from "../../modules/validation";
import {notImplemented, notAcceptable, expectationFailed, notFound, wrap as boom} from "boom";

export default function registerRoutes(server: Server)
{
    const accountValidation = joi.object().keys({

    });

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
            auth: strategies.masterAuth,
            validate: {
                payload: accountValidation,
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
                params: joi.object().keys({
                    id: joi.string().required().label("Account Id"),
                })
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
            auth: strategies.masterAuth, //Master auth so an account can't change its own plan without going through OAuth process.
            validate: {
                params: joi.object().keys({
                    id: joi.string().required().label("Account Id"),  
                }),
                payload: makeKeysOptional(accountValidation)
            }
        },
        handler: {
            async: (request, reply) => updateAccount(server, request, reply)
        }
    })
}

export async function listAccounts(server: Server, request: Request, reply: IReply)
{
    return reply(notImplemented());
}

export async function getAccount(server: Server, request: Request, reply: IReply)
{
    const id = request.params["id"];
    const apiKey = request.auth.credentials.apiKey;
    let account: Account;

    try
    {
        account = await Accounts.findByApiKey(apiKey);
    }
    catch (e)
    {
        return reply(boom(e));
    }

    // Only return the account if the ApiKey and Id match.
    if (!account || account._id !== id || account.apiKey !== apiKey)
    {
        return reply(notFound("No account find with that id and API key combination."));
    }

    return reply(account);
}

export async function createAccount(server: Server, request: Request, reply: IReply)
{
    const account: Account = request.payload;

    account._id = uuid();
    account.apiKey = uuid();

    try
    {
        const create = await Accounts.Database.put(account);

        if (!create.ok)
        {
            console.error("Failed to create new account.", create);

            return reply(expectationFailed("Failed to create new account."));
        }

        account._rev = create.rev;
    }
    catch (e)
    {
        return reply(expectationFailed());
    }

    return reply(account);
}

export async function updateAccount(server: Server, request: Request, reply: IReply)
{
    const id = request.params["id"];
    const apiKey = request.auth.credentials.apiKey;
    const accountToUpdate: Account = request.payload;
    let dbAccount: Account;

    // Get the original account
    try
    {
        dbAccount = await Accounts.findByApiKey(apiKey);

        // Only update the account if the ApiKey and Id match.
        if (!dbAccount || dbAccount._id !== id || dbAccount.apiKey !== apiKey)
        {
            return reply(notFound("No account find with that id and API key combination."));
        }
    }
    catch (e)
    {
        console.error("Failed to retrieve account when updating.", e);

        return reply(boom(e));
    }

    // Transfer update props to the dbAccount
    for (let prop in accountToUpdate)
    {
        dbAccount[prop] = accountToUpdate[prop];
    }

    // Never update the account's ID or apiKey
    dbAccount._id = id;
    dbAccount.apiKey = apiKey;

    try
    {
        const update = await Accounts.Database.put(accountToUpdate);

        if (!update.ok)
        {
            console.error("Failed to update account.", update);

            return reply(expectationFailed("Failed to update account."));
        }
        
        dbAccount._rev = update.rev;
    }
    catch (e)
    {
        console.error("Failed to update account.", e);

        return reply(boom(e));
    }

    return reply(dbAccount);
}