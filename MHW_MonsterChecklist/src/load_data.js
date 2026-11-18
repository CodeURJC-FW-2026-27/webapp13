import fs from "node:fs/promises";
import * as database from "./database.js";
import { ObjectId } from "mongodb";

const UPLOADS_FOLDER = "./uploads";
const DATA_FOLDER = "./data"; //default data folder

let dataFileZones = "templateZonesMHW.json"; // zones file
let dataFileMonsters = "templateMonstersMHW.json"; //monsters file

//parse the json data
async function parseJsonFile(jsonFilePath) {
  let dataString = await fs.readFile(DATA_FOLDER + "/" + jsonFilePath, "utf8");

  return JSON.parse(dataString);
}

//get the data from the jsons
let zones = await parseJsonFile(dataFileZones);
let monsters = await parseJsonFile(dataFileMonsters);

//delete the data from the database every time the app reloads
await database.deleteZones(database.zones);

//create the zones and add for every monster the zone to it's correspondent zone (checking the name)
for (let zone of zones) {
  zone.monsters = [];
  zone._id = new ObjectId();

  for (let monster of monsters) {
    if (zone.name.toLowerCase() === monster.habitat.toLowerCase()) {
      monster._id = new ObjectId();

      zone.monsters.push(monster);
    }
  }
}

await database.addZones(zones);

//Remove the uploads folder and reupload the default data
await fs.rm(UPLOADS_FOLDER, { recursive: true, force: true });
await fs.mkdir(UPLOADS_FOLDER);
await fs.cp(DATA_FOLDER + "/images", UPLOADS_FOLDER, { recursive: true });

//pray if this logs
console.log("Demo data loaded");
