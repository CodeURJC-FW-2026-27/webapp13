import express from "express";
import multer from "multer";
import fs from "node:fs/promises";

import * as database from "./database.js";

const router = express.Router();
export default router;

const upload = multer({ dest: "uploads/" });

// / (root)
router.get("/", async (req, res) => {
  //number of Zones shown per page
  const pageSize = 6;
  //get the total number of Zones
  const totalZones = await database.getZonesCount();
  //numbre of pages in total
  const totalPages = Math.ceil(totalZones / pageSize);

  let currentPage = Number.parseInt(req.query.page, 10) || 1;

  // Mantén el número de página dentro del rango válido.
  currentPage = Math.max(1, Math.min(currentPage, totalPages || 1));

  const zones = await database.getZonesPage(currentPage, pageSize);

  res.render("index.html", {
    headerTitle: "Bestiario Monster Hunter",
    zones,
    pages: Array.from({ length: totalPages }, (_, i) => ({
      number: i + 1,
      isCurrent: i + 1 === currentPage,
    })),
    currentPage,
    hasPages: totalPages > 1,
    previousPage: currentPage - 1,
    nextPage: currentPage + 1,
    hasPrevious: currentPage > 1,
    hasNext: currentPage < totalPages,
  });
});

// /details
router.get("/details", async (req, res) => {
  let id = req.query.id;

  let zone = await database.getPost(id);
  let zones = await database.getPosts();

  let zonesNames = [];
  for (let i = 0; i < zones.length; i++) {
    if (zones[i].name) {
      zonesNames.push(zones[i].name.toString());
    }
  }

  if (zone === null) {
    // if the zone doesn't exist
    console.log(`The zone with the id ${id} doesn't exist`);
    res.render("generalReturn.html", {
      message: `The zone with the id ${id} doesn't exist`,
      destinationLink: "/",
      destination: "Home",
    });
  } else {
    // if the zone exists

    res.render("details.html", {
      id: id,
      headerTitle: zone.name,
      zone: zone,
      zones_name: zonesNames,
      monsters: zone.monsters,

      getDifficulty: function () {
        return "⭐".repeat(this.difficulty);
      },
      getRanks: function () {
        let s = "";
        if (this.ranks[0]) {
          s += "LR ";
        }
        if (this.ranks[1]) {
          s += "HR ";
        }
        if (this.ranks[2]) {
          s += "MR";
        }
        if (s == "") {
          s = "None";
        }

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
          default:
            s = "None";
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

// /image
router.get("/image", (req, res) => {
  let filename = req.query.filename;
  // If filename has \ or / then path traversal attack is detected
  if (/[\\/]/.test(filename)) {
    return res.status(400);
  }

  res.download("uploads/" + filename);
});

// /form_index
router.get("/form_index", (req, res) => {
  res.render("formIndex.html", {
    headerTitle: "Formulario para añadir Zonas de caza",
  });
});

// /generalReturnIndex (for the index form to add zones)
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

    // comprobacion de valores

    let newZone = {
      name: name,
      difficulty: difficulty,
      ranks: ranks,
      image: image,
      enviroment: enviroment,
      temperature: temperature,
      description: description,
    };

    await database.addZone(newZone);

    if (req.file) {
    } else {
      res.render("generalReturn.html", {
        message: `File not found!`,
        destinationLink: "/",
        destination: "Home",
      });
    }

    res.render("generalReturn.html", {
      message: `The zone ${name} has been added successfully`,
      destinationLink: "/",
      destination: "Home",
    });
  },
);

// /deleteZone
router.get("/deleteZone", async (req, res) => {
  let zoneId = req.query.id;

  let zone = await database.getPost(zoneId);

  if (zone === null) {
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

// /deleteMonster
router.get("/deleteMonster", async (req, res) => {
  //get the id of the Monster
  let zoneId = req.query.zoneId;
  let monsterId = req.query.monsterId;

  //get the Monsters array
  let arrayMonsters = await database.getPost(zoneId);

  if (arrayMonsters === null) {
    res.render("generalReturn.html", {
      message: `The zone with the id ${zoneId} doesn't exist`,
      destinationLink: "/",
      destination: "Home",
    });
  } else {
    arrayMonsters = arrayMonsters.monsters;

    //look for monster with same id and delete them from the array with splice()
    let i = 0;
    while (arrayMonsters[i] && arrayMonsters[i]._id != monsterId) {
      i++;
    }

    if (i >= arrayMonsters.length) {
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
});

// /newCreature
router.post(
  "/newCreature",
  upload.single("formDetailsMonsterImage"),
  async (req, res) => {
    function buildMonster(req) {
      return {
        name: req.body.name,
        dificulty: req.body.formIndexDificultadButton,
        ranks: [
          req.body.formIndexCategorias1,
          req.body.formIndexCategorias2,
          req.body.formIndexCategorias3,
        ],
        image: req.file.filename,
        species: req.body.species,
        elements: [req.body.element],
        effects: [req.body.effects],
        weaknesses: [req.body.weakness],
        resistances: [req.body.resistances],
        habitat: req.body.habitat,
        minSize: req.body.minSize,
        maxSize: req.body.maxSize,
        information: req.body.information,
      };
    }

    let id = req.query.id;
    let monster = buildMonster(req);

    database.addMonster(id, monster);

    res.render("generalReturn.html", {
      message: `The monster with the id ${monster._id} and name ${monster.name} has been added successfully!`,
      destinationLink: `./details?id=${id}`,
      destination: "Back to the Zone",
    });
  },
);

// /editCreature
router.get("/editCreature", async (req, res) => {
  let zoneId = req.query.zoneId;
  let zone = await database.getPost(req.query.zoneId);

  if (zone === null) {
    res.render("generalReturn.html", {
      message: `The zone with the id ${zoneId} doesn't exist`,
      destinationLink: "/",
      destination: "Home",
    });
  } else {
    let monster = zone.monsters.find(
      (m) => m._id.toString() === req.query.monsterId,
    );

    if (monster === null) {
      res.render("generalReturn.html", {
        message: `The monster with the id ${monsterId} doesn't exist`,
        destinationLink: "/",
        destination: "Home",
      });
    } else {
      res.render("editCreature.html", {
        zone,
        monster,
      });
    }
  }
});

// /updateCreature
router.post(
  "/updateCreature",
  upload.single("formDetailsMonsterImage"),
  async (req, res) => {
    let id = req.query.zoneId;
    let monsterId = req.query.monsterId;
    let newMonster = buildMonster(req);
    await database.updateMonster(id, monsterId, newMonster);

    res.render("/generalReturn.html", {
      message: `El monstruo de id ${monsterId} fue modificado con sucesso `,
      destinationLink: "/details?id=" + req.query.zoneId,
      destination: "details",
    });
  },
);

// /updateZoneForm
router.get("/updateZoneForm", async (req, res) => {
  let monsterId = req.query.id;
  let zone = await database.getPost(monsterId);

  if (zone === null) {
    res.render("generalReturn.html", {
      message: `The monster with the id ${monsterId} doesn't exist`,
      destinationLink: "/",
      destination: "Home",
    });
  }
  //Check which difficulty radio button is True
  zone.isDiff1 = zone.difficulty === 1;
  zone.isDiff2 = zone.difficulty === 2;
  zone.isDiff3 = zone.difficulty === 3;
  zone.isDiff4 = zone.difficulty === 4;
  zone.isDiff5 = zone.difficulty === 5;

  //Check the value of the Temp if X value is true then its Checkbox in form will be checked
  zone.isTemp0 = zone.temperature === 0;
  zone.isTemp1 = zone.temperature === 1;
  zone.isTemp2 = zone.temperature === 2;

  //Redirect user to updatePageZone
  res.render("updateZone.html", {
    zone: zone,
    headerTitle: "Actualizar Zona",
  });
});

// /updateZone
router.post(
  "/updateZone",
  upload.single("formIndexImage"),
  async (req, res) => {
    let zoneId = req.query.id;
    let zone = await database.getPost(zoneId);

    if (zone === null) {
      res.render("generalReturn.html", {
        message: `The zone with the id ${zoneId} doesn't exist`,
        destinationLink: "/",
        destination: "Home",
      });
    } else {
      //Retrive the data from updateForm
      let newName = req.body.formIndexName.toString();
      let newDifficulty = parseInt(req.body.formIndexDifficulty);
      //retrive the ranks from the multicheckboxes
      let selectedRanks = req.body.formIndexRanks;
      let newRanks = [0, 1, 2].map((rank) =>
        selectedRanks.includes(String(rank)),
      );

      let newEnviroment = req.body.formIndexEnviroment.toString();
      let newTemperature = parseInt(req.body.formIndexTemperature);
      let newDescription = req.body.formIndexDescription.toString();

      //Checks which fields have been changed with ternary ops and sets them on the updatedZone.
      let updatedZone = {
        name: zone.name !== newName ? newName : zone.name,
        difficulty:
          zone.difficulty !== newDifficulty ? newDifficulty : zone.difficulty,
        ranks: zone.ranks !== newRanks ? newRanks : zone.ranks,
        image: req.file ? req.file.filename : zone.image,
        enviroment:
          zone.enviroment !== newEnviroment ? newEnviroment : zone.enviroment,
        temperature:
          zone.temperature !== newTemperature
            ? newTemperature
            : zone.temperature,
        description:
          zone.description !== newDescription
            ? newDescription
            : zone.description,
      };

      //set the changes in DB
      await database.updateZonePost(zoneId, updatedZone);
      res.render("generalReturn.html", {
        message: `La zona de id ${zoneId} y nombre ${zone.name} fue modificada con sucesso `,
        destinationLink: "/details?id=" + zoneId,
        destination: zone.name,
      });
    }
  },
);
