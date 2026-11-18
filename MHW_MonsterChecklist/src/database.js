import express from "express";
import { MongoClient, ObjectId } from "mongodb";

const router = express.Router();
export default router;

const client = new MongoClient("mongodb://localhost:27017"); //Local conexion with MongoDB

const db = client.db("MonsterHunter"); //Data base name

export const zones = db.collection("Zones"); //Document with the Zones (named "zones")
await zones.createIndex({ name: "text" }); //Creates an index (to get the names faster)
export const UPLOADS_FOLDER = "./uploads"; //Where to save the uploaded data (photos)

export async function addZone(newZone) {
  return await zones.insertOne(newZone);
}

export async function addZones(newZones) {
  return await zones.insertMany(newZones);
}

export async function deleteZone(zoneId) {
  return await zones.findOneAndDelete({ _id: new ObjectId(zoneId) });
}

export async function deleteZones() {
  // delete all the saved zones
  return await zones.deleteMany();
}

export async function getZone(zoneId) {
  return await zones.findOne({ _id: new ObjectId(zoneId) });
}

export async function getZones() {
  return await zones.find().toArray();
}

export async function updateZone(zoneId, updateZone) {
  return await zones.updateOne(
    { _id: new ObjectId(zoneId) },
    {
      $set: {
        name: updateZone.name,
        difficulty: updateZone.difficulty,
        ranks: updateZone.ranks,
        image: updateZone.image,
        enviroment: updateZone.enviroment,
        temperature: updateZone.temperature,
        description: updateZone.description,
        monsters: updateZone.monsters,
      },
    },
  );
}

export async function findRankZone(rank) {
  return await zones.find({ [`ranks.${rank}`]: true }).toArray();
}

export async function findTemperatureZone(temperature) {
  return await zones.find({ temperature: temperature }).toArray();
}

export async function addMonster(zoneId, monster) {
  monster._id = new ObjectId();
  return await zones.updateOne(
    { _id: new ObjectId(zoneId) },
    { $push: { monsters: monster } },
  );
}

export async function deleteMonster(zoneId, updateMonsters) {
  return await zones.updateOne(
    { _id: new ObjectId(zoneId) },
    { $set: { monsters: updateMonsters } },
  );
}

export async function getMonster(zoneId, monsterId) {
  let zone = await zones.findOne({ _id: new ObjectId(zoneId) });

  let monster = zone.monsters.find((m) => m._id.toString() === monsterId);
  //arrrow function to verify if i found the monster using the id

  return monster;
}

export async function updateMonster(zoneId, monsterId, newMonster) {
  newMonster._id = new ObjectId(monsterId);
  return await zones.updateOne(
    { _id: new ObjectId(zoneId), "monsters._id": new ObjectId(monsterId) },
    { $set: { "monsters.$": newMonster } },
  );
}

export async function getZonesPage(page, pageSize) {
  return await zones
    .find()
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .toArray();
} // get the zones per page

export async function getZonesCount() {
  return await zones.countDocuments();
} // get how many zones they are

export async function searchZonesByName(nameInput, page, pageSize) {
  const filter = { $text: { $search: nameInput } };

  return await zones
    .find(filter)
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .toArray();
}

export async function countZonesByName(nameInput) {
  const filter = { $text: { $search: nameInput } };
  return await zones.countDocuments(filter);
}

export async function getZonesWithFilter(filter) {
  return await zones.find(filter).toArray();
}

export async function getZoneNames() {
  //from MongoDB documentation - https://www.mongodb.com/es/docs/drivers/node/current/crud/query/project/#single-field
  // return only* the name field
  const projectFields = { _id: 0, name: 1 };
  const cursor = zones.find().project(projectFields);
  let names = [];

  for await (const doc of cursor) {
    names.push(doc.name);
  }

  return names;
}

export async function getMonsterNames(zoneId) {
  const zone = await getZone(zoneId);
  let monsterNames = [];

  if (zone.monsters) {
    for (let monster of zone.monsters) monsterNames.push(monster.name);

    return monsterNames;
  }

  return;
}
