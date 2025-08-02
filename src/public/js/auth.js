import api from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userData = {
        username: document.getElementById('regUsername').value,
        email: document.getElementById('regEmail').value,
        password: document.getElementById('regPassword').value,
      };
      const result = await api.register(userData);
      if (result.token) alert('Ro\'yxatdan o\'tildi!');
      else alert(result.message);
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const credentials = {
        email: document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value,
      };
      const result = await api.login(credentials);
      if (result.token) alert('Muvaffaqiyatli kirdingiz!');
      else alert(result.message);
    });
  }
});