/// <reference path="./../typings/typings.d.ts" />

import {ValidationError,ObjectSchema,Schema} from "joi";
import capitalize = require("string-capitalize");

export function humanizeError(error: ValidationError)
{
    let message = capitalize(error.details.map(d => d.message.replace(/["]/ig, '')).join(', ')); 
    
    if (message.substring(message.length - 1))
    {
        message += '.';
    }
    
    return message;
}

/**
 * Takes a JOI object and makes all of its keys optional. Useful for PUT API methods.
 */
export function makeKeysOptional(joi: ObjectSchema, except?: string[])
{
    let keys = Object.keys(joi);

    if (Array.isArray(except))
    {
        keys = keys.filter(key => except.some(excludedKey => excludedKey === key) === false);
    }

    // Pass all prop names to joiObject.optionalKeys(keys) to make them optional.
    return joi.optionalKeys(Object.keys(joi));
}