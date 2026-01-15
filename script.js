// Основная анимация заставки и таймера
document.addEventListener('DOMContentLoaded', function () {
    // Элементы заставки
    const stamp = document.getElementById('stamp');
    const envelopeContainer = document.getElementById('envelopeContainer');
    const mainContent = document.getElementById('mainContent');

    // Скрываем основной контент в начале
    mainContent.style.display = 'none';

    // Обработчик клика по печати
    stamp.addEventListener('click', function () {
        // Показываем основной контент
        mainContent.style.display = 'block';

        // Запускаем анимацию конверта
        envelopeContainer.classList.add('envelope-open');

        // Убираем заставку через 10 секунд
        setTimeout(() => {
            console.log('Анимация завершена');
        }, 10000);
    });

    // Плавная прокрутка
    const scrollHint = document.querySelector('.scroll-hint');
    if (scrollHint) {
        scrollHint.addEventListener('click', function () {
            window.scrollTo({
                top: window.innerHeight,
                behavior: 'smooth'
            });
        });
    }

    // ТАЙМЕР ОБРАТНОГО ОТСЧЕТА
    const weddingDate = new Date('2026-07-18T15:00:00').getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const timeLeft = weddingDate - now;

        if (timeLeft < 0) {
            document.getElementById('countdown').innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <h3 style="color: white; font-family: 'Playfair Display', serif;">
                        🎉 Этот день настал! С праздником! 🎉
                    </h3>
                </div>
            `;
            return;
        }

        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        updateNumberWithAnimation('days', days.toString().padStart(3, '0'));
        updateNumberWithAnimation('hours', hours.toString().padStart(2, '0'));
        updateNumberWithAnimation('minutes', minutes.toString().padStart(2, '0'));
        updateNumberWithAnimation('seconds', seconds.toString().padStart(2, '0'));
    }

    function updateNumberWithAnimation(elementId, newValue) {
        const element = document.getElementById(elementId);
        const currentValue = element.textContent;

        if (currentValue !== newValue) {
            element.style.transform = 'scale(1.1)';
            setTimeout(() => {
                element.textContent = newValue;
                element.style.transform = 'scale(1)';
                element.style.color = 'white';
            }, 150);
        } else {
            element.textContent = newValue;
        }
    }

    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);

    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            clearInterval(countdownInterval);
        } else {
            updateCountdown();
            setInterval(updateCountdown, 1000);
        }
    });
});

// Анимация сердца по таймлайну
(function () {
    document.addEventListener('DOMContentLoaded', function () {
        const heart = document.querySelector('.heart-fixed');
        const motionPath = document.getElementById('heartMotionPath');
        const section = document.getElementById('scheduleSection');
        const timelineViewport = document.querySelector('.timeline-viewport');

        if (!heart || !motionPath || !section || !timelineViewport) return;

        const pathLength = motionPath.getTotalLength();
        const ACTIVATION_ZONE = 0.07;

        const elementPositions = [
            0.12,  // Welcome (16:00)
            0.29,  // Церемония (17:00)
            0.46,  // Банкет (18:30)
            0.65,  // Торт (22:00)
            0.83   // Финал (23:00)
        ];

        function updateHeartPosition() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;

            const viewportRect = timelineViewport.getBoundingClientRect();
            const viewportTop = viewportRect.top + scrollTop;
            const viewportBottom = viewportTop + viewportRect.height;

            const endPoint = viewportBottom - (windowHeight / 3);
            const startPoint = viewportTop - 200;

            let progress;

            if (scrollTop < startPoint) {
                progress = 0;
            } else if (scrollTop > endPoint) {
                progress = 1;
            } else {
                progress = (scrollTop - startPoint) / (endPoint - startPoint);
            }

            progress = Math.max(0, Math.min(1, progress));

            const pointOnPath = motionPath.getPointAtLength(progress * pathLength);
            const svgElement = motionPath.ownerSVGElement;
            const svgRect = svgElement.getBoundingClientRect();

            const svgViewBox = svgElement.viewBox.baseVal;
            const viewBoxWidth = svgViewBox.width || 300;
            const viewBoxHeight = svgViewBox.height || 1378;

            const scaleX = svgRect.width / viewBoxWidth;
            const scaleY = svgRect.height / viewBoxHeight;

            const heartX = svgRect.left + (pointOnPath.x * scaleX);
            const heartY = svgRect.top + (pointOnPath.y * scaleY);

            heart.style.left = heartX + 'px';
            heart.style.top = heartY + 'px';

            const timelineItems = document.querySelectorAll('.timeline-item');

            timelineItems.forEach((item, index) => {
                const elementPosition = elementPositions[index];
                if (Math.abs(progress - elementPosition) <= ACTIVATION_ZONE) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        }

        let ticking = false;
        function onScroll() {
            if (!ticking) {
                requestAnimationFrame(function () {
                    updateHeartPosition();
                    ticking = false;
                });
                ticking = true;
            }
        }

        window.addEventListener('scroll', onScroll);
        window.addEventListener('resize', updateHeartPosition);
        window.addEventListener('load', updateHeartPosition);

        updateHeartPosition();
    });

    // ===========================
    // УПРАВЛЕНИЕ МУЗЫКОЙ
    // ===========================

    // Функция для управления музыкой
    function initMusicPlayer() {
        const musicPlayer = document.getElementById('weddingMusic');
        const musicControl = document.getElementById('musicControl');
        const musicIcon = document.getElementById('musicIcon');

        // Проверяем, существуют ли элементы
        if (!musicPlayer || !musicControl || !musicIcon) {
            console.warn('Элементы музыкального плеера не найдены');
            return;
        }

        musicPlayer.volume = 0.5; // ← ЭТО МЕСТО! 0.7 = 70% громкости

        // Начинаем воспроизведение автоматически при открытии заставки
        let isPlaying = false;

        // Функция для воспроизведения музыки
        function playMusic() {
            musicPlayer.play().then(() => {
                isPlaying = true;
                musicControl.classList.add('playing');
                musicControl.classList.remove('paused');
                musicIcon.classList.remove('fa-play');
                musicIcon.classList.add('fa-pause');
            }).catch(error => {
                console.log('Автовоспроизведение заблокировано:', error);
                // Если автовоспроизведение заблокировано, показываем кнопку play
                isPlaying = false;
                musicControl.classList.remove('playing');
                musicControl.classList.add('paused');
                musicIcon.classList.remove('fa-pause');
                musicIcon.classList.add('fa-play');
            });
        }

        // Функция для остановки музыки
        function pauseMusic() {
            musicPlayer.pause();
            isPlaying = false;
            musicControl.classList.remove('playing');
            musicControl.classList.add('paused');
            musicIcon.classList.remove('fa-pause');
            musicIcon.classList.add('fa-play');
        }

        // Функция для переключения воспроизведения/паузы
        function toggleMusic() {
            if (isPlaying) {
                pauseMusic();
            } else {
                playMusic();
            }
        }

        // Обработчик клика по кнопке
        musicControl.addEventListener('click', toggleMusic);

        // Обработчик ошибок воспроизведения
        musicPlayer.addEventListener('error', function (e) {
            console.error('Ошибка загрузки аудио:', e);
            musicControl.style.display = 'none'; // Скрываем кнопку при ошибке
        });

        // Автоматически запускаем музыку при открытии конверта
        const stamp = document.getElementById('stamp');
        if (stamp) {
            stamp.addEventListener('click', function () {
                // Ждем немного, чтобы анимация конверта началась
                setTimeout(playMusic, 500);
            });
        }

        // Также можно запускать при загрузке страницы (если конверт уже открыт)
        window.addEventListener('load', function () {
            // Проверяем, открыт ли уже конверт
            const envelopeContainer = document.getElementById('envelopeContainer');
            if (envelopeContainer && envelopeContainer.classList.contains('envelope-open')) {
                setTimeout(playMusic, 1000);
            }
        });
    }

    // Инициализируем музыкальный плеер после загрузки DOM
    document.addEventListener('DOMContentLoaded', initMusicPlayer);

})();
