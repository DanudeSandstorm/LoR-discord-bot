const { Attachment, RichEmbed } = require('discord.js');
const { regionIcons, cardArt } = require('../globals.js');

module.exports = function cardDetailed(myCardName, set, user) {
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
            ,false);
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

    if (currCard.type === 'Trap') {
        embed.addField("**Details** ",
            "**Keywords: ** " + currCard.keywords + "\n" +
          "**Type: ** " + currCard.supertype + " "+ currCard.type + "\n" +
          "**Rarity: ** " + currCard.rarity + "\n" +
          "**Region: ** " + currCard.region + "\n" +
          "**ID: ** " + currCard.cardCode + "\n" +
          "**Related Cards: ** " + associatedCardsString + "\n"
            ,false);
    }

    if (currCard.type === 'Ability') {
        embed.addField("**Details** ",
            "**Cost: ** " + currCard.cost + "\n" +
          "**Keywords: ** " + currCard.keywords + "\n" +
          "**Type: ** " + currCard.supertype + " "+ currCard.type + "\n" +
          "**Rarity: ** " + currCard.rarity + "\n" +
          "**Region: ** " + currCard.region + "\n" +
          "**ID: ** " + currCard.cardCode + "\n" +
          "**Related Cards: ** " + associatedCardsString + "\n"
            ,false);
    }

    return { embed };
}