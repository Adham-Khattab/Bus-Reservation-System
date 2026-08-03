// Attach this script to your login page (the one with the Welcome Back form)

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#loginForm');
  const errorMsg = document.querySelector('#errorMsg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // stop normal form submission, we'll send it with fetch instead

    const email = form.elements['employeeEmail'].value.trim();
    const password = form.elements['employeePassword'].value;
    const rememberMe = form.elements['rememberMe'].checked;

    errorMsg.textContent = '';

    if (!email || !password) {
      errorMsg.textContent = 'Please enter both email and password.';
      return;
    }

    try {
      console.log('Sending login request to /api/auth/login with:', { email });

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      console.log('Response status:', response.status);

      const data = await response.json();

      console.log('Response data:', data);

      if (!response.ok) {
        errorMsg.textContent = data.message || 'Login failed.';
        return;
      }

      // Store the token AND the user object (localStorage if Remember Me,
      // sessionStorage otherwise) — other pages like the dashboard and
      // calendar read `user` from storage to know who's logged in.
      if (rememberMe) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('user', JSON.stringify(data.user));
      }

      // Redirect to the dashboard on success
      window.location.href = './Dashboard.html';

    } catch (error) {
      console.error('Login request failed:', error);
      errorMsg.textContent = 'Something went wrong. Please try again.';
    }
  });
});