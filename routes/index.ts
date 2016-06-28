/// <reference path="./../typings/index.d.ts" />

import {registerRoutes as homeRoutes} from "./home/home-routes";
import {registerRoutes as userRoutes} from "./users/users-routes";

export const RoutesToRegister = [
    homeRoutes,
    userRoutes,
];