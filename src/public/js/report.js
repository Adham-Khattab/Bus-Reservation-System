(() => {
    const submitBtn = document.getElementById('reportSubmit');
    const textarea = document.getElementById('reportText');

    submitBtn.addEventListener('click', async () => {
        const value = textarea.value.trim();

        if (!value) {
            textarea.focus();
            return;
        }

        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;

        try {
            const res = await fetch('/api/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: value })
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Something went wrong');
            }

            textarea.value = '';
            submitBtn.textContent = 'Submitted!';
        } catch (err) {
            submitBtn.textContent = 'Failed — try again';
            console.error('Error submitting report:', err.message);
        } finally {
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 2000);
        }
    });
})();