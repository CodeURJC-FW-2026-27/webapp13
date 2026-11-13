import fs from "node:fs/promises";
import * as database from "./database.js";

const UPLOADS_FOLDER = "./uploads";
const DATA_FOLDER = "./data"; //CARPETA DE DATOS PREDETERMINADOS

let dataFileZones = "templateZonesMHW.json"; //ARCHIVO PRIMARY
let dataFileMonsters = "templateMonstersMHW.json"; //ARCHIVO SECONDARY

//funcion para parsear datos de un archivo que esta en la carpeta data
async function parseJsonFile(jsonFilePath) {
  let dataString = await fs.readFile(DATA_FOLDER + "/" + jsonFilePath, "utf8");

  return JSON.parse(dataString);
}

//cargo los datos de los archivos Json
let zones = await parseJsonFile(dataFileZones);
let monsters = await parseJsonFile(dataFileMonsters);

//Borrar base de datos para meter los nuevos
await database.deletePosts(database.zones);

for (let zone of zones) {
  // Aqui metemos a cada zona los monstruos de cada zona
  zone.monsters = [];

  for (let monster of monsters) {
    if (zone.name.toLowerCase() === monster.habitat.toLowerCase()) {
      zone.monsters.push(monster);
    }
  }
}

await database.addZones(zones);

//console.log(zones);

//funciones para borrar la carpeta uploads, crearla y copiar los datos de la carpeta predeterminada a uploads
await fs.rm(UPLOADS_FOLDER, { recursive: true, force: true });
await fs.mkdir(UPLOADS_FOLDER);
await fs.cp(DATA_FOLDER + "/images", UPLOADS_FOLDER, { recursive: true });

//si todo sale bien sale esto
console.log("Demo data loaded");
