const express = require("express");
const app = express();
app.use(express.json());

const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initialDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running at http://localhost:3000");
    });
  } catch (e) {
    process.exit(1);
  }
};
initialDBAndServer();

//api 1 getall players

app.get("/players/", async (request, response) => {
  const getAllPlayers = `SELECT * FROM cricket_team ;`;
  const playersArray = await db.all(getAllPlayers);
  console.log(playersArray);

  const convertObj = (each) => {
    return {
      playerId: each.player_id,
      playerName: each.player_name,
      jerseyNumber: each.jersey_number,
      role: each.role,
    };
  };
  response.send(playersArray.map((each) => convertObj(each)));
});

// API 2 post i player

app.post("/players/", async (request, response) => {
  const bookDetails = request.body;
  const { playerName, jerseyNumber, role } = bookDetails;

  const addPlayerQuery = `INSERT INTO 
                           cricket_team(player_name,
                                       jersey_number,
                                       role)
                         VALUES ( 
                             '${playerName}',
                              ${jerseyNumber},
                             '${role}' );`;
  const dbResponse = await db.run(addPlayerQuery);
  const playerId = dbResponse.lastID;

  response.send("Player Added to Team");
});

//API 3

app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getReqPlayerQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId};`;
  const getPlayer = await db.get(getReqPlayerQuery);
  response.send({
    playerId: getPlayer["player_id"],
    playerName: getPlayer["player_name"],
    jerseyNumber: getPlayer["jersey_number"],
    role: getPlayer["role"],
  });
});

//API 4

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;

  const playerDetails = request.body;

  const { playerName, jerseyNumber, role } = playerDetails;

  const updatePlayerQuery = `UPDATE cricket_team SET player_name = '${playerName}',
                              jersey_number = ${jerseyNumber},
                              role = '${role}'
                              WHERE player_id = ${playerId};`;

  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//API 5

app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `DELETE FROM cricket_team WHERE player_id = ${playerId};`;
  db.run(deletePlayerQuery);
  console.log(await db.run(deletePlayerQuery));
  response.send("Player Removed");
});
module.exports = app;
