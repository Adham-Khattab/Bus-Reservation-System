// Feedback page logic — only touches the /api/feedback endpoint you built.

(() => {
    const ratingButtons = document.querySelectorAll('.rating-option');
    const suggestionEl = document.getElementById('suggestion');
    const submitBtn = document.getElementById('submitBtn');
    const statusEl = document.getElementById('statusMsg');

    let selectedRating = null;

    ratingButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            ratingButtons.forEach(b => {
                b.classList.remove('selected');
                b.setAttribute('aria-checked', 'false');
            });
            btn.classList.add('selected');
            btn.setAttribute('aria-checked', 'true');
            selectedRating = Number(btn.dataset.value);
            statusEl.textContent = '';
        });
    });

    submitBtn.addEventListener('click', async () => {
        if (!selectedRating) {
            statusEl.textContent = 'Please select a rating before submitting.';
            statusEl.className = 'feedback-status error';
            return;
        }

        submitBtn.disabled = true;
        statusEl.textContent = 'Submitting...';
        statusEl.className = 'feedback-status';

        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_name: 'Anonymous',
                    message: suggestionEl.value.trim() || '(no suggestion left)',
                    rating: selectedRating
                })
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Something went wrong');
            }

            statusEl.textContent = 'Thank you for your feedback!';
            statusEl.className = 'feedback-status success';

            // Reset the form
            ratingButtons.forEach(b => {
                b.classList.remove('selected');
                b.setAttribute('aria-checked', 'false');
            });
            selectedRating = null;
            suggestionEl.value = '';
        } catch (err) {
            statusEl.textContent = err.message || 'Could not submit feedback. Please try again.';
            statusEl.className = 'feedback-status error';
        } finally {
            submitBtn.disabled = false;
        }
    });
})();