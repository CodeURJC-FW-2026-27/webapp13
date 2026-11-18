import express from "express";
import multer from "multer";

import * as database from "./database.js";

const router = express.Router();
export default router;

const upload = multer({ dest: "uploads/" });

function makeChoices(choices, isChecked, idPrefix) {
  return choices.map(([value, label]) => ({
    value,
    label,
    id: `${idPrefix}${value}`,
    checked: isChecked(value),
  }));
}

function makeOptions(choices, currentValue) {
  return choices.map(([value, label]) => ({
    value,
    label,
    selected: value === currentValue,
  }));
}

//function to build a new Zone object from the form data (can use to update or create a new Zone)
function buildZone(req, newImage) {
  let name = req.body.formIndexName.toString();
  let difficulty = parseInt(req.body.formIndexDifficulty);

  let selectedRanks = req.body.formIndexRanks;
  let ranks = [0, 1, 2].map((rank) => selectedRanks?.includes(String(rank)));

  let image = newImage;
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

  return newZone;
}

async function verifyZoneValues(zone, oldName) {
  if (zone.name == "") return "El nombre es obligatorio!";
  if (zone.name[0] != zone.name[0].toUpperCase())
    return "La primera letra del nombre tiene que estar en mayuscula!";

  //Verify if the name is unique in the database
  let currentNames = await database.getZoneNames();
  console.log(currentNames);

  if (currentNames.includes(zone.name) && zone.name != oldName) {
    return "El nombre tiene que ser unico!";
  }

  if (!zone.difficulty || zone.difficulty < 1 || zone.difficulty > 5)
    return "La dificultad es obligatoria!";
  if (!zone.image) return "La imagen es obligatoria!";
  if (!zone.ranks.some(Boolean)) return "Las categorias son obligatorias!";
  if (zone.enviroment == "") return "El entorno es obligatorio!";
  if (zone.temperature < 0 || zone.temperature > 2)
    return "La temperatura es obligatoria";
  if (zone.description == "") return "La descripcion es obligatoria";

  return "";
}

function buildMonster(req, image) {
  const selectedRanks = [].concat(req.body.ranks ?? []); // string, array o undefined

  return {
    name: (req.body.name ?? "").trim(),
    difficulty: parseInt(req.body.difficulty),
    ranks: [0, 1, 2].map((r) => selectedRanks.includes(String(r))),
    image: image,
    species: req.body.species,
    elements: [req.body.element],
    effects: [req.body.effects],
    weaknesses: [req.body.weakness],
    resistances: [req.body.resistances],
    habitat: req.body.habitat,
    minSize: parseFloat(req.body.minSize), // antes se guardaban como string
    maxSize: parseFloat(req.body.maxSize),
    information: (req.body.information ?? "").trim(),
  };
}

async function verifyMonsterValues(monster, zoneId, oldName = null) {
  if (!monster.name) return "El nombre es obligatorio!";
  if (monster.name[0] != monster.name[0].toUpperCase())
    return "La primera letra del nombre tiene que estar en mayuscula!";

  const monsterNames = await database.getMonsterNames(zoneId);
  if (monsterNames.includes(monster.name) && monster.name !== oldName)
    return "El nombre tiene que ser unico!";

  if (!monster.difficulty || monster.difficulty < 1 || monster.difficulty > 5)
    return "La dificultad es obligatoria!";
  if (!monster.ranks.some(Boolean)) return "Elige al menos una categoria!";
  if (!monster.image) return "La imagen es obligatoria!";
  if (!monster.species) return "La especie es obligatoria!";
  if (!monster.elements[0]) return "El elemento es obligatorio!";
  if (!monster.effects[0]) return "El efecto es obligatorio!";
  if (!monster.weaknesses[0]) return "La debilidad es obligatoria!";
  if (!monster.resistances[0]) return "La resistencia es obligatoria!";
  if (!monster.habitat) return "El hábitat es obligatorio!";
  if (Number.isNaN(monster.minSize) || Number.isNaN(monster.maxSize))
    return "El tamaño minimo y maximo son obligatorios!";
  if (monster.minSize > monster.maxSize)
    return "El tamaño minimo no puede ser mayor que el maximo!";
  if (!monster.information) return "La informacion es obligatoria!";
  return "";
}

function renderZoneForm(res, zone = null) {
  const isEdit = zone !== null;

  res.render("zoneForm.html", {
    headerTitle: isEdit
      ? "Actualizar Zona"
      : "Formulario para añadir Zonas de caza",

    // Lo que cambia entre crear y editar
    isEdit,
    zone, // en creacion es null: {{zone.name}} se pinta vacio
    formAction: isEdit ? `/updateZone?id=${zone._id}` : "/newZone",
    submitLabel: isEdit ? "Actualizar" : "Guardar",
    cancelLink: isEdit ? `/details?id=${zone._id}` : "/",
    imageRequired: !isEdit,

    // Opciones ya con "checked" calculado (adios isDiff1..5 / isTemp0..2)
    difficultyOptions: makeChoices(
      [
        [1, "⭐"],
        [2, "⭐⭐"],
        [3, "⭐⭐⭐"],
        [4, "⭐⭐⭐⭐"],
        [5, "⭐⭐⭐⭐⭐"],
      ],
      (v) => zone?.difficulty === v,
      "formIndexDifficultyButton",
    ),

    rankOptions: makeChoices(
      [
        [0, "Low Rank"],
        [1, "High Rank"],
        [2, "Master Rank"],
      ],
      (v) => zone?.ranks?.[v] === true,
      "formIndexRank",
    ),

    temperatureOptions: makeChoices(
      [
        [0, "Frostbite"],
        [1, "Temperate climate"],
        [2, "Scorching"],
      ],
      (v) => zone?.temperature === v,
      "formIndexTemperature",
    ),
  });
}

function renderMonsterForm(res, zone, monster = null) {
  const isEdit = monster !== null;

  res.render("monsterForm.html", {
    headerTitle: isEdit ? "Editar monstruo" : "Añadir monstruo",
    zone,
    monster,
    isEdit,

    formAction: isEdit
      ? `/updateMonster?zoneId=${zone._id}&monsterId=${monster._id}`
      : `/newMonster?id=${zone._id}`,

    submitLabel: isEdit ? "Actualizar" : "Crear",
    cancelLink: `/details?id=${zone._id}`,
    imageRequired: !isEdit,

    difficultyOptions: makeChoices(
      [
        [1, "⭐"],
        [2, "⭐⭐"],
        [3, "⭐⭐⭐"],
        [4, "⭐⭐⭐⭐"],
        [5, "⭐⭐⭐⭐⭐"],
      ],
      (value) => monster?.difficulty === value,
      "monsterDifficulty",
    ),

    rankOptions: makeChoices(
      [
        [0, "Low Rank"],
        [1, "High Rank"],
        [2, "Master Rank"],
      ],
      (value) => monster?.ranks?.[value] === true,
      "monsterRank",
    ),

    speciesOptions: makeOptions(
      [
        ["Bird Wyvern", "Bird-Wyvern"],
        ["Brute Wyvern", "Brute-Wyvern"],
        ["Fanged Beast", "Fanged-Beast"],
        ["Fanged", "Fanged"],
        ["Wyvern", "Wyvern"],
        ["Flying Wyvern", "Flying-Wyvern"],
        ["Piscine Wyvern", "Piscine-Wyvern"],
        ["Elder Dragon", "Elder Dragon"],
      ],
      monster?.species,
    ),

    elementOptions: makeOptions(
      [
        ["Fire", "Fire"],
        ["Water", "Water"],
        ["Thunder", "Thunder"],
        ["Ice", "Ice"],
        ["Dragon", "Dragon"],
        ["None", "None"],
      ],
      monster?.elements?.[0],
    ),

    effectOptions: makeOptions(
      [
        ["Poison", "Poison"],
        ["Stun", "Stun"],
        ["Paralysis", "Paralysis"],
        ["Sleep", "Sleep"],
        ["Blastblight", "Blastblight"],
        ["Bleeding", "Bleeding"],
        ["Waterblight", "Waterblight"],
        ["Fireblight", "Fireblight"],
        ["Thunderblight", "Thunderblight"],
        ["Iceblight", "Iceblight"],
        ["None", "None"],
      ],
      monster?.effects?.[0],
    ),

    weaknessOptions: makeOptions(
      [
        ["Fire", "Fire"],
        ["Water", "Water"],
        ["Thunder", "Thunder"],
        ["Ice", "Ice"],
        ["Dragon", "Dragon"],
        ["None", "None"],
      ],
      monster?.weaknesses?.[0],
    ),

    resistanceOptions: makeOptions(
      [
        ["Fire", "Fire"],
        ["Water", "Water"],
        ["Thunder", "Thunder"],
        ["Ice", "Ice"],
        ["Dragon", "Dragon"],
        ["None", "None"],
      ],
      monster?.resistances?.[0],
    ),
  });
}

// / (root)
router.get("/", async (req, res) => {
  //number of Zones shown per page
  const pageSize = 6;
  //get the total number of Zones
  const totalZones = await database.getZonesCount();
  //numbre of pages in total
  const totalPages = Math.ceil(totalZones / pageSize);

  let currentPage = Number.parseInt(req.query.page, 10) || 1;

  // Keep the page number within the valid range.
  currentPage = Math.max(1, Math.min(currentPage, totalPages || 1));

  let zones = await database.getZonesPage(currentPage, pageSize);

  // Render the index.html template with the zones and pagination information
  res.render("index.html", {
    headerTitle: "Bestiario Monster Hunter",
    zones,
    pageUrl: "/?page=",
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

// /image
router.get("/image", (req, res) => {
  let filename = req.query.filename;
  // If filename has \ or / then path traversal attack is detected
  if (/[\\/]/.test(filename)) {
    return res.status(400);
  }

  res.download("uploads/" + filename);
});

// /details
router.get("/details", async (req, res) => {
  let id = req.query.id;

  let zone = await database.getZone(id);

  if (zone === null) {
    // if the zone doesn't exist
    res.render("generalReturn.html", {
      headerTitle: "Error",
      message: `La zona con el id ${id} no existe`,
      destinationLink: "/",
      destination: "Home",
    });
  } else {
    // if the zone exists

    res.render("details.html", {
      id: id,
      headerTitle: zone.name,
      zone: zone,
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

// /form_index  - create new zone
router.get("/form_index", (req, res) => {
  renderZoneForm(res);
});

// /updateZoneForm - edit existing zone
router.get("/updateZoneForm", async (req, res) => {
  const zone = await database.getZone(req.query.id);

  if (zone === null) {
    return res.render("generalReturn.html", {
      headerTitle: "Error",
      message: `La zona con el id ${req.query.id} no existe`,
      destinationLink: "/",
      destination: "Home",
    });
  }

  renderZoneForm(res, zone);
});

// /newZone - saves new zone to database
router.post("/newZone", upload.single("formIndexImage"), async (req, res) => {
  let newZone = buildZone(req, req?.file?.filename);

  let errorMessage = await verifyZoneValues(newZone);

  if (errorMessage === "") {
    await database.addZone(newZone);

    res.render("generalReturn.html", {
      headerTitle: "Todo correcto!",
      message: `La zona ${newZone.name} Se ha añadido correctamente!`,
      destinationLink: "/",
      destination: "Home",
    });
  } else {
    res.render("generalReturn.html", {
      headerTitle: "Error",
      message: `Error : ${errorMessage}`,
      destinationLink: "/form_index",
      destination: "New zone form",
    });
  }
});

// /deleteZone
router.get("/deleteZone", async (req, res) => {
  let zoneId = req.query.id;

  let zone = await database.getZone(zoneId);

  if (zone === null) {
    res.render("generalReturn.html", {
      headerTitle: "Error",
      message: `La zona con el id ${zoneId} no existe`,
      destinationLink: "/",
      destination: "Home",
    });
  } else {
    await database.deleteZone(zoneId);
    res.render("generalReturn.html", {
      headerTitle: "Todo correcto!",
      message: `La zona con el id ${zoneId} ha sido eliminada correctamente!`,
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
  let arrayMonsters = await database.getZone(zoneId);

  if (arrayMonsters === null) {
    res.render("generalReturn.html", {
      headerTitle: "Error",
      message: `La zona con el id ${zoneId} no existe`,
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
        headerTitle: "Error",
        message: `El monstruo con el id ${monsterId} no existe`,
        destinationLink: "/",
        destination: "Home",
      });
    } else {
      let monsterName = arrayMonsters[i].name;
      arrayMonsters.splice(i, 1);

      //update the array of Monsters in DB
      await database.deleteMonster(zoneId, arrayMonsters);

      res.render("generalReturn.html", {
        headerTitle: "Todo correcto!",
        message: `El monstruo con el id ${monsterId} y nombre ${monsterName} ha sido eliminado correctamente!`,
        destinationLink: `./details?id=${zoneId}`,
        destination: "Volver a la Zona",
      });
    }
  }
});

// Call to render the Monsters Form 1st step to the creation or edit of Monsters
router.get("/formMonster", async (req, res) => {
  const zone = await database.getZone(req.query.zoneId);

  if (!zone) {
    return res.status(404).send("Zone not found");
  }
  if (!req.query.monsterId) {
    return renderMonsterForm(res, zone);
  }

  const monster = zone.monsters.find(
    (item) => item._id.toString() === req.query.monsterId,
  );

  if (!monster) {
    return res.status(404).send("Monster not found");
  }

  renderMonsterForm(res, zone, monster);
});
// /  
router.post(
  "/newMonster",
  upload.single("formDetailsMonsterImage"),
  async (req, res) => {
    let id = req.query.id;
    let monster = buildMonster(req, req.file.filename);
    //monster.habitat=req.query.zoneName
    let errorMessage = await verifyMonsterValues(monster, id);

    if (errorMessage === "") {
      await database.addMonster(id, monster);

      res.render("generalReturn.html", {
        headerTitle: "Todo correcto!",
        message: `El monstruo con el nombre ${monster.name} ha sido añadido correctamente!`,
        destinationLink: `./details?id=${id}`,
        destination: "Volver a la Zona",
      });
    } else {
      res.render("generalReturn.html", {
        headerTitle: "Error",
        message: `Error : ${errorMessage}`,
        destinationLink: `./details?id=${id}`,
        destination: "Volver a la Zona",
      });
    }
  },
);

// /formMonster
router.get("/formMonster", async (req, res) => {
  const zone = await database.getZone(req.query.zoneId);

  if (!zone) {
    return res.status(404).send("Zone not found");
  }

  const monster = zone.monsters.find(
    (item) => item._id.toString() === req.query.monsterId,
  );

  if (!monster) {
    return res.status(404).send("Monster not found");
  }

  renderMonsterForm(res, zone, monster);
});
// /updateMonster
router.post(
  "/updateMonster",
  upload.single("formDetailsMonsterImage"),
  async (req, res) => {
    let zoneId = req.query.zoneId;
    let monsterId = req.query.monsterId;
    let oldMonster = await database.getMonster(zoneId, monsterId);

    let oldImage = oldMonster.image;

    if (req?.file?.filename) oldImage = req?.file?.filename;

    let newMonster = buildMonster(req, oldImage);

    let errorMessage = await verifyMonsterValues(newMonster, zoneId);

    if (errorMessage === "") {
      await database.updateMonster(zoneId, monsterId, newMonster);

      res.render("generalReturn.html", {
        headerTitle: "Todo correcto!",
        message: `El monstruo de id ${monsterId} fue modificado correctamente!`,
        destinationLink: "/details?id=" + req.query.zoneId,
        destination: "details",
      });
    } else {
      res.render("generalReturn.html", {
        headerTitle: "Error",
        message: `Error : ${errorMessage}`,
        destinationLink: "/details?id=" + req.query.zoneId,
        destination: "details",
      });
    }
  },
);

// /updateZoneForm
router.get("/updateZoneForm", async (req, res) => {
  let monsterId = req.query.id;
  let zone = await database.getZone(monsterId);

  if (zone === null) {
    res.render("generalReturn.html", {
      headerTitle: "Error",
      message: `La zona con el id ${monsterId} no existe`,
      destinationLink: "/",
      destination: "Home",
    });
  } else {
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
  }
});

// /updateZone
router.post(
  "/updateZone",
  upload.single("formIndexImage"),
  async (req, res) => {
    let zoneId = req.query.id;
    let zone = await database.getZone(zoneId);

    if (zone === null) {
      res.render("generalReturn.html", {
        headerTitle: "Error",
        message: `La zona con el id ${zoneId} no existe`,
        destinationLink: "/",
        destination: "Home",
      });
    } else {
      let oldImage = zone.image;

      if (req?.file?.filename) oldImage = req?.file?.filename;

      let newZone = buildZone(req, oldImage);

      let errorMessage = await verifyZoneValues(newZone, zone.name);

      if (errorMessage === "") {
        newZone.monsters = [];

        zone.monsters.forEach((monster) => {
          monster.habitat = newZone.name;
          newZone.monsters.push(monster);
        });

        await database.updateZone(zoneId, newZone);

        res.render("generalReturn.html", {
          headerTitle: "Todo correcto!",
          message: `La zona de id ${zoneId} fue modificada correctamente!`,
          destinationLink: "/details?id=" + zoneId,
          destination: "details",
        });
      } else {
        res.render("generalReturn.html", {
          headerTitle: "Error",
          message: `Error : ${errorMessage}`,
          destinationLink: "/form_index",
          destination: "New zone form",
        });
      }
    }
  },
);

// /search
router.get("/search", async (req, res) => {
  const pageSize = 6;
  const searchTerm = (req.query.zoneName ?? "").trim();

  const totalZones = searchTerm
    ? await database.countZonesByName(searchTerm)
    : 0;

  const totalPages = Math.ceil(totalZones / pageSize);

  let currentPage = Number.parseInt(req.query.page, 10) || 1;
  currentPage = Math.max(1, Math.min(currentPage, totalPages || 1));

  const zones = searchTerm
    ? await database.searchZonesByName(searchTerm, currentPage, pageSize)
    : [];

  res.render("index.html", {
    headerTitle: "Bestiario Monster Hunter",
    zones,
    searchTerm,
    pageUrl:`/search?zoneName=${encodeURIComponent(searchTerm)}&page=`,
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


router.get("/showDifficulty",async (req,res) => {
let difficulty= Number(req.query.difficulty);
console.log(difficulty);
console.log(typeof difficulty);
let zones = await database.findDifficulltyZone(difficulty);
console.log(zones);

res.render("index.html", {
    headerTitle: "Bestiario Monster Hunter",
    zones,
    /*
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
  */
  });


})
