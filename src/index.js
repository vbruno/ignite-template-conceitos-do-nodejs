const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  // const userAlreadyExists = users.some((user) => user.username === username);
  const userAlreadyExists = users.find((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);

  // users.push({
  //   id: uuidv4(),
  //   name,
  //   username,
  //   todos: [],
  // });

  // return response.status(201).json(users);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    create_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todo = user.todos.find((element) => element.id === id);

  if (todo) {
    todo.title = title;
    todo.deadline = new Date(deadline);
    return response.json(todo);
  } else {
    return response.status(404).json({ error: "Did not find the desired ID" });
  }
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((element) => element.id === id);

  if (todo) {
    todo.done = true;
    return response.status(200).json(todo);
  } else {
    return response.status(404).json({ error: "Did not find the desired ID" });
  }
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const checksExistsId = user.todos.findIndex((element) => element.id === id);

  if (checksExistsId != -1) {
    user.todos.splice(checksExistsId, 1);
    return response.status(204).json();
  } else {
    return response.status(404).json({ error: "Did not find the desired ID" });
  }
});

module.exports = app;
