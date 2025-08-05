class MemoryGame {
    constructor() {
        this.selectedLevel = null;
        this.gameTime = 0;
        this.timer = null;
        this.previewTimer = null;
        this.matchedPairs = 0;
        this.flippedCards = [];
        this.canFlip = false;
        this.totalPairs = 0;
        
        // رموز الفضاء
        this.spaceEmojis = ['🚀', '🛸', '🌌', '🪐', '⭐', '🌟', '🌙', '☄️', '🛰️', '👽', '🌍', '🌕'];
        
        // إعدادات المستويات
        this.levels = {
            easy: { cards: 4, time: 15, preview: 3 },
            medium: { cards: 6, time: 45, preview: 5 },
            hard: { cards: 8, time: 60, preview: 7 }
        };
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // أزرار اختيار المستوى
        const levelButtons = document.querySelectorAll('.level-btn');
        levelButtons.forEach(btn => {
            btn.addEventListener('click', () => this.selectLevel(btn.dataset.level));
        });
        
        // زر بدء اللعبة
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        
        // زر اللعب مرة أخرى
        document.getElementById('playAgainBtn').addEventListener('click', () => this.resetGame());
    }
    
    selectLevel(level) {
        // إزالة التحديد من جميع الأزرار
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // تحديد المستوى الحالي
        document.querySelector(`[data-level="${level}"]`).classList.add('selected');
        this.selectedLevel = level;
        
        // الزر يبقى معطلاً - لا يمكن بدء اللعبة
    }
    
    startGame() {
        if (!this.selectedLevel) return;
        
        // إخفاء شاشة الإعداد وإظهار شاشة اللعبة
        document.getElementById('gameSetup').style.display = 'none';
        document.getElementById('gameBoard').style.display = 'block';
        
        // إعداد اللعبة
        this.setupGameBoard();
        this.showPreview();
    }
    
    setupGameBoard() {
        const level = this.levels[this.selectedLevel];
        this.totalPairs = level.cards / 2;
        this.matchedPairs = 0;
        this.gameTime = level.time;
        
        // تحديث عداد الأزواج
        document.getElementById('matches').textContent = `0 / ${this.totalPairs}`;
        
        // إنشاء البطاقات
        this.createCards();
    }
    
    createCards() {
        const level = this.levels[this.selectedLevel];
        const cardsContainer = document.getElementById('cardsContainer');
        
        // إضافة فئة المستوى للحاوية
        cardsContainer.className = `cards-container ${this.selectedLevel}`;
        cardsContainer.innerHTML = '';
        
        // اختيار رموز عشوائية
        const selectedEmojis = this.shuffleArray(this.spaceEmojis).slice(0, this.totalPairs);
        
        // إنشاء مصفوفة البطاقات (كل رمز مرتين)
        const cardEmojis = [...selectedEmojis, ...selectedEmojis];
        const shuffledCards = this.shuffleArray(cardEmojis);
        
        // إنشاء البطاقات
        shuffledCards.forEach((emoji, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.emoji = emoji;
            card.dataset.index = index;
            
            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">🌌</div>
                    <div class="card-back">${emoji}</div>
                </div>
            `;
            
            card.addEventListener('click', () => this.flipCard(card));
            cardsContainer.appendChild(card);
        });
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    showPreview() {
        const level = this.levels[this.selectedLevel];
        const previewMessage = document.getElementById('previewMessage');
        const previewTimerEl = document.getElementById('previewTimer');
        
        // إظهار جميع البطاقات
        document.querySelectorAll('.card').forEach(card => {
            card.classList.add('flipped');
        });
        
        let previewTime = level.preview;
        previewTimerEl.textContent = previewTime;
        
        this.previewTimer = setInterval(() => {
            previewTime--;
            previewTimerEl.textContent = previewTime;
            
            if (previewTime <= 0) {
                clearInterval(this.previewTimer);
                this.startMainGame();
            }
        }, 1000);
    }
    
    startMainGame() {
        // إخفاء رسالة المعاينة
        document.getElementById('previewMessage').style.display = 'none';
        
        // إخفاء جميع البطاقات
        document.querySelectorAll('.card').forEach(card => {
            card.classList.remove('flipped');
        });
        
        // تفعيل إمكانية قلب البطاقات
        this.canFlip = true;
        
        // بدء المؤقت
        this.startTimer();
    }
    
    startTimer() {
        const timerEl = document.getElementById('timer');
        this.updateTimerDisplay();
        
        this.timer = setInterval(() => {
            this.gameTime--;
            this.updateTimerDisplay();
            
            if (this.gameTime <= 0) {
                this.endGame(false); // خسارة
            }
        }, 1000);
    }
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = this.gameTime % 60;
        document.getElementById('timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    flipCard(card) {
        if (!this.canFlip || card.classList.contains('flipped') || this.flippedCards.length >= 2) {
            return;
        }
        
        card.classList.add('flipped');
        this.flippedCards.push(card);
        
        if (this.flippedCards.length === 2) {
            this.canFlip = false;
            setTimeout(() => this.checkMatch(), 800);
        }
    }
    
    checkMatch() {
        const [card1, card2] = this.flippedCards;
        const emoji1 = card1.dataset.emoji;
        const emoji2 = card2.dataset.emoji;
        
        if (emoji1 === emoji2) {
            // مطابقة صحيحة
            card1.classList.add('matched');
            card2.classList.add('matched');
            this.matchedPairs++;
            
            // تحديث عداد الأزواج
            document.getElementById('matches').textContent = `${this.matchedPairs} / ${this.totalPairs}`;
            
            // التحقق من الفوز
            if (this.matchedPairs === this.totalPairs) {
                setTimeout(() => this.endGame(true), 500); // فوز
            }
        } else {
            // مطابقة خاطئة
            card1.classList.add('wrong');
            card2.classList.add('wrong');
            
            setTimeout(() => {
                card1.classList.remove('flipped', 'wrong');
                card2.classList.remove('flipped', 'wrong');
            }, 1000);
        }
        
        // إعادة تعيين المتغيرات
        this.flippedCards = [];
        setTimeout(() => {
            this.canFlip = true;
        }, 1200);
    }
    
    endGame(won) {
        // إيقاف المؤقت
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        // تعطيل إمكانية قلب البطاقات
        this.canFlip = false;
        
        // إظهار نتيجة اللعبة
        const resultEl = document.getElementById('gameResult');
        const resultEmoji = document.getElementById('resultEmoji');
        const resultTitle = document.getElementById('resultTitle');
        const resultMessage = document.getElementById('resultMessage');
        
        if (won) {
            resultEmoji.textContent = '🎉';
            resultTitle.textContent = 'مبروك!';
            resultMessage.textContent = 'لقد فزت في اللعبة!';
        } else {
            resultEmoji.textContent = '😢';
            resultTitle.textContent = 'انتهى الوقت!';
            resultMessage.textContent = 'حاول مرة أخرى!';
        }
        
        resultEl.style.display = 'flex';
    }
    
    resetGame() {
        // إيقاف المؤقتات
        if (this.timer) clearInterval(this.timer);
        if (this.previewTimer) clearInterval(this.previewTimer);
        
        // إعادة تعيين المتغيرات
        this.selectedLevel = null;
        this.gameTime = 0;
        this.matchedPairs = 0;
        this.flippedCards = [];
        this.canFlip = false;
        this.totalPairs = 0;
        
        // إخفاء الشاشات
        document.getElementById('gameBoard').style.display = 'none';
        document.getElementById('gameResult').style.display = 'none';
        document.getElementById('previewMessage').style.display = 'block';
        
        // إظهار شاشة الإعداد
        document.getElementById('gameSetup').style.display = 'block';
        
        // إعادة تعيين أزرار المستوى
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // تعطيل زر البدء
        document.getElementById('startBtn').disabled = true;
    }
}

// بدء اللعبة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});