(() => {
    const gridEl = document.getElementById('reviewsGrid');

    const STARS = '<span class="star">&#9733;</span>'.repeat(5);

    const reviews = [
        {
            user_name: "Sarah Johnson",
            photo: "images/person1.jpg",
            message: "An exceptional corporate transit solution."
        },
        {
            user_name: "Michael Chen",
            photo: "images/person2.jpg",
            message: "Exemplary accountability and customer care."
        },
        {
            user_name: "Emma Davis",
            photo: "images/person3.jpg",
            message: "A reliable service that enhances the daily workplace experience."
        },
        {
            user_name: "James Wilson",
            photo: "images/person4.jpg",
            message: "Highly efficient and accommodating for professional guests."
        }
    ];

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function initials(name) {
        if (!name || name.toLowerCase() === 'anonymous') return '?';
        return name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map(n => n[0].toUpperCase())
            .join('');
    }

    function renderReviews() {
        if (!reviews.length) {
            gridEl.innerHTML = '<p class="reviews-empty">No 5-star reviews yet.</p>';
            return;
        }

        gridEl.innerHTML = reviews.map(f => {
            const fallback = initials(f.user_name);

            return `
                <div class="review-item">
                    <div class="review-avatar">
                        <img src="${f.photo}" alt="${escapeHtml(f.user_name || 'Customer')}"
                             onerror="this.replaceWith(Object.assign(document.createElement('span'), {textContent: '${fallback}'}))">
                    </div>
                    <div class="review-stars" aria-label="5 out of 5 stars">${STARS}</div>
                    <p class="review-quote">"${escapeHtml(f.message)}"</p>
                </div>
            `;
        }).join('');
    }

    renderReviews();
})();