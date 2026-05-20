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
import fs from "fs";
import { pathToFileURL, fileURLToPath } from "url";
import chalk from "chalk";
//——————————[ Set Owner ]——————————//
global.ytname = "https://www.youtube.com/@shirokode"
global.location = "Abydos High School"
global.ownername = "Zass Desuta"
global.ownernumber = '62881011486191' 
global.lidownernumber = null; // biarin, wadah kosong :v
global.email = "ok.shiroko@zass.cloud" // email (opsional)

//——————————[ Set Bot ]——————————//
global.botname = '𝙽𝚎𝚘 𝙵𝚕𝚊𝚛𝚎 あ⁩'
global.versi = '6.1'
global.foot = '© ᴍᴀᴅᴇ ʙʏ ᴢᴀss ᴅᴇsᴜᴛᴀ'
global.idSaluran = ""
global.namach = "𝙽𝚎𝚘'𝚂 𝙻𝚊𝚋𝚜 𝙲𝚑."
global.aiUsageCount = global.aiUsageCount || {};
global.autoAiSessions = {};
global.hias = "➤"
global.pairing = "NEOFLARE"

//——————————[ Set Sticker ]——————————//
global.packname = ':: 𝙽𝚎𝚘 𝙵𝚕𝚊𝚛𝚎 ::'
global.author = `\nWaBot By NeoShiroko Labs`
global.themeemoji = '🪀'
global.wm = "⫹⫺ 𝚈𝚃 𝙽𝚎𝚘𝚂𝚑𝚒𝚛𝚘𝚔𝚘 𝙻𝚊𝚋𝚜"

//——————————[ Set Link ]——————————//
global.link = "https://whatsapp.com/channel/0029Vb6w7eO9sBIEUYRgeC30"
global.namagc = "Marketplace¹ || Zass Official"
global.linkgc = "https://chat.whatsapp.com/Bvdic3yrpFh5kTkk5oc5G0"
global.web = "https://www.neolabsofficial.my.id"
global.prefa = ['!','.','#','💐']

//——————————[ Set Payment ]——————————//
global.dana = "Tidak Tersedia" // Isi no dana mu
global.gopay = "Tidak Tersedia" // Isi no gopay mu
global.ovo = "Tidak Tersedia" // Isi no ovo mu
global.qris = "https://link_qr_mu.desu" // pakai fitur .tourl untuk ubah foto ke link
global.an = {
  dana: "Nama dana",
  gopay: "Nama Gopay",
  ovo: "Nama Ovo"
}

//——————————[ Set Automatic ]——————————//
// Provider pg Pakasir [  registrasi di https://pakasir.com  ]
global.pay = {
  apikey: "APIKEY_KAMU", // apikey pakasir
  project: "SLUG_KAMU" // slug pakasir
}

// Provider h2h Vip Reseller [  registrasi di https://vip-reseller.co.id  ]
global.ch2h = {
  api_id: "xxx", // Api ID vipreseller
  apikey: "xxx" // Apikey vipreseller
}

// Provider nokos
/* Akan segera hadir*/

// Provider smm
/* Akan segera hadir*/

//——————————[ Set Pushkontak ]——————————//
global.delayjpm = 1000
global.delaypushkontak = 6000

//——————————[ Manage Vercell ]——————————//
global.vercelToken = "xxx" //Your Vercel Token

//——————————[ Manage GitHub ]——————————//
global.githubToken = "xxx" //Your GitHub Token
global.githubUsername = "xxx" //Your GitHub Username

//——————————[ Media Url ]——————————//
global.gif = "https://files.catbox.moe/22w9jb.mp4"
global.imgthumb = "https://files.catbox.moe/3d1yns.jpg" 
global.imgmenu = "https://files.catbox.moe/3d1yns.jpg" 
global.imgdoc = "https://files.catbox.moe/lmbhlo.jpeg" // ukuran 1280 × 450
global.logo = "https://files.catbox.moe/3d1yns.jpg" 
global.vn = "https://files.catbox.moe/ub4w7z.mpeg" 
global.thumb_welcome = "https://files.catbox.moe/05ot73.jpeg"

//——————————[ Api Panel V1 ]——————————//
global.egg = "15" // Isi id egg
global.nestid = "5" // Isi id nest
global.loc = "1" // Isi id location
global.domain = "https://domainmu.com"
global.apikey = "" // Isi api ptla
global.capikey = "" // Isi api ptlc

//——————————[ Api Panel V2 ]——————————//
global.egg2 = "15" // Isi id egg
global.nestid2 = "5" // Isi id nest
global.loc2 = "1" // Isi id location
global.domain2 = "https://domainmu2.com"
global.apikey2 = "-" // Isi api ptla
global.capikey2 = "-" // Isi api ptlc

//——————————[ Api Panel PV ]——————————//
global.egg3 = "15" // Isi id egg
global.nestid3 = "5" // Isi id nest
global.loc3 = "1" // Isi id location
global.domain3 = "https://domainmu-privatepanel.vip"
global.apikey3 = "-" // Isi api ptla
global.capikey3 = "-" // Isi api ptlc

//——————————[ Set Massage ]——————————//
global.loadreact = "🎊"
global.mesg = {
  slr: "Fitur ini khusus reseller! Silahkan hubungi owner untuk membeli akses",
  pv: "*[ Warm System ]* Fitur ini khusus di private chat",
  gc: "*[ Warm System ]* Fitur ini khusus grup om—____—",
  own: "*[ Warm System ]* Sok asikk fitur ini khusus manusia tertamvan",
  adm: "*[ Warm System ]* Fitur ini khusus ateminnn",
  botadm: "Jadiin admin dulu",
  load: "bentar....",
  err: "Terjadi kesalahan, coba lagi suatu saat nanti..."
}

const __filename = fileURLToPath(import.meta.url);

fs.watchFile(__filename, () => {
  fs.unwatchFile(__filename);
  console.log(chalk.green.bold("New Update: settings"));
  import(`${import.meta.url}?update=${Date.now()}`);
});