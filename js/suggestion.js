// Öneri Widget'ını başlatan ana fonksiyon
export function initSuggestionWidget(allData) {
    const widget = document.getElementById('suggestionWidget');
    const btn = document.getElementById('suggestionBtn');
    const modal = document.getElementById('suggestionModal');
    const closeBtn = document.getElementById('closeSuggestionBtn');
    const input = document.getElementById('suggestionInput');
    const sendBtn = document.getElementById('sendSuggestionBtn');
    const chat = document.getElementById('suggestionChat');

    // Modalı aç/kapat
    btn.addEventListener('click', () => {
        modal.classList.toggle('active');
        // Açılınca direkt yazı yazmaya başla
        if (modal.classList.contains('active')) {
            input.focus();
        }
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    // Pencere dışına tıklayınca kapat
    document.addEventListener('click', (e) => {
        if (!widget.contains(e.target) && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });

    // Mesaj gönderme işlemi
    const handleSend = () => {
        const text = input.value.trim();
        if (!text) return; // Boşsa işlem yapma

        // Kullanıcının mesajını ekrana ekle
        addMessage(text, 'user');
        input.value = '';

        // Botun düşünmesini bekle (yarım saniye gecikme ekliyoruz ki gerçekçi olsun)
        setTimeout(() => {
            const result = findSuggestion(text, allData);

            if (result.type === 'chat') {
                // Sohbet cevabı ise
                addMessage(result.msg, 'bot');
            } else if (result.type === 'suggestion' && result.item) {
                // Öneri bulunduysa
                const suggestion = result.item;
                addMessage(`Sana önerim: <b>${suggestion.title}</b> (${suggestion.year}).`, 'bot');
                addMessage(`<a href="#" class="view-suggestion" data-id="${suggestion.id}">Detayları Gör</a>`, 'bot');
            } else {
                // Bulamadıysa
                addMessage("Üzgünüm, kriterlerine uygun bir şey bulamadım. Başka kelimeler dener misin?", 'bot');
            }

            // En aşağıya kaydır (yeni mesaj görünsün)
            const body = document.querySelector('.suggestion-body');
            body.scrollTop = body.scrollHeight;
        }, 500);
    };

    // Gönder butonuna basınca veya Enter'a basınca gönder
    sendBtn.addEventListener('click', handleSend);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    // Hazır butonlara (Film Öner vb.) tıklanınca
    const quickActions = document.querySelectorAll('.action-chip');
    quickActions.forEach(chip => {
        chip.addEventListener('click', () => {
            const text = chip.dataset.text;
            input.value = text;
            handleSend();
        });
    });

    // "Detayları Gör" linkine tıklanınca
    chat.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-suggestion')) {
            e.preventDefault();
            const id = parseInt(e.target.dataset.id);
            const item = allData.find(d => d.id === id);
            if (item) {
                // Öneri penceresini kapat
                modal.classList.remove('active');

                // Ana detay penceresini aç (bunun için main.js'e olay gönderiyoruz)
                const event = new CustomEvent('openDetailModal', { detail: item });
                window.dispatchEvent(event);
            }
        }
    });

    // Ekrana baloncuk içinde mesaj ekleyen fonksiyon
    function addMessage(html, type) {
        const div = document.createElement('div');
        div.className = `chat-message ${type}`; // type: 'user' veya 'bot'
        if (type === 'bot') div.innerHTML = html;
        else div.innerText = html;
        chat.appendChild(div);

        // Scrollu aşağı indir
        const body = document.querySelector('.suggestion-body');
        body.scrollTop = body.scrollHeight;
    }

    // Kelimelere göre uygun öneriyi bulan 'Yapay Zeka' parçacığı :)
    function findSuggestion(text, data) {
        console.log('Aranan:', text);
        const lowerText = text.toLocaleLowerCase('tr');

        // Basit sohbet cevapları
        if (['merhaba', 'selam', 'hey'].some(w => lowerText.includes(w)) && lowerText.length < 20) {
            return { type: 'chat', msg: "Merhaba! Bugün senin için ne bulabilirim?" };
        }
        if (['teşekkür', 'sağol', 'mersi'].some(w => lowerText.includes(w))) {
            return { type: 'chat', msg: "Rica ederim! Başka bir isteğin var mı?" };
        }
        if (['nasılsın', 'naber'].some(w => lowerText.includes(w))) {
            return { type: 'chat', msg: "Ben bir botum, her zaman harikayım! Sen nasılsın?" };
        }

        // Filtreleme mantığı
        let filtered = data.filter(item => {
            // Tür kontrolü (eğer kullanıcı "film", "dizi" veya "kitap" dediyse)
            if (lowerText.includes('film') && item.type !== 'movie') return false;
            if ((lowerText.includes('dizi') || lowerText.includes('seri')) && item.type !== 'series') return false;
            if (lowerText.includes('kitap') && item.type !== 'book') return false;
            return true;
        });

        if (filtered.length === 0) filtered = data;

        // Yazılan kelimeleri ayıkla
        const inputWords = lowerText.split(/\s+/).filter(w => w.length > 2);

        // Her bir ögeye puan ver
        const scoredItems = filtered.map(item => {
            let score = 0;
            const title = item.title.toLocaleLowerCase('tr');
            const category = item.category.toLocaleLowerCase('tr');
            const director = item.director ? item.director.toLocaleLowerCase('tr') : '';
            const summary = item.summary ? item.summary.toLocaleLowerCase('tr') : '';

            // Yıl kontrolü (örn: "2010" yazdıysa)
            const yearMatch = lowerText.match(/\d{4}/);
            if (yearMatch) {
                const targetYear = parseInt(yearMatch[0]);
                if (Math.abs(item.year - targetYear) <= 2) score += 5; // Yakın tarih
                if (item.year === targetYear) score += 5; // Tam tarih
                if (lowerText.includes('önce') || lowerText.includes('eski')) {
                    if (item.year < targetYear) score += 3;
                }
                if (lowerText.includes('sonra') || lowerText.includes('yeni')) {
                    if (item.year > targetYear) score += 3;
                }
            }

            // Kelime eşleşmelerine puan ver
            inputWords.forEach(word => {
                // Etkisiz kelimeleri geç
                if (['film', 'dizi', 'kitap', 'öner', 'bana', 'hakkında', 'bir', 'şey', 'istiyorum'].includes(word)) return;

                if (title.includes(word)) score += 10;
                if (category.includes(word)) score += 8;
                if (director.includes(word)) score += 6;
                if (summary.includes(word)) score += 4;
            });

            return { item, score };
        });

        // Puana göre sırala (en yüksek en üstte)
        scoredItems.sort((a, b) => b.score - a.score);

        const topScore = scoredItems[0] ? scoredItems[0].score : 0;
        let selectedItem;

        // Eğer hiç puan alamadıysa rastgele bir şey seç
        if (topScore === 0) {
            selectedItem = filtered[Math.floor(Math.random() * filtered.length)];
        } else {
            // En yüksek puanlılardan birini rastgele seç (hata payı için biraz esneklik)
            const bestMatches = scoredItems.filter(i => i.score >= topScore - 2);
            selectedItem = bestMatches[Math.floor(Math.random() * bestMatches.length)].item;
        }

        return { type: 'suggestion', item: selectedItem };
    }
}
