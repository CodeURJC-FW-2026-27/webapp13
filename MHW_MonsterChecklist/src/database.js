import express from "express";
import { MongoClient, ObjectId } from "mongodb";

const router = express.Router();
export default router;

const client = new MongoClient("mongodb://localhost:27017"); //Conexion local con mongoDB

const db = client.db("MonsterHunter"); //Base de datos

export const zones = db.collection("Zones"); //Documento con los archivos JSON

export const UPLOADS_FOLDER = "./uploads"; //donde se guardan los archivos subidos por los usuarios

//Funciones para juguetear con cada coleccion de la base de datos (usando las colecciones exportadas arriba)
export async function addZone(post) {
  return await zones.insertOne(post);
}

export async function addZones(post) {
  return await zones.insertMany(post);
}

export async function deletePost(id) {
  return await zones.findOneAndDelete({ _id: new ObjectId(id) });
}

export async function deletePosts() {
  return await zones.deleteMany();
}

export async function getPosts() {
  return await zones.find().toArray();
}

export async function getPost(id) {
  return await zones.findOne({ _id: new ObjectId(id) });
}
