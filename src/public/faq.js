(() => {
    const listEl = document.getElementById('faqList');

    const faqs = [
        {
            question: "Can I schedule my rides for the entire week in advance?",
            answer: "Yes, use the Calendar feature to select multiple dates and pre-book your upcoming trips."
        },
        {
            question: "How can I reserve a seat for a coworker or guest?",
            answer: "Yes, go to the home page then choose your coworker's name from the dropdown list."
        },
        {
            question: "What happens if I miss my scheduled shuttle?",
            answer: "You can rebook the next available shuttle directly from your Trip history page, no need to contact support."
        },
        {
            question: "Is there a limit to how many trips I can book per day?",
            answer: "No, there's no daily limit. You can book as many shuttle trips as you need, as long as seats are available."
        }
    ];

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function renderFaqs() {
        listEl.innerHTML = faqs.map((f, i) => `
            <div class="faq-item" data-index="${i}">
                <button class="faq-question" aria-expanded="false">
                    <span>${escapeHtml(f.question)}</span>
                    <svg class="faq-chevron" viewBox="0 0 16 16" fill="none">
                        <path d="M3 5.5L8 10.5L13 5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <div class="faq-answer">
                    <div class="faq-answer-inner">${escapeHtml(f.answer)}</div>
                </div>
            </div>
        `).join('');

        listEl.querySelectorAll('.faq-item').forEach(item => {
            const btn = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');

            btn.addEventListener('click', () => {
                const isOpen = item.classList.contains('open');

                // close any other open item
                listEl.querySelectorAll('.faq-item.open').forEach(openItem => {
                    if (openItem !== item) {
                        openItem.classList.remove('open');
                        openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                        openItem.querySelector('.faq-answer').style.maxHeight = null;
                    }
                });

                if (isOpen) {
                    item.classList.remove('open');
                    btn.setAttribute('aria-expanded', 'false');
                    answer.style.maxHeight = null;
                } else {
                    item.classList.add('open');
                    btn.setAttribute('aria-expanded', 'true');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            });
        });
    }

    renderFaqs();
})();