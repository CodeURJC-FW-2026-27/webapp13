import express from "express";
import multer from "multer";
import fs from "node:fs/promises";

import * as database from "./database.js";
import { ObjectId } from "mongodb";

const router = express.Router();
export default router;

router.get("/", async (req, res) => {
  let zones = await database.getPosts(database.zones);

  res.render("index.html", {
    headerTitle: "Bestiario Monster Hunter",
    zones: zones,
  });
});

router.get("/details", async (req, res) => {
  let id = req.query.id;

  let zone = await database.getPost(id);

  if (zone === null) {
    console.log(`The zone with the id ${id} doesn't exist`);
    res.sendStatus(404);
  } else {
    res.render("details.html", {
      headerTitle: zone.name,
      zone: zone,
      monsters: zone.monsters,
      getDifficulty: function () {
        return "⭐".repeat(this.difficulty);
      },
      getRanks: function () {
        let s = "" + this.ranks[0] ? "LR " : "";
        s += this.ranks[1] ? "HR " : "";
        s += this.ranks[2] ? "MR" : "";

        return s;
      },
      getTemperature: function () {
        let s = "";
        switch (this.temperature) {
          case 0:
            s = "Frostbite";
            break;
          case 1:
            s = "Temperate climate";
            break;
          case 2:
            s = "Scorching";
            break;
        }

        return s;
      },
      getMinSize: function () {
        if (this.minSize) return this.minSize.toString();
        else return "N/A";
      },
      getMaxSize: function () {
        if (this.maxSize) return this.maxSize.toString();
        else return "N/A";
      },
    });
  }
});

router.get("/image", (req, res) => {
  let filename = req.query.filename;
  // If filename has \ or / then path traversal attack is detected
  if (/[\\/]/.test(filename)) {
    return res.status(400);
  }

  res.download("uploads/" + filename);
});

router.get("/form_index", (req, res) => {
  res.render("formIndex.html", {
    headerTitle: "Formulario para añadir <i>Zonas de caza</i>",
  });
});

const upload = multer({ dest: "uploads/" });

router.post(
  "/formManagerIndex",
  upload.single("formIndexImage"),
  async (req, res) => {
    let name = req.body.formIndexName.toString();

    let difficulty = parseInt(req.body.formIndexDifficulty);

    let ranks = req.body.formIndexRanks;

    let image = req.file.filename;

    let enviroment = req.body.formIndexEnviroment.toString();

    let temperature = parseInt(req.body.formIndexTemperature);

    let description = req.body.formIndexDescription.toString();

    let newZone = {
      name: name,
      difficulty: difficulty,
      ranks: ranks,
      image: image,
      enviroment: enviroment,
      temperature: temperature,
      description: description,
    };

    console.log(newZone);

    await database.addZone(newZone);

    if (req.file) {
      //res.render("uploaded_image", { filename: req.file.filename });
    } else {
      res.send("File not found!");
    }

    res.render("formManager", {
      message: `The zone ${name} has been added successfully`,
      destinationLink: "/",
      destination: "Home",
    });
  },
);

router.get("/deletePost", async (req, res) => {
  let id = req.query.id;

  let zone = await database.getPost(id);

  console.log(zone);

  if (zone === null) {
    console.log(`The zone with the id ${id} doesn't exist`);
    res.sendStatus(404);
  } else {
    await database.deletePost(id);
    res.render("formManager.html", {
      message: `The zone with the id ${id} has been deleted successfully`,
      destinationLink: "/",
      destination: "Home",
    });
  }
});
