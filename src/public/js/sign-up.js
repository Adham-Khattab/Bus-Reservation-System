// Attach this script to your sign-up page (Create Account form)

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#signupForm');
  const errorMsg = document.querySelector('#errorMsg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // stop normal form submission, we'll send it with fetch instead

    const name = form.elements['employeeName'].value.trim();
    const email = form.elements['employeeEmail'].value.trim();
    const password = form.elements['employeePassword'].value;
    const confirmPassword = form.elements['confirmPassword'].value;

    errorMsg.textContent = '';

    if (!name || !email || !password || !confirmPassword) {
      errorMsg.textContent = 'Please fill in all fields.';
      return;
    }

    if (password !== confirmPassword) {
      errorMsg.textContent = 'Passwords do not match.';
      return;
    }

    try {
      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        errorMsg.textContent = data.message || 'Sign up failed. Please try again.';
        return;
      }

      // Success — send them to the login page
      window.location.href = './login.html';

    } catch (error) {
      console.error('Sign up request failed:', error);
      errorMsg.textContent = 'Something went wrong. Please try again.';
    }
  });
});