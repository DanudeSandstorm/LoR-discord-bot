import { Attachment, RichEmbed } from 'discord.js';
import { regionIcons, cardArt } from './globals';

export default function card(myCardName, set, user) {
    let currCard = null;

    for (let i = 0; i < set.length; i++) {
        if (set[i].name.toLowerCase().replace("[^a-zA-Z0-9]", "").replace(/\s/g, '') === myCardName) {
            currCard = set[i];
        }
    }

    if (currCard === null) {
        return ("No matching card found!");
    }

    const artAttach = new Attachment(cardArt + currCard.cardCode + '.png', 'art.png');
    let regionAttach;

    // TEMPORARY FIX FOR NEUTRAL and ALL
    if (currCard.regionRef.toLowerCase() === 'neutral') {
        regionAttach = new Attachment(regionIcons + 'icon-all' + '.png', 'icon.png');
    }
    else {
        regionAttach = new Attachment(regionIcons + 'icon-' +
        currCard.regionRef.toLowerCase() + '.png', 'icon.png');
    }

    const embed = new RichEmbed()
        .setDescription('**Description:** ' + currCard.descriptionRaw)
        .setAuthor(user.username, user.avatarURL)
        .setColor(0x1c60ff)
        .attachFiles([artAttach, regionAttach])
        .setImage('attachment://art.png')
        .setThumbnail('attachment://icon.png')
        .setFooter(currCard.flavorText + '    |  Artist: ' + currCard.artistName)

    // detail in title if card is collectible
    if (currCard.collectible === true) {
        embed.setTitle(currCard.name + ' (Collectible)');
    }
    else {
        embed.setTitle(currCard.name);
    }
    
    return { embed };
}