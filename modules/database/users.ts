/// <reference path="./../../typings/typings.d.ts" />

import pouch = require("pouchdb");
import {DatabaseUrl} from "../config";
import {User, PasswordResetUser} from "gearworks";

// Add the pouchdb-find plugin
pouch.plugin(require("pouchdb-find"));
export const Database = new pouch(`${DatabaseUrl}/stages_users`);

/**
 * Finds a user by their `passwordResetToken`.
 */
export async function findUserByPasswordResetToken(token: string): Promise<PasswordResetUser>
{
    // Don't search for null values
    if (typeof token !== "string")
    {
        return undefined;
    }

    await Database.createIndex({
        index: {
            fields: ["passwordResetToken"]
        }
    });

    const result = await Database.find<PasswordResetUser>({
        selector: {
            passwordResetToken: token
        },
        limit: 1,
    });

    return result.docs.length > 0 ? result.docs[0] : undefined;
}

/**
 * Finds a user by their account id.
 */
export async function findByAccountId(accountId: string): Promise<User>
{
    // Don't search for null values
    if (typeof accountId !== "string")
    {
        return undefined;
    }

    await Database.createIndex({
        index: {
            fields: ["accountId"]
        }
    })

    const result = await Database.find<User>({
        selector: {
            accountId: accountId
        },
        limit: 1,
    });

    return result.docs.length > 0 ? result.docs[0] : undefined;
}

export async function countByAccountId(accountId: string): Promise<number>
{
    // Don't search for null values
    if (typeof accountId !== "string")
    {
        return undefined;
    }

    const docName = "user_queries/count_by_accountId";
    const nameParts = docName.split("/");
    const indexName = nameParts[0];
    const viewName = nameParts[1];

    // Create the search index
    try
    {
        let indexDoc = {
            _id: `_design/${indexName}`,
            views: { }
        };

        indexDoc.views[viewName] = {
            map: function (doc: User, emit) { 
                if (doc.accountId.toLowerCase() === accountId.toLowerCase())
                {
                    emit(doc.accountId);
                }
            }.toString(),
            reduce: "_count",
        }

        await Database.put(indexDoc);
    }
    catch (e)
    {
        if (e.name !== 'conflict')
        {
            throw e;
        }

        //Ignore if index already exists
    }

    try
    {
        const result = await Database.query(docName, {include_docs: false}) as any;

        return result;
    }
    catch (e)
    {
        console.error("Error counting users by account id.", e);

        throw e;
    }
}