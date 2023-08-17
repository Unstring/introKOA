const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

const API_BASE_URL = 'http://localhost:3000';

const login = async (username, password) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error);
  }

  const data = await response.json();
  return data.token;
};

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (username === '' || password === '') {
    return;
  }

  try {
    const token = await login(username, password);
    localStorage.setItem('token', token);
    window.location.href = '/';
  } catch (error) {
    console.error(error.message);
  }
});