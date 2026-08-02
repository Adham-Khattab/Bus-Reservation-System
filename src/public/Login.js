// Attach this script to your login page (the one with the Welcome Back form)

document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.querySelector('#loginBtn');       // adjust selector to match your button
  const emailInput = document.querySelector('#email');        // adjust selector to match your email input
  const passwordInput = document.querySelector('#password');  // adjust selector to match your password input
  const rememberMeInput = document.querySelector('#rememberMe'); // adjust selector to match your checkbox
  const errorMsg = document.querySelector('#errorMsg');       // optional: element to show error messages

  loginBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const rememberMe = rememberMeInput ? rememberMeInput.checked : false;

    if (!email || !password) {
      if (errorMsg) errorMsg.textContent = 'Please enter both email and password.';
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (errorMsg) errorMsg.textContent = data.message || 'Login failed.';
        return;
      }

      // Store the token (localStorage if Remember Me, sessionStorage otherwise)
      if (rememberMe) {
        localStorage.setItem('token', data.token);
      } else {
        sessionStorage.setItem('token', data.token);
      }

      // Redirect to the dashboard on success
      window.location.href = '/Dashboard.html';

    } catch (error) {
      console.error('Login request failed:', error);
      if (errorMsg) errorMsg.textContent = 'Something went wrong. Please try again.';
    }
  });
});