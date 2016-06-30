/// <reference path="../typings.d.ts" />

declare module "gearworks"
{
    import * as pouch from "pouchdb";
    import {Enums} from "shopify-prime";
    import {CachePolicy, CacheOptions, CacheClient} from "catbox";
    import {
        Server as HapiServer, 
        Request as HapiRequest,
        ICatBoxCacheOptions,
        ServerCache
    } from "hapi";
    
    export interface CacheConfig{
        segment: string;
        defaultTTL: number;
        client: CacheClient;
    }
    
    export interface Server extends HapiServer
    {
        app: ServerApp;
        cache: ServerCache;
    }
    
    export interface Request extends HapiRequest
    {
		auth: {
			/** true is the request has been successfully authenticated, otherwise false.*/
			isAuthenticated: boolean;
			/**  the credential object received during the authentication process. The presence of an object does not mean successful authentication.  can be set in the validate function's callback.*/
			credentials: AuthCredentials;
			/**  an artifact object received from the authentication strategy and used in authentication-related actions.*/
			artifacts: AuthArtifacts;
			/**  the route authentication mode.*/
			mode: any;
			/** the authentication error is failed and mode set to 'try'.*/
			error: any;
		};
    }
    
    export interface ServerApp
    {
        isLive: boolean;
        rootDir: string;
        appName: string;
    }
    
    export interface DefaultContext
    {
        appName?: string;
        
        isLive?: boolean;

        user?: {
            userId: string | number;
            username: string;
            isAuthenticated: boolean;
        }

        /**
         * A Crumb string value that must be included on all submitted forms as an input with the name of 'crumb'.
         */
        crumb?: string;
    }
    
    export interface AuthCredentials
    {
        apiKey: string;
    }
    
    export interface AuthArtifacts
    {
        accountId: string;
        shopDomain: string;
        shopToken: string;
        shopId: number;
        planId: string;
    }
    
    export interface Plan
    {
        /**
         * A plan's unique id.
         */
        id: string;
        
        name: string;
        
        price: number;
        
        trialDays: number;
        
        /**
         * A humanized description that will be displayed on the pricing page.
         */
        description: string;
        
        /**
         * A custom list of in-app permissions available to this plan.
         */
        permissions: string[];
    }

    export type StageColor = (
        "red" | 
        "slate" | 
        "blue" | 
        "orange" | 
        "white" | 
        "green" | 
        "purple" | 
        "teal" | 
        "yellow"
    );

    export interface Stage extends pouch.api.methods.ExistingDoc
    {
        name: string;

        color: StageColor;

        isDeleted: boolean;

        sortIndex: number;
    }

    /**
     * An account object that ties multiple users together.
     */
    export interface Account extends pouch.api.methods.ExistingDoc
    {
        /**
         * An API key unique to the account that can be used to make calls to the Stages API.
         */
        apiKey: string;

        /**
         * The date the account was created, represented as an ISO date string.
         */
        dateCreated: string;

        /**
         * A reason given by the user when cancelling their account.
         */
        reasonForCancellation: string;

        /**
         * The id of the user that owns this account.
         */
        ownerId: string;

        stripe: {
            customerId: string;
            subscriptionId: string;
        }

        shopify: {
            chargeId: number;
            accessToken: string;
            shopName: string;
            shopDomain: string;
            shopId: number;

            /**
             * Current Shopify API permissions granted to this account. Use the Shopify OAuth flow to update permissions.
             */
            permissions: Enums.AuthScope[];
        }

        planId: string;

        stages: Stage[];

        hasCreatedStages: boolean;

        hasCreatedRules: boolean;

        isCanceled: boolean;
    }
    
    export interface User extends pouch.api.methods.ExistingDoc
    {        
        /**
         * The user's username or email address.
         */
        username: string;
        
        /**
         * The user's hashed password.
         */
        hashedPassword: string;

        /**
         * Account id. 
         */
        accountId: string;
    }

    /**
     * A user instance for users that have requested a password reset.
     */
    export interface PasswordResetUser extends User
    {
        passwordResetToken: string;

        passwordResetRequestedAt: Date | string;
    }
}