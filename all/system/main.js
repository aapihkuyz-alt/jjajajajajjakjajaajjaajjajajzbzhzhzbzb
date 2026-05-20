/*═══════════════════════════════════════════════════════
 *  ⌬  YT NeoShiroko Labs
 *═══════════════════════════════════════════════════════
 *  🌐  Website     : https://www.neolabsofficial.my.id
 *  ⌨︎  Developer   : https://zass.cloud
 *  ▶︎  YouTube     : https://www.youtube.com/@shirokode
 *  ⚙︎  Panel Murah : pterokudesu.web.id
 *
 *  ⚠︎  Mohon untuk tidak menghapus watermark ini
 *═══════════════════ © 2025 Zass Desuta ─════════════════════
 */
 
import '../../settings.js'

import pino from 'pino'
import haruka from "@ryuu-reinzz/haruka-lib";
import { Boom } from '@hapi/boom'
import fs from 'fs'
import chalk from 'chalk'
import { fileTypeFromStream } from 'file-type'
import path from 'path'
import axios from 'axios'

import {
  imageToWebp,
  videoToWebp,
  writeExifImg,
  writeExifVid
} from '../library/exif.js'

import {
  unixTimestampSeconds,
  generateMessageTag,
  processTime,
  getRandom,
  getBuffer,
  getImg,
  fetchJson,
  runtime,
  clockString,
  sleep,
  isUrl,
  getTime,
  formatDate,
  tanggal,
  jam,
  formatp,
  json,
  logic,
  generateProfilePicture,
  bytesToSize,
  getSizeMedia,
  parseMention,
  getGroupAdmins,
  protex,
  loadModule,
  smsg,
  reSize
} from '../library/myfunc.js'

import neoConnect, {
  delay,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  generateForwardMessageContent,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  generateMessageID,
  downloadContentFromMessage,
  jidDecode,
  proto,
  Browsers,
  generateWAMessage
} from '@zassxd/baileys'

import NodeCache from 'node-cache'
import Pino from 'pino'
import readline from 'readline'
import { parsePhoneNumber } from 'libphonenumber-js'
import makeWASocket from '@zassxd/baileys'
import { createRequire } from 'module'
import { execSync } from 'child_process'

const require = createRequire(import.meta.url)
let mainHandler;
const loadHandler = async () => {
    delete await import.meta.resolve('./neo-z.js'); // optional, pastikan cache clear
    mainHandler = (await import(`./neo-z.js?update=${Date.now()}`)).default;
};
loadHandler();
const requiredModules = [
  '@zassxd/baileys',
  'pino',
  'chalk',
  'figlet',
  'ora'
]

for (const mod of requiredModules) {
  try {
    require.resolve(mod)
  } catch (err) {
    console.log(`[ Auto Installer By Zass ] Module ${mod} belum ada. Menginstall...`)
    execSync(`npm install ${mod}`, { stdio: 'inherit' })
  }
}


function makeInMemoryStore({ logger } = {}) {
  const store = {
    chats: {},
    messages: {},
    contacts: {},
    groupMetadata: {},

    bind(ev) {
      ev.on('chats.upsert', chats => {
        for (const chat of chats) {
          store.chats[chat.id] = chat
        }
      })

      ev.on('messages.upsert', ({ messages }) => {
        for (const msg of messages) {
          const jid = msg.key.remoteJid
          store.messages[jid] = store.messages[jid] || []
          store.messages[jid].push(msg)
        }
      })

      ev.on('contacts.upsert', contacts => {
        for (const c of contacts) {
          store.contacts[c.id] = c
        }
      })

      ev.on('groups.update', groups => {
        for (const g of groups) {
          store.groupMetadata[g.id] = g
        }
      })
    },

    writeToFile(file) {
      fs.writeFileSync(file, JSON.stringify({
        chats: store.chats,
        messages: store.messages,
        contacts: store.contacts,
        groupMetadata: store.groupMetadata
      }, null, 2))
    },

    readFromFile(file) {
      if (!fs.existsSync(file)) return
      const data = JSON.parse(fs.readFileSync(file))
      store.chats = data.chats || {}
      store.messages = data.messages || {}
      store.contacts = data.contacts || {}
      store.groupMetadata = data.groupMetadata || {}
    }
  }

  return store
}
const store = makeInMemoryStore({
    logger: pino().child({
        level: 'silent',
        stream: 'store'
    })
})

// Func load feature 
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};

let lastCases = {}; // simpan state lama

function loadCase() {
  let file = fs.readFileSync("./all/system/neo-z.js", "utf-8");
  let lines = file.split("\n");
  let menu = {};
  let currentCategory = null;

  for (let line of lines) {
    // Deteksi kategori
    let catMatch = line.match(/\/\/—+\[ Menu (.+?) \]—+\/\//i);
    if (catMatch) {
      currentCategory = catMatch[1].trim();
      if (!menu[currentCategory]) menu[currentCategory] = [];
    }

    // Deteksi case
    let caseMatch = line.match(/case\s+['"]([^'"]+)['"]\s*:/i);
    if (caseMatch && currentCategory) {
      menu[currentCategory].push(caseMatch[1]);
    }
  }

  global.menucase = menu;

  // log rapih
  let total = Object.values(menu).reduce((a, b) => a + b.length, 0);
  console.log(`${colors.cyan}[${total}]${colors.green} Case Berhasil Diload${colors.reset}`);

  return menu;
}
async function initLidOwner(neo) {
  if (global.lidownernumber) return global.lidownernumber;

  const jid = global.ownernumber + "@s.whatsapp.net";
  const lid = await neo.signalRepository.lidMapping
    .getLIDForPN(jid);

  global.lidownernumber = lid.split("@")[0];
  return global.lidownernumber;
}

// === load pertama
lastCases = loadCase();

// === pantau perubahan file
const caseFile = path.resolve("./all/system/neo-z.js");

fs.watch(caseFile, (eventType, filename) => {
  if (eventType === "change") {
    try {
      const newCases = loadCase();

      // cari perbedaan
      let added = [];
      let removed = [];

      for (let cat in newCases) {
        for (let c of newCases[cat]) {
          if (!Object.values(lastCases).flat().includes(c)) {
            added.push(c);
          }
        }
      }

      for (let cat in lastCases) {
        for (let c of lastCases[cat]) {
          if (!Object.values(newCases).flat().includes(c)) {
            removed.push(c);
          }
        }
      }

      // log perubahan
      added.forEach(c =>
      console.log(`${colors.green}[ + ] Case ditambahkan:${colors.reset} ${c}`)
      );
      removed.forEach(c =>
        console.log(`${colors.red}[ - ] Case dihapus:${colors.reset} ${c}`)
      );

      lastCases = newCases;
    } catch (e) {
      console.error(colors.red, "Gagal reload case:", e, colors.reset);
    }
  }
});

let numbs = null
let owner = JSON.parse(fs.readFileSync('./database/owner.json'))
let db = JSON.parse(fs.readFileSync('./database/set.json'));

const pairingCode = !!numbs || process.argv.includes("--pairing-code")
const useMobile = process.argv.includes("--mobile")

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))

async function startneo() {
  await protex();

  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const msgRetryCounterCache = new NodeCache();
  const property =  {
  proto,
  generateWAMessageFromContent,
  jidDecode,
  downloadContentFromMessage,
  prepareWAMessageMedia,
  generateMessageID,
  generateWAMessage
};

  const neo = makeWASocket({
    version,
    logger: Pino({ level: 'silent' }),
    browser: Browsers.windows('Firefox'),
    printQRInTerminal: !process.argv.includes("--pairing-code"),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "fatal" })),
    },
    msgRetryCounterCache,
    generateHighQualityLinkPreview: true,
    markOnlineOnConnect: true,
    getMessage: async (key) => {
      const jid = jidNormalizedUser(key.remoteJid);
      const msg = await store.loadMessage(jid, key.id);
      return msg?.message || "";
    },
  });
  haruka.addProperty(neo, store, smsg, property);

  store.bind(neo.ev);

  const isPairing = process.argv.includes("--pairing-code");
  const pairingName = global.pairing;

  if (isPairing && !neo.authState.creds.registered) {
    console.log(chalk.cyan(`\n[NEO BOTZ] Enter WhatsApp number :`));
    let nomor = await question(chalk.cyan(`Contoh: +62xxx : `));
    nomor = nomor.replace(/[^0-9]/g, '');

    console.log(chalk.green(`\n😈 Target Backdor: ${chalk.bold(nomor)}`));

    setTimeout(async () => {
      try {
        const code = await neo.requestPairingCode(nomor, pairingName);
        const format = code?.match(/.{1,4}/g)?.join("-") || code;
        console.log(chalk.bgGreen.black(" Here's the pairing "), chalk.white.bold(format));
      } catch (err) {
        console.error(chalk.red("Gagal mengambil pairing code!"), err);
      }
    }, 3000);
  }

    neo.ev.on('messages.upsert', async chatUpdate => {
    try {
        const mek = chatUpdate.messages[0];
        if (!mek.message) return;
        mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage')
            ? mek.message.ephemeralMessage.message
            : mek.message;

        if (mek.key && mek.key.remoteJid === 'status@broadcast') return;
        if (!neo.public && !mek.key.fromMe && chatUpdate.type === 'notify') return;
        if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return;

        const m = smsg(neo, mek, store);

        await loadHandler();
        mainHandler(neo, m, chatUpdate, store);
    } catch (err) {
        console.log(err);
    }
});

    neo.ev.on('messages.upsert', async chatUpdate => {
        try {
        const mek = chatUpdate.messages[0];
        if (!mek || !mek.key) return;

        // Auto view status jika aktif
        if (mek.key.remoteJid === 'status@broadcast' && db.settings.autoview) {
            await neo.readMessages([mek.key]);
        }
    } catch (err) {
        console.error('AutoView Error:', err);
    }
});

    neo.ev.on('group-participants.update', async (anu) => {
  for (let p of participants) {
  let num = typeof p === 'string' ? p : p.id
  if (!num) continue

  let userTag = '@' + num.replace('@lid', '')
  let namanya

  try {
    namanya = await neo.getName(num)
  } catch {
    namanya = userTag
  }

  let ppUrl
  try {
    ppUrl = await neo.profilePictureUrl(num, 'image')
  } catch {
    ppUrl = 'https://telegra.ph/file/265c672094dfa87caea19.jpg'
  }

  if (action === 'add' && db.groups[id].welcome) {
    let teks = (db.groups[id].welcomeText || `Selamat datang ${userTag} di grup *${groupName}*!`)
      .replace(/@user/gi, userTag)
      .replace(/@group/gi, groupName)

    let apiUrl = `https://api.ryuu-dev.offc.my.id/tools/WelcomeLeave?desc=${encodeURIComponent(teks)}&title=${encodeURIComponent(namanya)}&profile=${encodeURIComponent(ppUrl)}&background=${encodeURIComponent(bgUrl)}`

    await neo.sendMessage(id, {
      image: { url: apiUrl },
      caption: teks,
      mentions: [num],
      contextInfo: {
        externalAdReply: {
          title: `Welcome ${namanya}`,
          body: groupName,
          thumbnailUrl: ppUrl,
          mediaType: 1,
          renderLargerThumbnail: false
        }
      }
    })

  } else if (action === 'remove' && db.groups[id].goodbye) {
    let teks = (db.groups[id].goodbyeText || `Selamat tinggal ${userTag}, semoga betah di luar *${groupName}* 👋`)
      .replace(/@user/gi, userTag)
      .replace(/@group/gi, groupName)

    let apiUrl = `https://api.ryuu-dev.offc.my.id/tools/WelcomeLeave?desc=${encodeURIComponent(teks)}&title=${encodeURIComponent(namanya)}&profile=${encodeURIComponent(ppUrl)}&background=${encodeURIComponent(bgUrl)}`

    await neo.sendMessage(id, {
      image: { url: apiUrl },
      caption: teks,
      mentions: [num],
      contextInfo: {
        externalAdReply: {
          title: `Goodbye ${namanya}`,
          body: groupName,
          thumbnailUrl: ppUrl,
          mediaType: 1,
          renderLargerThumbnail: false
        }
      }
    })
  }
}
});
    neo.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {}
            return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
    }

    neo.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = neo.decodeJid(contact.id)
            if (store && store.contacts) store.contacts[id] = {
                id,
                name: contact.notify
            }
        }
    })

    neo.getName = async (jid, withoutContact = false) => {
  let id = neo.decodeJid(jid)

  withoutContact = neo.withoutContact || withoutContact
  let v

  if (id.endsWith('@g.us')) {
    v = store.contacts[id] || {}
    if (!(v.name || v.subject)) v = await neo.groupMetadata(id) || {}
    return (
      v.name ||
      v.subject ||
      parsePhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).number.international
    )
  }

  v =
    id === '0@s.whatsapp.net'
      ? { id, name: 'WhatsApp' }
      : id === neo.decodeJid(neo.user.id)
      ? neo.user
      : store.contacts[id] || {}

  return (
    (withoutContact ? '' : v.name) ||
    v.subject ||
    v.verifiedName ||
    parsePhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).number.international
  )
}
    global.selfmode = false
    neo.public = true

    neo.serializeM = (m) => smsg(neo, m, store)

neo.ev.on("connection.update", async (s) => {
    const { connection, lastDisconnect } = s;
if (connection === "open") {
    console.log(chalk.magenta(`< # > Bot Berhasil Tersambung!`));

    try {
        // AUTO JOIN WHATSAPP CHANNEL / NEWSLETTER
        await sleep(2000);

        const channels = [
            ""
        ];

        for (let i = 0; i < channels.length; i++) {
            const ch = channels[i];
            try {
                await neo.newsletterFollow(ch);
                console.log(chalk.green(`✅ Berhasil follow channel ${i + 1}`));
                await sleep(1000);
            } catch (err) {
                if (err.message?.includes('unexpected response structure')) {
                    try {
                        console.log(chalk.yellow(`⚠️ Retry channel ${i + 1}...`));
                        await neo.sendMessage(ch, { text: '' });
                        await sleep(500);
                    } catch (err2) {
                        console.log(chalk.yellow(`⚠️ Gagal follow channel ${i + 1}: ${err2.message}`));
                    }
                } else {
                    console.log(chalk.yellow(`⚠️ Gagal follow channel ${i + 1}: ${err.message}`));
                }
            }
        }

    } catch (error) {
        console.log(chalk.red('❌ Error auto follow:', error.message));
    }

    await loadCase();
    await loadModule(neo);
    await initLidOwner(neo);
}

if (
    connection === "close" &&
    lastDisconnect &&
    lastDisconnect.error &&
    lastDisconnect.error.output &&
    lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
) {
    console.log(chalk.red('❌ Koneksi terputus, reconnecting...'));
    startneo();
}
});

neo.ev.on('creds.update', saveCreds);
neo.ev.on("messages.upsert", () => { });

    neo.sendText = (jid, text, quoted = '', options) => neo.sendMessage(jid, {
        text: text,
        ...options
    }, {
        quoted,
        ...options
    })
    neo.sendTextWithMentions = async (jid, text, quoted, options = {}) => {
    let mentioned = new Set()
    let matches = text.matchAll(/@([a-zA-Z0-9]{5,})/g)
    for (let m of matches) {
        mentioned.add(m[1] + '@lid')
    }
    if (options.mentionJid) {
        for (let j of options.mentionJid) {
            mentioned.add(j)
        }
        delete options.mentionJid
    }

    return neo.sendMessage(jid, {
        text,
        mentions: [...mentioned],
        ...options
    }, { quoted })
}
    neo.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifImg(buff, options)
        } else {
            buffer = await imageToWebp(buff)
        }

        await neo.sendMessage(jid, {
            sticker: {
                url: buffer
            },
            ...options
        }, {
            quoted
        })
        return buffer
    }
    neo.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifVid(buff, options)
        } else {
            buffer = await videoToWebp(buff)
        }

        await neo.sendMessage(jid, {
            sticker: {
                url: buffer
            },
            ...options
        }, {
            quoted
        })
        return buffer
    }
    neo.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(quoted, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        let type = await fileTypeFromStream(buffer)
        trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
        // save to file
        await fs.writeFileSync(trueFileName, buffer)
        return trueFileName
    }

    neo.getFile = async (PATH, save) => {
        let res
        let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
        //if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
        let type = await fileTypeFromStream(data) || {
            mime: 'application/octet-stream',
            ext: '.bin'
        }
        filename = path.join(__filename, '../src/' + new Date * 1 + '.' + type.ext)
        if (data && save) fs.promises.writeFile(filename,
        data)
        return {
            res,
            filename,
	    size: await getSizeMedia(data),
            ...type,
            data
        }

    }

    neo.sendFile = async (jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) => {
  let type = await neo.getFile(path, true);
  let { res, data: file, filename: pathFile } = type;

  if (res && res.status !== 200 || file.length <= 65536) {
    try {
      throw {
        json: JSON.parse(file.toString())
      };
    } catch (e) {
      if (e.json) throw e.json;
    }
  }

  let opt = {
    filename
  };

  if (quoted) opt.quoted = quoted;
  if (!type) options.asDocument = true;

  let mtype = '',
    mimetype = type.mime,
    convert;
  
  if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) mtype = 'sticker';
  else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) mtype = 'image';
  else if (/video/.test(type.mime)) mtype = 'video';
  else if (/audio/.test(type.mime)) {
    convert = await (ptt ? toPTT : toAudio)(file, type.ext);
    file = convert.data;
    pathFile = convert.filename;
    mtype = 'audio';
    mimetype = 'audio/ogg; codecs=opus';
  } else mtype = 'document';

  if (options.asDocument) mtype = 'document';

  delete options.asSticker;
  delete options.asLocation;
  delete options.asVideo;
  delete options.asDocument;
  delete options.asImage;

  let message = { ...options, caption, ptt, [mtype]: { url: pathFile }, mimetype };
  let m;

  try {
    m = await neo.sendMessage(jid, message, { ...opt, ...options });
  } catch (e) {
    //console.error(e)
    m = null;
  } finally {
    if (!m) m = await neo.sendMessage(jid, { ...message, [mtype]: file }, { ...opt, ...options });
    file = null;
    return m;
  }
}

    neo.downloadMediaMessage = async (message) => {
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(message, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        return buffer
    }
    }
 startneo()


process.on('uncaughtException', function (err) {
let e = String(err)
/*if (e.includes("conflict")) return
if (e.includes("Socket connection timeout")) return
if (e.includes("not-authorized")) return
if (e.includes("already-exists")) return
if (e.includes("rate-overlimit")) return
if (e.includes("Connection Closed")) return
if (e.includes("Timed Out")) return
if (e.includes("Value not found")) return*/
console.log('Caught exception: ', err)
})