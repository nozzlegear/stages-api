/// <reference path="./../typings/typings.d.ts" />

import {ValidationError,ObjectSchema} from "joi";
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

export function makeKeysOptional(joi: ObjectSchema)
{
    throw new Error("not implemented");

    // TODO: Loop through all keys in the joi object and then pass them to object.optionalKeys(keys)
    //joi.optionalKeys([]);
}