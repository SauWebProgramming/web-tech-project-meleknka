export function initSuggestionWidget(allData) {
    const widget = document.getElementById('suggestionWidget');
    const btn = document.getElementById('suggestionBtn');
    const modal = document.getElementById('suggestionModal');
    const closeBtn = document.getElementById('closeSuggestionBtn');
    const input = document.getElementById('suggestionInput');
    const sendBtn = document.getElementById('sendSuggestionBtn');
    const chat = document.getElementById('suggestionChat');

    // Safety Check
    if (!widget || !btn || !modal || !closeBtn || !input || !sendBtn) {
        console.warn("Suggestion widget DOM elements missing.");
        return;
    }

    // Toggle Modal
    btn.addEventListener('click', () => {
        modal.classList.toggle('active');
        if (modal.classList.contains('active')) {
            input.focus();
        }
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!widget.contains(e.target) && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });

    // Send Message
    const handleSend = () => {
        const text = input.value.trim();
        if (!text) return;

        // User Message
        addMessage(text, 'user');
        input.value = '';

        // Process (Simulated delay)
        setTimeout(() => {
            const result = findSuggestion(text, allData);

            if (result.type === 'chat') {
                addMessage(result.msg, 'bot');
            } else if (result.type === 'suggestion' && result.item) {
                const suggestion = result.item;
                addMessage(`Sana önerim: <b>${suggestion.title}</b> (${suggestion.year}).`, 'bot');
                addMessage(`<a href="#" class="view-suggestion" data-id="${suggestion.id}">Detayları Gör</a>`, 'bot');
            } else {
                addMessage("Üzgünüm, kriterlerine uygun bir şey bulamadım. Başka kelimeler dener misin?", 'bot');
            }

            // Scroll to bottom
            const body = document.querySelector('.suggestion-body');
            body.scrollTop = body.scrollHeight;
        }, 500);
    };

    sendBtn.addEventListener('click', handleSend);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    // Handle Quick Actions
    const quickActions = document.querySelectorAll('.action-chip');
    quickActions.forEach(chip => {
        chip.addEventListener('click', () => {
            const text = chip.dataset.text;
            input.value = text;
            handleSend();
        });
    });

    // Handle "Detayları Gör" click
    chat.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-suggestion')) {
            e.preventDefault();
            const id = parseInt(e.target.dataset.id);
            const item = allData.find(d => d.id === id);
            if (item) {
                // Close the suggestion modal
                modal.classList.remove('active');

                // Open main modal
                const event = new CustomEvent('openDetailModal', { detail: item });
                window.dispatchEvent(event);
            }
        }
    });

    function addMessage(html, type) {
        const div = document.createElement('div');
        div.className = `chat-message ${type}`;
        if (type === 'bot') div.innerHTML = html;
        else div.innerText = html;
        chat.appendChild(div);

        const body = document.querySelector('.suggestion-body');
        body.scrollTop = body.scrollHeight;
    }

    function findSuggestion(text, data) {
        console.log('Searching for:', text);
        const lowerText = text.toLocaleLowerCase('tr');

        // Conversational Logic
        if (['merhaba', 'selam', 'hey'].some(w => lowerText.includes(w)) && lowerText.length < 20) {
            return { type: 'chat', msg: "Merhaba! Bugün senin için ne bulabilirim?" };
        }
        if (['teşekkür', 'sağol', 'mersi'].some(w => lowerText.includes(w))) {
            return { type: 'chat', msg: "Rica ederim! Başka bir isteğin var mı?" };
        }
        if (['nasılsın', 'naber'].some(w => lowerText.includes(w))) {
            return { type: 'chat', msg: "Ben bir botum, her zaman harikayım! Sen nasılsın?" };
        }

        // Filter Logic
        let filtered = data.filter(item => {
            // Check Explicit Type (only if specified)
            if (lowerText.includes('film') && item.type !== 'movie') return false;
            if ((lowerText.includes('dizi') || lowerText.includes('seri')) && item.type !== 'series') return false;
            if (lowerText.includes('kitap') && item.type !== 'book') return false;
            return true;
        });

        if (filtered.length === 0) filtered = data;

        // Keywords from Input
        const inputWords = lowerText.split(/\s+/).filter(w => w.length > 2);

        const scoredItems = filtered.map(item => {
            let score = 0;
            const title = item.title.toLocaleLowerCase('tr');
            const category = item.category.toLocaleLowerCase('tr');
            const director = item.director ? item.director.toLocaleLowerCase('tr') : '';
            const summary = item.summary ? item.summary.toLocaleLowerCase('tr') : '';

            // Year Logic
            const yearMatch = lowerText.match(/\d{4}/);
            if (yearMatch) {
                const targetYear = parseInt(yearMatch[0]);
                if (Math.abs(item.year - targetYear) <= 2) score += 5;
                if (item.year === targetYear) score += 5;
                if (lowerText.includes('önce') || lowerText.includes('eski')) {
                    if (item.year < targetYear) score += 3;
                }
                if (lowerText.includes('sonra') || lowerText.includes('yeni')) {
                    if (item.year > targetYear) score += 3;
                }
            }

            inputWords.forEach(word => {
                if (['film', 'dizi', 'kitap', 'öner', 'bana', 'hakkında', 'bir', 'şey', 'istiyorum'].includes(word)) return;
                if (title.includes(word)) score += 10;
                if (category.includes(word)) score += 8;
                if (director.includes(word)) score += 6;
                if (summary.includes(word)) score += 4;
            });

            return { item, score };
        });

        scoredItems.sort((a, b) => b.score - a.score);

        const topScore = scoredItems[0] ? scoredItems[0].score : 0;
        let selectedItem;

        if (topScore === 0) {
            selectedItem = filtered[Math.floor(Math.random() * filtered.length)];
        } else {
            const bestMatches = scoredItems.filter(i => i.score >= topScore - 2);
            selectedItem = bestMatches[Math.floor(Math.random() * bestMatches.length)].item;
        }

        return { type: 'suggestion', item: selectedItem };
    }
}
