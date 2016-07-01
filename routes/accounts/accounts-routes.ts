
import * as joi from "joi";
import {IReply} from "hapi";
import {async as PouchDB} from "pouchdb";
import {v4 as uuid} from "node-uuid";
import {strategies} from "../../modules/auth";
import {Accounts} from "../../modules/database";
import {Plans, findPlan} from "../../modules/plans";
import {Server, Request, Account, Plan} from "gearworks";
import {notImplemented, notAcceptable, expectationFailed, notFound, wrap as boom} from "boom";

export default function registerRoutes(server: Server)
{
    const createValidation = joi.object().keys({
        planId: joi.string().only(Plans.map(p => p.id)).required(),
    });
    const putValidation = joi.object().keys({
        
    })

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
                payload: createValidation,
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
                payload: putValidation
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
    const cred = request.auth.credentials;
    let account: Account;

    try
    {
        if (cred.isMasterKey)
        {
            account = await Accounts.Database.get<Account>(id);

            return reply(account);
        }
        else
        {
            account = await Accounts.findByApiKey(cred.apiKey);
        }
    }
    catch (e)
    {
        const error: PouchDB.Error = e;

        if (error.status === 404)
        {
            return reply(notFound("No account found with that id and API key combination."));
        }

        console.error("Error finding account by API key.", e);

        return reply(boom(e));
    }

    // Only return the account if the ApiKey and Id match.
    if (!account || account._id !== id || account.apiKey !== cred.apiKey)
    {
        return reply(notFound("No account found with that id and API key combination."));
    }

    return reply(account);
}

export async function createAccount(server: Server, request: Request, reply: IReply)
{
    let account: Account = {
        _rev: undefined,
        _id: uuid(),
        apiKey: uuid(),
        dateCreated: new Date().toISOString(),
        hasCreatedRules: false,
        hasCreatedStages: false,
        isCanceled: false,
        planId: request.payload.planId,
        reasonForCancellation: undefined,
        shopify: {
            accessToken: undefined,
            chargeId: undefined,
            permissions: [],
            shopDomain: undefined,
            shopId: undefined,
            shopName: undefined,
        },
        stripe: {
            customerId: undefined,
            subscriptionId: undefined
        }
    }

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