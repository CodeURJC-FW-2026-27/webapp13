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

    const difficultyToStars = (param) => {
      return "⭐".repeat(param.difficulty);
    };

    const ranksToString = (param) => {
      let s = "" + param.ranks[0] ? "LR " : "";
      s += param.ranks[1] ? "HR " : "";
      s += param.ranks[2] ? "MR" : "";

      return s;
    };

    const temperatureToString = (param) => {
      let s = "";
      switch (param.temperature) {
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
    };

    res.render("details.html", {
      headerTitle: zone.name,
      zone: zone,
      monsters: zone.monsters,
      zoneDifficulty: difficultyToStars(zone),
      zoneRanks: ranksToString(zone),
      zoneRemperature: temperatureToString(zone),
      monstersDifficulty: function () {
        return "⭐".repeat(this.difficulty);
      },
      monstersRanks: function () {
        let s = "" + this.ranks[0] ? "LR " : "";
        s += this.ranks[1] ? "HR " : "";
        s += this.ranks[2] ? "MR" : "";

        return s;
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
  res.render("formIndex.html", {});
});
