import { Attachment, RichEmbed } from 'discord.js';
import { regionIcons } from './globals';

export default function regionInfo(myRegion, currRegions, user) {
    let currRegion = null;

    for (let i = 0; i < currRegions.length; i++) {
        if (currRegions[i].nameRef.toLowerCase().replace(/\s/g, '') === myRegion) {
            currRegion = currRegions[i];
        }
    }

    if (currRegion === null) {
        return ("No matching region found!");
    }

    let attachment;
    // TEMPORARY FIX FOR NEUTRAL and ALL
    if (currRegion.nameRef.toLowerCase() === 'neutral') {
        attachment = new Attachment(regionIcons + 'icon-all' + '.png', 'icon.png');
    }
    else {
        attachment = new Attachment(regionIcons + 'icon-' +
          currRegion.nameRef.toLowerCase() + '.png', 'icon.png');
    }

    const embed = new RichEmbed()
        .setTitle(currRegion.name)
        .setAuthor(user.username, user.avatarURL)
        .setColor(0x1c60ff)
        .attachFile(attachment)
        .setThumbnail('attachment://icon.png');

    return { embed };
}