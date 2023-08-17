const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const jwt = require('jsonwebtoken');
const serve = require('koa-static');
const path = require('path');
const fs = require('fs/promises');

const usersFilePath = path.join(__dirname, 'db', 'users.json');
const todosFilePath = path.join(__dirname, 'db', 'todos.json');

let users = [];
let todos = [];

const loadInitialData = async () => {
  try {
    const usersData = await fs.readFile(usersFilePath, 'utf-8');
    users = JSON.parse(usersData);

    const todosData = await fs.readFile(todosFilePath, 'utf-8');
    todos = JSON.parse(todosData);
  } catch (error) {
    console.error('Error loading initial data:', error);
  }
};

loadInitialData();

const app = new Koa();
const router = new Router();

const secretKey = 'your-secret-key';

app.use(serve(path.join(__dirname, 'public')));

router.post('/login', async (ctx) => {
  const { username, password } = ctx.request.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    ctx.status = 401;
    ctx.body = { error: 'Invalid credentials' };
    return;
  }

  const token = jwt.sign({ sub: user.id }, secretKey, { expiresIn: '1h' });

  ctx.body = { token };
});

const authMiddleware = async (ctx, next) => {
  const token = ctx.header.authorization;

  try {
    const decoded = jwt.verify(token, secretKey);
    ctx.state.userId = decoded.sub;
    await next();
  } catch (error) {
    ctx.status = 401;
    ctx.body = { error: 'Authentication failed' };
  }
};

router.get('/user', authMiddleware, async (ctx) => {
  const user = users.find((u) => u.id === ctx.state.userId);
  if (!user) {
    ctx.status = 404;
    ctx.body = { error: 'User not found' };
    return;
  }

  ctx.body = { id: user.id, username: user.username };
});

router.get('/todos', authMiddleware, async (ctx) => {
  ctx.body = todos.filter((todo) => todo.userId === ctx.state.userId);
});

router.post('/todos', authMiddleware, async (ctx) => {
  const { text } = ctx.request.body;
  const newTodo = { id: todos.length + 1, text, userId: ctx.state.userId };
  todos.push(newTodo);

  await fs.writeFile(todosFilePath, JSON.stringify(todos, null, 2));

  ctx.body = newTodo;
});

router.put('/todos/:id', authMiddleware, async (ctx) => {
  const { id } = ctx.params;
  const { text } = ctx.request.body;
  const index = todos.findIndex(
    (todo) => todo.id === Number(id) && todo.userId === ctx.state.userId
  );

  if (index === -1) {
    ctx.status = 404;
    ctx.body = { error: 'Todo not found' };
    return;
  }

  todos[index].text = text;

  await fs.writeFile(todosFilePath, JSON.stringify(todos, null, 2));

  ctx.body = todos[index];
});

router.delete('/todos/:id', authMiddleware, async (ctx) => {
  const { id } = ctx.params;
  const index = todos.findIndex(
    (todo) => todo.id === Number(id) && todo.userId === ctx.state.userId
  );

  if (index === -1) {
    ctx.status = 404;
    ctx.body = { error: 'Todo not found' };
    return;
  }

  const deletedTodo = todos.splice(index, 1);

  await fs.writeFile(todosFilePath, JSON.stringify(todos, null, 2));

  ctx.body = deletedTodo[0];
});

router.post('/signup', async (ctx) => {
  const { username, password } = ctx.request.body;

  const existingUser = users.find((user) => user.username === username);

  if (existingUser) {
    ctx.status = 400;
    ctx.body = { error: 'Username already exists' };
    return;
  }

  const newUser = { id: users.length + 1, username, password };
  users.push(newUser);

  await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));

  ctx.body = { message: 'User registered successfully' };
});

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
