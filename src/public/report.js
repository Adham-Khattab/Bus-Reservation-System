(() => {
    const submitBtn = document.getElementById('reportSubmit');
    const textarea = document.getElementById('reportText');

    submitBtn.addEventListener('click', () => {
        const value = textarea.value.trim();

        if (!value) {
            textarea.focus();
            return;
        }

        // Placeholder: replace with your actual submit logic (fetch/POST etc.)
        console.log('Report submitted:', value);

        textarea.value = '';
        submitBtn.textContent = 'Submitted!';
        setTimeout(() => {
            submitBtn.textContent = 'Submit';
        }, 2000);
    });
})();