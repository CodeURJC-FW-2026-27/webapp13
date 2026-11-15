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
      id: id,
      headerTitle: zone.name,
      zone: zone,
      monsters: zone.monsters,
      getDifficulty: function () {
        return "⭐".repeat(this.difficulty);
      },
      getRanks: function () {
        let s = "";
        if (this.ranks[0]){s+= "LR "};
        if (this.ranks[1]) {s+= "HR "};
        if(this.ranks[2])  {s+="MR"};

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
    headerTitle: "Formulario para añadir Zonas de caza",
  });
});

const upload = multer({ dest: "uploads/" });

router.post(
  "/formManagerIndex",
  upload.single("formIndexImage"),
  async (req, res) => {
    let name = req.body.formIndexName.toString();

    let difficulty = parseInt(req.body.formIndexDifficulty);

    let selectedRanks = req.body.formIndexRanks;
    let ranks=[0,1,2].map((rank)=> selectedRanks(String(rank)))
    
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

//interact with DB -> async
router.get("/deleteMonster", async (req,res)=>{
  //get the name of Monster and  zone id
  let id=req.query.id;
  let name=req.query.nameMonster;
  
  //select the Zone
  let zone = await database.getPost(id);
  //get the Monsters array
  let arrayMonsters=zone.monsters;
  
  //look for monster with same name and deleted from the array with splice()
  for(let i=0; i<arrayMonsters.length;i++){
    if(arrayMonsters[i].name===name){
      arrayMonsters.splice(i,1);
      break;
    }
  }
  //update the array of Monsters in DB
  await database.updatePost(id,arrayMonsters);
  //send id of selected Zone for redirection
    res.render("deletePage.html",{
      destinationLink:"/details?id="+id,
    });
  })
router.post("/new_creature", async (req, res) => {
  let id = req.query.id;
  let zone = await database.getPost(id);
  let monster = {
    name: req.body.name,
    dificulty: req.body.formIndexDificultadButton,
    ranks: [req.body.formIndexCategorias1, req.body.formIndexCategorias2, req.body.formIndexCategorias3],
    image: "MHRise-Render_Kulu-Ya-Ku.jpg",
    species: req.body.species,
    elements: [req.body.elements],
    effects: [req.body.effects],
    weaknesses: [req.body.weaknesses],
    resistances: [req.body.resistances],
    habitat: req.body.habitat,
    minSize: req.body.minSize,
    maxSize: req.body.maxSize,
    information: req.body.information
  }
  database.addMonster(id, monster);
  res.redirect(`details?id=${id}`)

})

router.get("/updatePostPage", async (req,res)=>{
  let id = req.query.id;
  let zone = await database.getPost(id);
 if (zone===null) {
    console.log(`The zone with the id ${id} doesn't exist`);
    res.sendStatus(404);
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
  res.render("updatePageZone.html", {
      zone: zone,      
      headerTitle:"Actualizar Zona"
    })
})

router.post("/updatePost",upload.single("formIndexImage"), async(req,res)=>{
    let id=req.query.id;
    let zone = await database.getPost(id);

    //Retrive the data from updateForm
    let newName = req.body.formIndexName.toString();
    let newDifficulty = parseInt(req.body.formIndexDifficulty);
    //retrive the ranks from the multicheckboxes
    let selectedRanks =  req.body.formIndexRanks;
    let newRanks =[0,1,2].map((rank)=> selectedRanks.includes(String(rank))); 

    let newEnviroment = req.body.formIndexEnviroment.toString();
    let newTemperature = parseInt(req.body.formIndexTemperature);
    let newDescription = req.body.formIndexDescription.toString();


    //Checks which fields have been changed with ternary ops and sets them on the updatedZone.
    let updatedZone = {
      name: zone.name!==newName? newName : zone.name ,
      difficulty: zone.difficulty!==newDifficulty? newDifficulty : zone.difficulty ,
      ranks:zone.ranks!==newRanks ? newRanks : zone.ranks,
      image: req.file ? req.file.filename: zone.image,
      enviroment: zone.enviroment!==newEnviroment? newEnviroment : zone.enviroment,
      temperature: zone.temperature!== newTemperature? newTemperature: zone.temperature,
      description: zone.description!== newDescription? newDescription: zone.description
    };

    console.log(updatedZone)
    //set the changes in DB
    await database.updateZonePost(id,updatedZone);
    res.render("updatePageNotifi",{
      headerTitle:"Actualizacion Completa",
      destinationLink: "/details?id="+id
    })
})
