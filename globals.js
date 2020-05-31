const datapath = __dirname + '/data';
const tempdir = __dirname + '/tmp';
// https://developer.riotgames.com/docs/lor
const globals = datapath + "/core-en-us/en_us/data/globals-en_us.json";
const set1 = datapath + "/set-full/en_us/data/set1-en_us.json";
const set2 = datapath + "/set-full/en_us/data/set2-en_us.json";
const regionIcons = datapath + "/core-en-us/en_us/img/regions/";
const cardArt = datapath + "/set-full/en_us/img/cards/";

module.exports = {
    datapath,
    tempdir,
    globals,
    set1,
    set2,
    regionIcons,
    cardArt
}