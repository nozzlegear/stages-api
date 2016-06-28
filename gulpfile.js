"use strict";

const gulp     = require("gulp");
const ngrok    = require("ngrok");
const chokidar = require("chokidar");
const shell    = require("gulp-shell");
const server   = require("gulp-develop-server");
const config   = require("./stages.private.json");

gulp.task("ts", () =>
{
    const task = shell.task("tsc -p .");

    return task();
});

gulp.task("default", ["ts"]);

gulp.task("watch", (cb) =>
{
    const ngrokConfig = {
        addr: config["stages-port"] || 3000,
        subdomain: config["stages-ngrokSubdomain"],
    }

    shell.task("pouchdb-server -n --dir pouchdb --port 5984")();

    shell.task("tsc -p . --watch")();

    ngrok.connect(ngrokConfig, (err, url) =>
    {
        if (err) throw err;

        console.log("Started ngrok on", url);

        config["stages-ngrokDomain"] = url.replace(/^.*:\/\//i, "");

        server.listen({path: "bin/server.js", env: config});

        // Gulp.watch in 3.x is broken, watching more files than it should. Using chokidar instead.
        // https://github.com/gulpjs/gulp/issues/651
        chokidar.watch(["bin/**/*.js"], {ignoreInitial: true}).on("all", (event, path) =>
        {
            server.restart();
        });
    })    
})