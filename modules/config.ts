
const pkg = require("../../package.json");
const env: {[index: string]: string} = process.env;

export const OptionalProps = [
    "Port",
    "Host",
    "StripePublishableKey",
    "StripeSecretKey",
    "SparkpostKey",
    "EmailDomain",
    "NgrokDomain",
]

/**
 * Whether the server is running in a live (production) environment.
 */
export const isLive = env["NODE_ENV"] === "production"

/**
 * The master API key that can be used by trusted clients to create new user API keys.
 */
export const MasterKey = env["stages-masterKey"] || env["masterKey"];

/**
 * An ngrok URL used during testing with `gulp watch`.
 */
export const NgrokDomain = env["stages-ngrokDomain"];

/**
 * A salt encryption string for Yar cookies.
 */
export const YarSalt: string = env["stages-yarSalt"] || env["yarSalt"];

/**
 * A random encryption signature string
 */
export const EncryptionSignature = env["stages-encryptionSignature"] || env["encryptionSignature"];

/**
 * The connection URL to your PouchDB-compatible database.
 */
export const DatabaseUrl: string = env["stages-couchUrl"] || env["couchUrl"];

/**
 * Your server app's port. Typically set automatically by your host with the PORT environment variable.
 */
export const Port = env["stages-port"] || env["PORT"];

/**
 * Your server app's host domain. Typically set automatically by your host with the HOST environment variable.
 */
export const Host = env["stages-host"] || env["HOST"];

/**
 * Your app's full domain, e.g. example.com or www.example.com.
 */
export const Domain = env["stages-domain"] || env["domain"]

/**
 * Your app's name.
 */
export const AppName = env["stages-appName"] || env["appName"];

/**
 * Your Shopify app's secret key.
 */
export const ShopifySecretKey = env["stages-shopifySecretKey"] || env["shopifySecretKey"];

/**
 * Your Shopify app's public API key.
 */
export const ShopifyApiKey = env["stages-shopifyApiKey"] || env["shopifyApiKey"];

/**
 * Optional. Your Stripe publishable key.
 */
export const StripePublishableKey = env["stages-stripePublishableKey"] || env["stripePublishableKey"];

/**
 * Optional. Your Stripe secret key.
 */
export const StripeSecretKey = env["stages-stripeSecretKey"] || env["stripeSecretKey"];

/**
 * Optional. Your Sparkpost (https://www.sparkpost.com) API key, used for sending password reset emails.
 */
export const SparkpostKey = env["stages-sparkpostKey"] || env["sparkpostKey"];

/**
 * Optional. The domain to send emails from, e.g. example.com. Domain must be verified in your Sparkpost account.
 */
export const EmailDomain = env["stages-emailDomain"] || env["emailDomain"];

/**
 * The app's current version according to the package.json file.
 */
export const Version = pkg.version; 