/// <reference path="./../typings/typings.d.ts" />

import * as bcrypt from "bcrypt";
import {Accounts} from "./database";
import {v4 as guid} from "node-uuid";
import {getRawBody} from "./requests";
import {unauthorized, badRequest, wrap as boom} from "boom";
import {isAuthenticRequest, isAuthenticWebhook} from "shopify-prime";
import {ShopifySecretKey, EncryptionSignature, MasterKey} from "./config";
import {Caches, getCacheValue, setCacheValue, deleteCacheValue} from "./cache";
import {Server, DefaultContext, Request, User, AuthArtifacts, AuthCredentials, Account} from "gearworks";

export const cookieName = "GearworksAuth"; 
export const strategies = {
    masterAuth: "full-auth",
    accountAuth: "basic-auth",
    shopifyRequest: "shopify-request",
    shopifyWebhook: "shopify-webhook-auth",
}

export function configureAuth(server: Server)
{    
    const masterScheme = "master";
    const userScheme = "user";
    const shopifyRequestScheme = "shopify-request";
    const shopifyWebhookScheme = "shopify-webhook";
    
    server.auth.scheme(masterScheme, (s, options) => ({
        authenticate: async (request, reply) => 
        {
            const apiKey = request.headers["x-stages-api-key"];

            if (!apiKey || apiKey !== MasterKey)
            {
                return reply(unauthorized());
            }

            const credentials: AuthCredentials = {
                apiKey: apiKey,
            }

            return reply.continue({credentials: credentials});
        }
    }));
    
    server.auth.scheme(userScheme, (s, options) => ({
        authenticate: async (request, reply) =>
        {
            const apiKey = request.headers["x-stages-api-key"];
            let artifacts: AuthArtifacts;

            try
            {
                artifacts = await getAccountCache(apiKey, true);
            }
            catch (e)
            {
                if (e.status === 404)
                {
                    return reply(unauthorized());
                }

                return reply(boom(e));
            }

            if (!artifacts)
            {
                return reply(unauthorized());
            }

            const credentials: AuthCredentials = {
                apiKey: apiKey,
            }
            
            return reply.continue({credentials: credentials, artifacts: artifacts});
        }
    }));
    
    server.auth.scheme(shopifyRequestScheme, (s, options) => ({
        authenticate: async (request, reply) =>
        {
            let isAuthentic: boolean;

            try
            {
                isAuthentic = await isAuthenticRequest(request.query, ShopifySecretKey);
            }
            catch (e)
            {
                return reply(boom(e));
            }

            if (!isAuthentic)
            {
                return reply(badRequest("Request did not pass validation."));
            }
            
            return reply.continue(request.auth.credentials);
        }
    }));
    
    server.auth.scheme(shopifyWebhookScheme, (s, options) => ({
        authenticate: async (request, reply) =>
        {
            let body: string;
            let isAuthentic: boolean;

            try
            {
                body = await getRawBody(request);
            }
            catch (e)
            {
                return reply(boom(e));
            }
            
            try
            {
                isAuthentic = await isAuthenticWebhook(request.headers["x-shopify-hmac-sha256"], body, ShopifySecretKey);
            }
            catch (e)
            {
                console.log("Failed to get isAuthentic result", e);

                return reply(badRequest("Failed to get isAuthentic result.", e));
            }
            
            if (!isAuthentic)
            {
                return reply(unauthorized("Request did not pass validation."));
            }
            
            return reply.continue({credentials: {}});
        },
    }))
    
    server.auth.strategy(strategies.accountAuth, userScheme, false);
    server.auth.strategy(strategies.shopifyRequest, shopifyRequestScheme, false);
    server.auth.strategy(strategies.shopifyWebhook, shopifyWebhookScheme, false);
    server.auth.strategy(strategies.masterAuth, masterScheme, true /* Default strategy for all requests */);
}

async function setAccountCache(account: Account)
{
    const result: AuthArtifacts = {
        accountId: account._id,
        planId: account.planId,
        shopDomain: account.shopify.shopDomain,
        shopToken: account.shopify.accessToken,
        shopId: account.shopify.shopId,
    };

    await setCacheValue(Caches.accountAuth, account.apiKey, result);

    return result;
}

/**
 * Gets account data from the cache according to its api key.
 */
async function getAccountCache(apikey: string, autoRefreshCache: boolean): Promise<AuthArtifacts>
{
    const result = await getCacheValue<AuthArtifacts>(Caches.accountAuth, apikey);

    if (!result && autoRefreshCache)
    {
        // Attempt to pull auth data from database.
        const account = await Accounts.findByApiKey(apikey.toLowerCase());
        const data: AuthArtifacts = {
            accountId: account._id,
            planId: account.planId,
            shopDomain: account.shopify.shopDomain, 
            shopToken: account.shopify.accessToken,
            shopId: account.shopify.shopId,
        };

        // Store this data back in the cache to prevent future db queries
        await setCacheValue(Caches.accountAuth, apikey, data);

        return data;
    }
    else if (!result)
    {
        return undefined;
    }

    return result.item;
}