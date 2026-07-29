(() => {
    const gridEl = document.getElementById('reviewsGrid');

    const PHOTOS = [
        'images/person1.jpg',
        'images/person2.jpg',
        'images/person3.jpg',
        'images/person4.jpg'
    ];

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function starsFor(rating) {
        const full = '<span class="star">&#9733;</span>'.repeat(rating);
        const empty = '<span class="star" style="opacity:0.3">&#9733;</span>'.repeat(5 - rating);
        return full + empty;
    }

    async function loadReviews() {
        try {
            const res = await fetch('/api/feedback');
            if (!res.ok) throw new Error('Failed to load reviews');

            const feedback = await res.json();
            const recent = feedback.slice(0, 4);

            renderReviews(recent);
        } catch (err) {
            gridEl.innerHTML = '<p class="reviews-empty">Could not load reviews right now.</p>';
            console.error('Error loading reviews:', err.message);
        }
    }

    function renderReviews(reviews) {
        if (!reviews.length) {
            gridEl.innerHTML = '<p class="reviews-empty">No reviews yet.</p>';
            return;
        }

        gridEl.innerHTML = reviews.map((f, i) => {
            const quote = f.suggestion && f.suggestion.trim()
                ? f.suggestion
                : 'Great experience overall!';

            const photo = PHOTOS[i % PHOTOS.length];

            return `
                <div class="review-item">
                    <div class="review-avatar">
                        <img src="${photo}" alt="Customer photo"
                             onerror="this.replaceWith(Object.assign(document.createElement('span'), {textContent: '?'}))">
                    </div>
                    <div class="review-stars" aria-label="${f.rating} out of 5 stars">${starsFor(f.rating)}</div>
                    <p class="review-quote">"${escapeHtml(quote)}"</p>
                </div>
            `;
        }).join('');
    }

    loadReviews();
})();