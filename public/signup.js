const signupForm = document.getElementById('signup-form');
const signupUsernameInput = document.getElementById('signup-username');
const signupPasswordInput = document.getElementById('signup-password');

const API_BASE_URL = 'http://localhost:3000';

const signup = async (username, password) => {
  const response = await fetch(`${API_BASE_URL}/signup`, {
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
  return data.message;
};

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = signupUsernameInput.value.trim();
  const password = signupPasswordInput.value;

  if (username === '' || password === '') {
    return;
  }

  try {
    const message = await signup(username, password);
    console.log(message);
    window.location.href = 'login.html';
  } catch (error) {
    console.error(error.message);
  }
});
