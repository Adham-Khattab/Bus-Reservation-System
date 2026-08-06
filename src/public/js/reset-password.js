document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#resetForm');
  const errorMsg = document.querySelector('#errorMsg');
  const successMsg = document.querySelector('#successMsg');

  // Pre-fill the email field from the URL, e.g. reset-password.html?email=someone@example.com
  const urlParams = new URLSearchParams(window.location.search);
  const emailFromUrl = urlParams.get('email');
  if (emailFromUrl) {
    form.elements['employeeEmail'].value = emailFromUrl;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = form.elements['employeeEmail'].value.trim().toLowerCase();
    const otp = form.elements['otp'].value.trim();
    const newPassword = form.elements['newPassword'].value;
    const confirmPassword = form.elements['confirmPassword'].value;

    errorMsg.textContent = '';
    successMsg.textContent = '';

    if (!email || !otp || !newPassword || !confirmPassword) {
      errorMsg.textContent = 'Please fill in all fields.';
      return;
    }

    if (newPassword !== confirmPassword) {
      errorMsg.textContent = 'Passwords do not match.';
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        errorMsg.textContent = data.message || 'Something went wrong. Please try again.';
        return;
      }

      successMsg.textContent = 'Password reset! Redirecting to login...';

      setTimeout(() => {
        window.location.href = './login.html';
      }, 1500);

    } catch (error) {
      console.error('Reset password request failed:', error);
      errorMsg.textContent = 'Something went wrong. Please try again.';
    }
  });
});