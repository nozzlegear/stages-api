
import {IReply} from "hapi";
import {Server, Request} from "gearworks";
import {Version} from "../../modules/config";

export default function registerRoutes(server: Server)
{
    server.route({
        path: "/",
        method: "GET",
        config: {
            auth: false,
        },
        handler: (request, reply) => {
            reply({
                stages: "Welcome!",
                url: "https://getstages.com",
                version: Version,
                uuid: "68e02e55-37f6-4ee3-a8b2-62690cdbf31a",
            })
        }
    })
}