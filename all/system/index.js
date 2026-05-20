import { spawn } from "child_process";
import path from "path";
import os from "os";
import chalk from "chalk";
import gradient from "gradient-string";
import figlet from "figlet";
import { fileURLToPath } from "url";

// __dirname versi ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File utama bot
const file = "main.js";

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function bootAnimation() {
    console.clear();

    console.log(chalk.cyanBright("Starting Neo Flare Bootloader...\n"));
    await sleep(800);

    console.log(
        gradient.instagram(
            figlet.textSync("NEO FLARE", { font: "ANSI Shadow" })
        )
    );

    console.log(chalk.yellow.bold("\nNeo Flare System v6.1"));
    console.log(chalk.gray("Powered by NeoShiroko Labs\n"));

    await sleep(800);

    console.log(chalk.magenta.bold("==============================================="));
    console.log(chalk.cyan.bold("Operating System Information:\n"));

    console.log(chalk.white(`- Platform     : ${os.platform()}`));
    console.log(chalk.white(`- Release      : ${os.release()}`));
    console.log(chalk.white(`- Architecture : ${os.arch()}`));
    console.log(chalk.white(`- Hostname     : ${os.hostname()}`));
    console.log(chalk.white(`- Total Memory : ${(os.totalmem() / 1024 / 1024).toFixed(2)} MB`));
    console.log(chalk.white(`- Free Memory  : ${(os.freemem() / 1024 / 1024).toFixed(2)} MB`));
    console.log(chalk.white(`- Uptime       : ${os.uptime()} seconds`));

    await sleep(1000);

    console.log(chalk.magenta.bold("\n==============================================="));
    console.log(chalk.cyanBright("Initializing Modules...\n"));

    const loadText = "L O A D I N G";
    for (let i = 0; i < 3; i++) {
        process.stdout.write(chalk.cyanBright(loadText + ".\r"));
        await sleep(500);
        process.stdout.write(chalk.cyanBright(loadText + "..\r"));
        await sleep(500);
        process.stdout.write(chalk.cyanBright(loadText + "...\r"));
        await sleep(500);
    }

    console.log("\n");
    console.log(chalk.greenBright("[ Neo Flare Bot is Starting... ]\n"));

    await sleep(500);
}

async function start() {
    await bootAnimation();

    // Mode pairing
    const args = [path.join(__dirname, file), "--pairing-code"];

    // Mode scan QR
    // const args = [path.join(__dirname, file)];

    console.log(chalk.gray("Launching process:\n"));
    console.log(chalk.yellow([process.argv[0], ...args].join(" ")));
    console.log();

    const p = spawn(process.argv[0], args, {
        stdio: ["inherit", "inherit", "inherit", "ipc"],
    });

    p.on("message", data => {
        if (data === "reset") {
            console.log(chalk.redBright("\n[ SYSTEM ] Restarting Bot...\n"));
            p.kill();
            start();
        }
    });

    p.on("exit", code => {
        console.error(chalk.redBright("\n[ SYSTEM ] Exited with code:"), code);

        if (code === 0 || code === 1) {
            console.log(chalk.yellowBright("[ SYSTEM ] Restarting...\n"));
            start();
        }
    });
}

start();