/// <reference path="./../../typings/typings.d.ts" />

import pouch = require("pouchdb");
import {DatabaseUrl} from "../config";
import {Account, PasswordResetUser} from "gearworks";

// Add the pouchdb-find plugin
pouch.plugin(require("pouchdb-find"));
export const Database = new pouch(`${DatabaseUrl}/stages_accounts`);

/**
 * Finds an account by its Shopify shop id.
 */
export async function findByShopId(shopId: number | string): Promise<Account>
{
    // Don't search for null, undefined or NaN values
    if (!shopId)
    {
        return undefined;
    }

    await Database.createIndex({
        index: {
            fields: ["shopify.shopId"]
        }
    });

    const result = await Database.find<Account>({
        selector: {
            shopify: {
                shopId: parseInt(shopId as string)
            },
        },
        limit: 1,
    });

    return result.docs.length > 0 ? result.docs[0] : undefined;
}

/**
 * Finds an account by its API Key.
 */
export async function findByApiKey(apiKey: string): Promise<Account>
{
    // Don't search for null, undefined or NaN values
    if (!apiKey)
    {
        return undefined;
    }

    await Database.createIndex({
        index: {
            fields: ["apiKey"]
        }
    })

    const result = await Database.find<Account>({
        selector: {
            apiKey: apiKey
        },
        limit: 1,
    })

    return result.docs.length > 0 ? result.docs[0] : undefined;
}