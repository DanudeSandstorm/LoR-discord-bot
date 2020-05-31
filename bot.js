const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');
const LoRAPI = require('./src/api-wrapper.js');
const lorapi = new LoRAPI(config.riotAPIKey);
const AdmZip = require('adm-zip');
const request = require('request');
const fs = require("fs-extra");

const regionInfo = require('./src/regionInfo.js');
const removeSpecialChars = require('./src/removeSpecialChars.js');
const { datapath, tempdir, set1, set2, regionIcons, cardArt } = require('./globals.js');
let { globals } = require('./globals.js');
const cardDetailed = require('./src/cardDetailed.js');
const cardBasic = require('./src/cardBasic.js');

const pre = config.prefix;

let set = [];

let downloading = false;

if (!fs.existsSync(datapath)) {
    fs.mkdirSync(datapath);
}

// if you pass in command line argument to redownload json files
if (process.argv[2] === 'true' || fs.readdirSync(datapath).length === 0) {
    // data packages retrieval
    const core_package_url = "https://dd.b.pvp.net/latest/core-en_us.zip";
    const set_bundle_url = "https://dd.b.pvp.net/latest/set1-lite-en_us.zip";
    const set2_bundle_url = "https://dd.b.pvp.net/latest/set2-lite-en_us.zip";

    downloading = true;
    let count = 0;
    const ready_count = () => {
        if (++count === 3) {
            downloading = false;
            set = [].concat(require(set1), require(set2));
            globals = require(globals);
        }
    }

    // request new data
    request.get({ url: core_package_url, encoding: null }, (err, res, body) => {
        console.log('retrieved core package');
        if (fs.existsSync(tempdir)) fs.removeSync(tempdir);

        const zip = new AdmZip(body);
        zip.extractAllTo(tempdir);

        fs.copy(tempdir, datapath + '/core-en-us').then(() => {
            ready_count();
        })
    });


    request.get({ url: set_bundle_url, encoding: null }, (err, res, body) => {
        console.log('retrieved set full package');
        if (fs.existsSync(tempdir)) fs.removeSync(tempdir);

        const zip = new AdmZip(body);
        zip.extractAllTo(tempdir);

        fs.copy(tempdir, datapath + '/set-full').then(() => {
            ready_count();
        })
    });

    request.get({ url: set2_bundle_url, encoding: null }, (err, res, body) => {
        console.log('retrieved set2 full package');
        if (fs.existsSync(tempdir)) fs.removeSync(tempdir);

        const zip = new AdmZip(body);
        zip.extractAllTo(tempdir);

        fs.copy(tempdir, datapath + '/set-full').then(() => {
            ready_count();
        })
    });
} else {
    set = [].concat(require(set1), require(set2));
    globals = require(globals);
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity(pre + 'help');
});

client.on('message', message => {
    // Exit and stop if it's not there and prevent bots from triggering each other
    // Prevent command while bot downloads data packages
    if (!message.content.startsWith(pre) || message.author.bot || downloading) {
        return;
    }

    const args = message.content.slice(pre.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    // log who called the message
    console.log(message.author.username + "#" + message.author.discriminator + " called command: " +
    command + " | with args: " + args);

    // Restrict a command to a specific user by ID
    if (command === 'dbm') {
        //if (message.content.startsWith(pre + 'dbm')) {
        if (message.author.id !== config.ownerID) {
            return;
        }
        message.channel.send("Hecc DBM!");
    }

    // author Reinforcements
    if (command === 'author') {
        message.channel.send("https://www.github.com/gakiloroth");
    }

    // get avatar
    if (command === 'avatar') {
        const member = message.mentions.users.first() || message.author;
        const embed = new Discord.RichEmbed()
            .setTitle(member.username)
            .setURL(member.avatarURL)
            .setImage(member.avatarURL)
            .setColor(0x1c60ff)
            .setFooter("If the image doesn't load click the title");

        message.channel.send({ embed });
    }

    // help
    if (command === 'help') {
        const embed = new Discord.RichEmbed()
            .setTitle("Commands")
            .setAuthor(client.user.username, client.user.avatarURL)
            .setColor(0x1c60ff)
            .setDescription(
                "`" + pre + "keyword`\n" +
                "`" + pre + "region`\n" +
                "`" + pre + "card`\n" +
                "`" + pre + "detailed`\n" +
                "`" + pre + "cardid`\n" +
                "`" + pre + "artname`\n" +
                "`" + pre + "artid`\n"
            );

        message.channel.send({ embed });
    }

    // get card info
    if (command === "keyword") {
        const myKeyword = removeSpecialChars(message.content.slice(pre.length + command.length));

        let currKeywords = globals.keywords;
        let currWord = null;

        for (let i = 0; i < currKeywords.length; i++) {
            if (currKeywords[i].nameRef.toLowerCase().replace(/\s/g, '') === myKeyword) {
                currWord = currKeywords[i];
            }
        }

        if (currWord === null) {
            message.channel.send("No matching keyword found!");
            return;
        }

        const embed = new Discord.RichEmbed()
            .setTitle(currWord.name)
            .setAuthor(client.user.username, client.user.avatarURL)
            .setColor(0x1c60ff)
            .setDescription(currWord.description);

        message.channel.send({ embed });
    }

    // get region info
    if (command === "region") {
        const [myRegion] = args;
        message.channel.send(regionInfo(myRegion, globals.regions, client.user));
    }

    // get card by name
    if (command === "card") {
        const myCardName = removeSpecialChars(message.content.slice(pre.length + command.length));
        message.channel.send(cardBasic(myCardName, set, client.user));
    }

    if (command === "detailed") {
        const myCardName = removeSpecialChars(message.content.slice(pre.length + command.length));
        message.channel.send(cardDetailed(myCardName, set, client.user));
    }

    // get card by id
    if (command === "cardid") {
        const myCardID = message.content.slice(pre.length + command.length)
            .trim()
            .toLowerCase()
            .replace(/\s/g, '');

        let currCard = null;

        for (let i = 0; i < set.length; i++) {
            if (set[i].cardCode.toLowerCase().replace(/\s/g, '') === myCardID) {
                currCard = set[i];
            }
        }

        if (currCard === null) {
            message.channel.send("No matching card found!");
            return;
        }

        const artAttach = new Discord.Attachment(cardArt + currCard.cardCode + '.png', 'art.png');
        let regionAttach;

        // TEMPORARY FIX FOR NEUTRAL and ALL
        if (currCard.regionRef.toLowerCase() === 'neutral') {
            regionAttach = new Discord.Attachment(regionIcons + 'icon-all' + '.png', 'icon.png');
        }
        else {
            regionAttach = new Discord.Attachment(regionIcons + 'icon-' +
            currCard.regionRef.toLowerCase() + '.png', 'icon.png');
        }

        const embed = new Discord.RichEmbed()
            .setDescription('**Description:** ' + currCard.descriptionRaw)
            .setAuthor(client.user.username, client.user.avatarURL)
            .setColor(0x1c60ff)
            .attachFiles([artAttach, regionAttach])
            .setImage('attachment://art.png')
            .setThumbnail('attachment://icon.png')
            .setFooter(currCard.flavorText + '      Artist: ' + currCard.artistName)

        //get related cards
        let associatedCards = currCard.associatedCardRefs;
        let associatedCardsString = "";
        for (let i = 0; i < associatedCards.length; i++) {
            const findCard = (card) => {
                return card.cardCode === associatedCards[i];
            }

            let foundCard = set.find(findCard);

            if (i == associatedCards.length - 1) {
                associatedCardsString += foundCard.name + " (" + foundCard.cardCode + ")";
                break;
            }
            associatedCardsString += foundCard.name + " (" + foundCard.cardCode + "), ";
        }

        // detail in title if card is collectible
        if (currCard.collectible === true) {
            embed.setTitle(currCard.name + ' (Collectible)');
        }
        else {
            embed.setTitle(currCard.name);
        }

        // access different data depenidng on card type
        if (currCard.type === 'Spell') {
            embed.addField("**Details** ",
                "**Cost: ** " + currCard.cost + "\n" +
                "**Type: ** " + currCard.spellSpeed + " Spell\n" +
                "**Rarity: ** " + currCard.rarity + "\n" +
                "**Region: ** " + currCard.region + "\n" +
                "**ID: ** " + currCard.cardCode + "\n" +
                "**Related Cards: ** " + associatedCardsString + "\n"
                , false);
        }

        if (currCard.type === 'Unit') {
            embed.addField("**Details** ",
                "**Cost: ** " + currCard.cost + "\n" +
                "**Attack: ** " + currCard.attack + "\n" +
                "**Health: ** " + currCard.health + "\n" +
                "**Keywords: ** " + currCard.keywords + "\n" +
                "**Type: ** " + currCard.supertype + " "+ currCard.type + "\n" +
                "**Rarity: ** " + currCard.rarity + "\n" +
                "**Region: ** " + currCard.region + "\n" +
                "**ID: ** " + currCard.cardCode + "\n" +
                "**Related Cards: ** " + associatedCardsString + "\n"
                ,false);
        }

        message.channel.send({ embed });
    }

    // get card art by name
    if (command === "artname") {
        const myCardName = removeSpecialChars(message.content.slice(pre.length + command.length));

        console.log(myCardName);

        let currCard = null;

        for (let i = 0; i < set.length; i++) {
            if (set[i].name.toLowerCase().replace(/\s/g, '') === myCardName) {
                currCard = set[i];
            }
        }

        if (currCard === null) {
            message.channel.send("No matching card found!");
            return;
        }

        const artAttach = new Discord.Attachment(cardArt + currCard.cardCode + '-full.png', 'art.png');
        let regionAttach;

        // TEMPORARY FIX FOR NEUTRAL and ALL
        if (currCard.regionRef.toLowerCase() === 'neutral') {
            regionAttach = new Discord.Attachment(regionIcons + 'icon-all' + '.png', 'icon.png');
        }
        else {
            regionAttach = new Discord.Attachment(regionIcons + 'icon-' +
            currCard.regionRef.toLowerCase() + '.png', 'icon.png');
        }

        const embed = new Discord.RichEmbed()
            .setAuthor(client.user.username, client.user.avatarURL)
            .setColor(0x1c60ff)
            .attachFiles([artAttach, regionAttach])
            .setImage('attachment://art.png')
            .setThumbnail('attachment://icon.png')
            .setFooter(currCard.flavorText + ' | Artist: ' + currCard.artistName)

        message.channel.send({ embed });
    }

    // get card art by id
    if (command === "artid") {
        const myCardID = message.content.slice(pre.length + command.length)
            .trim()
            .toLowerCase()
            .replace(/\s/g, '');

        let currCard = null;

        for (let i = 0; i < set.length; i++) {
            if (set[i].cardCode.toLowerCase().replace(/\s/g, '') === myCardID) {
                currCard = set[i];
            }
        }

        if (currCard === null) {
            message.channel.send("No matching card found!");
            return;
        }

        const artAttach = new Discord.Attachment(cardArt + currCard.cardCode + '-full.png', 'art.png');
        let regionAttach;

        // TEMPORARY FIX FOR NEUTRAL and ALL
        if (currCard.regionRef.toLowerCase() === 'neutral') {
            regionAttach = new Discord.Attachment(regionIcons + 'icon-all' + '.png', 'icon.png');
        }
        else {
            regionAttach = new Discord.Attachment(regionIcons + 'icon-' +
            currCard.regionRef.toLowerCase() + '.png', 'icon.png');
        }

        const embed = new Discord.RichEmbed()
            .setAuthor(client.user.username, client.user.avatarURL)
            .setColor(0x1c60ff)
            .attachFiles([artAttach, regionAttach])
            .setImage('attachment://art.png')
            .setThumbnail('attachment://icon.png')
            .setFooter(currCard.flavorText + ' | Artist: ' + currCard.artistName)

        message.channel.send({ embed });
    }

    if (config.riotAPIKey && command === "deck") {
        lorapi.deck("localhost:21337", function (data) {
            if (data === null) {
                message.channel.send("API unresponsive!");
                return;
            }
            console.log(data);
            if (data.DeckCode !== null) {
                message.channel.send(data.DeckCode);
            }
            else {
                message.channel.send("Player not in game!");
            }
        })
    }

    if (config.riotAPIKey && command === "lastgame") {
        lorapi.lastgame("localhost:21337", function (data) {
            if (data == null) {
                message.channel.send("API unresponsive!");
                return;
            }
            console.log(data);
            if (data.LocalPlayerWon !== null) {
                if (data.LocalPlayerWon) {
                    message.channel.send("Player won the last game!");
                }
                else {
                    message.channel.send("Player lost the last game.");
                }
            }
            else {
                message.channel.send("No last game info!");
            }
        })
    }

    if (config.riotAPIKey && command === "currentgame") {
        lorapi.currentgame("localhost:21337", function (data) {
            if (data == null) {
                message.channel.send("API unresponsive!");
                return;
            }
            console.log(data);
            if (data.PlayerName !== null) {
                message.channel.send(data.PlayerName + " is in game against " +
            data.OpponentName + ".");
            }
            else {
                message.channel.send("Player not in game!");
            }
        })
    }
});

process.on('unhandledRejection', error => {
    // Won't execute
    console.log('unhandledRejection', error);
});

client.login(config.token);
