const express = require("express");
const cors = require("cors");
const { uuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());
app.use("/repositories/:id", (request, response, next) => {
  const { id } = request.params;

  const index = repositories.findIndex((repo) => repo.id === id);
  if (index < 0) {
    return response.status(400).json({ error: "Repository not found." });
  }

  response.locals.index = index;
  return next();
});

const repositories = [];

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const newRepo = { id: uuid(), title, url, techs, likes: 0 };
  repositories.push(newRepo);

  return response.json(newRepo);
});

app.put("/repositories/:id", (request, response) => {
  const { title, url, techs } = request.body;
  const { index } = response.locals;

  const updatedRepo = { ...repositories[index], title, url, techs };
  repositories[index] = updatedRepo;

  return response.json(updatedRepo);
});

app.delete("/repositories/:id", (request, response) => {
  const { index } = response.locals;

  repositories.splice(index, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { index } = response.locals;

  const updatedRepo = {
    ...repositories[index],
    likes: repositories[index].likes + 1,
  };
  repositories[index] = updatedRepo;

  return response.json(updatedRepo);
});

module.exports = app;
