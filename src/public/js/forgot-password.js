document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#forgotForm');
  const errorMsg = document.querySelector('#errorMsg');
  const successMsg = document.querySelector('#successMsg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = form.elements['employeeEmail'].value.trim().toLowerCase();

    errorMsg.textContent = '';
    successMsg.textContent = '';

    if (!email) {
      errorMsg.textContent = 'Please enter your email.';
      return;
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        errorMsg.textContent = data.message || 'Something went wrong. Please try again.';
        return;
      }

      successMsg.textContent = 'If that email exists, a reset code has been sent. Redirecting...';

      // Send them to the reset page, passing the email along in the URL
      setTimeout(() => {
        window.location.href = `./reset-password.html?email=${encodeURIComponent(email)}`;
      }, 1500);

    } catch (error) {
      console.error('Forgot password request failed:', error);
      errorMsg.textContent = 'Something went wrong. Please try again.';
    }
  });
});