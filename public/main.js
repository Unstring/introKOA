const todoForm = document.getElementById('todo-form');
const todoText = document.getElementById('todo-text');
const todoList = document.getElementById('todo-list');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const logoutButton = document.getElementById('logout-button');

const API_BASE_URL = 'http://localhost:3000';

const logout = () => {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
};

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
  } else {
    renderTodos();
    logoutButton.addEventListener('click', logout);
  }
});

const getUserData = async () => {
  const token = localStorage.getItem('token');

  if (token) {
    const response = await fetch(`${API_BASE_URL}/user`, {
      headers: {
        Authorization: token,
      },
    });

    if (response.ok) {
      const data = await response.json();
      document.getElementById(
        'username'
      ).textContent = `Hello, ${data.username}`;
    }
  }
};
getUserData();

const getTodos = async () => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/todos`, {
    headers: {
      Authorization: token,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error);
  }

  const data = await response.json();
  return data;
};

const addTodo = async (text) => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/todos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error);
  }

  const data = await response.json();
  return data;
};

const deleteTodo = async (id) => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: token,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error);
  }

  const data = await response.json();
  return data;
};

const updateTodo = async (id, newText) => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify({ text: newText }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error);
  }

  const data = await response.json();
  return data;
};

const renderTodos = async () => {
  const todos = await getTodos();

  todoList.innerHTML = '';

  todos.forEach((todo) => {
    const li = document.createElement('li');
    li.className = 'border rounded p-2 mt-2 flex justify-between items-center';
    li.innerHTML = `
      <span>${todo.text}</span>
      <div>
        <button class="text-green-500 hover:text-green-700 mr-2 edit-button">Edit</button>
        <button class="text-red-500 hover:text-red-700 delete-button">Delete</button>
      </div>
    `;

    li.querySelector('.delete-button').addEventListener('click', async () => {
      await deleteTodo(todo.id);
      renderTodos();
    });

    const editButton = li.querySelector('.edit-button');
    editButton.addEventListener('click', () => {
      const newText = prompt('Edit todo:', todo.text);
      if (newText !== null) {
        updateTodo(todo.id, newText)
          .then(() => renderTodos())
          .catch((error) => console.error(error.message));
      }
    });

    todoList.appendChild(li);
  });
};

todoForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = todoText.value.trim();

  if (text === '') return;

  await addTodo(text);
  todoText.value = '';
  renderTodos();
});

logoutButton.addEventListener('click', logout);

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
  } else {
    getUserData(); // Load user data
    renderTodos();
    logoutButton.addEventListener('click', logout);
  }
});
