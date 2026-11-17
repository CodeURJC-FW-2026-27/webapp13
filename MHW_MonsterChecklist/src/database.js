import express from "express";
import { MongoClient, ObjectId } from "mongodb";

const router = express.Router();
export default router;

const client = new MongoClient("mongodb://localhost:27017"); //Conexion local con mongoDB

const db = client.db("MonsterHunter"); //Base de datos

export const zones = db.collection("Zones"); //Documento con los archivos JSON
await zones.createIndex({ name: 'text' }); //Creates an index
export const UPLOADS_FOLDER = "./uploads"; //donde se guardan los archivos subidos por los usuarios

//Funciones para juguetear con cada coleccion de la base de datos (usando las colecciones exportadas arriba)
export async function addZone(post) {
  return await zones.insertOne(post);
}

export async function addZones(post) {
  return await zones.insertMany(post);
}

export async function deleteZone(id) {
  return await zones.findOneAndDelete({ _id: new ObjectId(id) });
}

export async function deleteZones() {
  return await zones.deleteMany();
}

export async function getZone(id) {
  return await zones.findOne({ _id: new ObjectId(id) });
}

export async function getZones() {
  return await zones.find().toArray();
}




export async function addMonster(id, monster) {
  monster._id = new ObjectId(id);
  return await zones.updateOne(
    { _id: new ObjectId(id) },
    { $push: { monsters: monster } },
  );
}

export async function deleteMonster(id, updateMonsters) {
  return await zones.updateOne(
    { _id: new ObjectId(id) },
    { $set: { monsters: updateMonsters } },
  );
}

export async function getMonster (zoneId, monsterId)
{
  let zone = await zones.findOne({ _id: new ObjectId(zoneId) });

  let monster = zone.monsters.find((m) => m._id.toString() === monsterId);

  return monster;
}



export async function updateMonster(id, monsterId, newMonster) {
  newMonster._id = new ObjectId(id);
  return await zones.updateOne(
    { _id: new ObjectId(id), "monsters._id": new ObjectId(monsterId)},
    { $set: { "monsters.$":newMonster } },
  );
}



export async function updateZone(id, updateZone) {
  return await zones.updateOne(
    { _id: new ObjectId(id) },
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

export async function getZonesPage(page, pageSize) {
  return await zones
    .find()
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .toArray();
}
export async function getZonesCount() {
  return await zones.countDocuments();
}

export async function searchZonesByName(nameInput){
  return await zones.find({ $text: { $search: nameInput} })
                    .toArray();
}