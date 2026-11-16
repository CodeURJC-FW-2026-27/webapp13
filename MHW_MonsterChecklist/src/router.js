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
    res.render("generalReturn.html", {
      message: `The zone with the id ${id} doesn't exist`,
      destinationLink: "/",
      destination: "Home",
    });
  } else {
    res.render("details.html", {
      id: id,
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
  "/generalReturnIndex",
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
      res.render("generalReturn.html", {
        message: `File not found!`,
        destinationLink: "/",
        destination: "Home",
      });
    }

    res.render("generalReturn", {
      message: `The zone ${name} has been added successfully`,
      destinationLink: "/",
      destination: "Home",
    });
  },
);

router.get("/deleteZone", async (req, res) => {
  let zoneId = req.query.id;

  let zone = await database.getPost(zoneId);

  if (zone === null) {
    console.log(`The zone with the id ${zoneId} doesn't exist`);
    res.render("generalReturn.html", {
      message: `The zone with the id ${zoneId} doesn't exist`,
      destinationLink: "/",
      destination: "Home",
    });
  } else {
    await database.deletePost(zoneId);
    res.render("generalReturn.html", {
      message: `The zone with the id ${zoneId} and the name ${zone.name} has been deleted successfully`,
      destinationLink: "/",
      destination: "Home",
    });
  }
});

//interact with DB -> async
router.get("/deleteMonster", async (req, res) => {
  //get the id of the Monster
  let zoneId = req.query.zoneId;
  let monsterId = req.query.monsterId;

  //get the Monsters array
  let arrayMonsters = await database.getPost(zoneId);

  if (arrayMonsters === null) {
    console.log(`The zone with the id ${zoneId} doesn't exist`);
    res.render("generalReturn.html", {
      message: `The zone with the id ${zoneId} doesn't exist`,
      destinationLink: "/",
      destination: "Home",
    });
  } else {
    arrayMonsters = arrayMonsters.monsters;

    //look for monster with same name and delete them from the array with splice()
    let i = 0;
    while (arrayMonsters[i] && arrayMonsters[i]._id != monsterId) {
      i++;
    }

    console.log(arrayMonsters.length);
    console.log(i);

    if (i >= arrayMonsters.length) {
      console.log(`The monster with the id ${monsterId} doesn't exist`);
      res.render("generalReturn.html", {
        message: `The monster with the id ${monsterId} doesn't exist`,
        destinationLink: "/",
        destination: "Home",
      });
    } else {
      let monsterName = arrayMonsters[i].name;
      arrayMonsters.splice(i, 1);

      //update the array of Monsters in DB
      await database.updatePost(zoneId, arrayMonsters);
      //send id of selected Zone for redirection

      res.render("generalReturn.html", {
        message: `The monster with the id ${monsterId} and name ${monsterName} has been deleted successfully!`,
        destinationLink: `./details?id=${zoneId}`,
        destination: "Back to the Zone",
      });
    }
  }
  //update the array of Monsters in DB
  await database.updatePost(id, arrayMonsters);
  //send id of selected Zone for redirection
  res.render("deletePage.html", {
    id_zone: id,
  });
});

router.post("/new_creature", async (req, res) => {
  let id = req.query.id;
  let zone = await database.getPost(id);
  let monster = {
    name: req.body.name,
    dificulty: req.body.formIndexDificultadButton,
    ranks: [
      req.body.formIndexCategorias1,
      req.body.formIndexCategorias2,
      req.body.formIndexCategorias3,
    ],
    image: "MHRise-Render_Kulu-Ya-Ku.jpg",
    species: req.body.species,
    elements: [req.body.elements],
    effects: [req.body.effects],
    weaknesses: [req.body.weaknesses],
    resistances: [req.body.resistances],
    habitat: req.body.habitat,
    minSize: req.body.minSize,
    maxSize: req.body.maxSize,
    information: req.body.information,
  };
  database.addMonster(id, monster);
  res.redirect(`details?id=${id}`);
});
