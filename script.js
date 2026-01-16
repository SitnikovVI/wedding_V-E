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




// ===========================
// КАРУСЕЛЬ ФОТОГРАФИЙ
// ===========================

document.addEventListener('DOMContentLoaded', function () {
    const carouselTrack = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const carouselDots = document.getElementById('carouselDots');

    if (!carouselTrack) return;

    // Настройки карусели
    const config = {
        originalImages: 7, // Количество оригинальных изображений
        imageBaseName: 'images/карусель_', // Базовое имя файлов
        imageExtension: '.jpg', // Расширение файлов
        autoPlay: true, // Автоматическая смена слайдов
        autoPlayInterval: 5000, // Интервал в миллисекундах (5 секунд)
        infiniteScroll: true // Бесконечная прокрутка
    };

    let currentSlide = 1; // Начинаем с первого оригинала (индекс 1, так как 0 - клон последнего)
    let autoPlayTimer = null;
    let isAnimating = false;
    let allowTransition = true; // Разрешение на анимацию

    // Функция для инициализации карусели
    function initCarousel() {
        // Создаем слайды
        for (let i = 1; i <= config.originalImages; i++) {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            slide.dataset.index = i - 1;

            const image = document.createElement('img');
            image.src = `${config.imageBaseName}${i}${config.imageExtension}`;
            image.alt = `Фотография свадебного места ${i}`;
            image.className = 'carousel-image';
            image.loading = 'lazy';

            const overlay = document.createElement('div');
            overlay.className = 'carousel-slide-overlay';

            const title = document.createElement('p');
            title.className = 'carousel-slide-title';

            const number = document.createElement('p');
            number.className = 'carousel-slide-number';

            overlay.appendChild(title);
            overlay.appendChild(number);
            slide.appendChild(image);
            slide.appendChild(overlay);
            carouselTrack.appendChild(slide);
        }

        const slides = carouselTrack.querySelectorAll('.carousel-slide');

        // Клонируем для бесконечной прокрутки
        if (config.infiniteScroll && slides.length > 0) {
            // Клонируем последний слайд и добавляем в начало
            const lastClone = slides[slides.length - 1].cloneNode(true);
            lastClone.classList.add('clone');
            lastClone.dataset.clone = 'last';
            carouselTrack.insertBefore(lastClone, slides[0]);

            // Клонируем первый слайд и добавляем в конец
            const firstClone = slides[0].cloneNode(true);
            firstClone.classList.add('clone');
            firstClone.dataset.clone = 'first';
            carouselTrack.appendChild(firstClone);
        }

        // Создаем точки-индикаторы
        if (carouselDots) {
            for (let i = 0; i < config.originalImages; i++) {
                const dot = document.createElement('button');
                dot.className = 'carousel-dot';
                if (i === 0) dot.classList.add('active');
                dot.dataset.index = i;
                dot.addEventListener('click', () => goToSlide(i));
                carouselDots.appendChild(dot);
            }
        }

        // Устанавливаем начальную позицию
        updateCarouselPosition(false); // false - без анимации для начальной позиции

        // Добавляем обработчики для кнопок
        if (prevBtn) {
            prevBtn.addEventListener('click', () => changeSlide(-1));
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => changeSlide(1));
        }

        // Добавляем обработчики для свайпов
        setupTouchEvents();

        // Запускаем автоплей
        if (config.autoPlay) {
            startAutoPlay();
            carouselTrack.addEventListener('mouseenter', stopAutoPlay);
            carouselTrack.addEventListener('mouseleave', startAutoPlay);
            carouselTrack.addEventListener('touchstart', stopAutoPlay);
        }
    }

    // Функция для смены слайда
    function changeSlide(direction) {
        if (isAnimating) return;

        isAnimating = true;
        const totalSlides = carouselTrack.children.length;

        // Вычисляем новый индекс
        let newSlide = currentSlide + direction;

        // Проверяем, достигли ли мы границ
        const isAtLastOriginal = (currentSlide === totalSlides - 2 && direction === 1);
        const isAtFirstOriginal = (currentSlide === 1 && direction === -1);

        if (config.infiniteScroll) {
            if (isAtLastOriginal) {
                // Переход от последнего оригинала к первому (через клон)
                currentSlide = totalSlides - 1; // Клон первого слайда
                updateCarouselPosition(true); // Анимируем к клону

                // После анимации к клону, мгновенно переходим к первому оригиналу
                setTimeout(() => {
                    allowTransition = false; // Временно отключаем анимацию
                    carouselTrack.style.transition = 'none';
                    currentSlide = 1; // Первый оригинальный слайд
                    updateCarouselPosition(false); // Без анимации

                    // Включаем анимацию снова
                    setTimeout(() => {
                        carouselTrack.style.transition = 'transform 0.5s ease-in-out';
                        allowTransition = true;
                        isAnimating = false;
                    }, 50);
                }, 500); // Ждем завершения анимации (0.5s)
            } else if (isAtFirstOriginal) {
                // Переход от первого оригинала к последнему (через клон)
                currentSlide = 0; // Клон последнего слайда
                updateCarouselPosition(true); // Анимируем к клону

                // После анимации к клону, мгновенно переходим к последнему оригиналу
                setTimeout(() => {
                    allowTransition = false; // Временно отключаем анимацию
                    carouselTrack.style.transition = 'none';
                    currentSlide = totalSlides - 2; // Последний оригинальный слайд
                    updateCarouselPosition(false); // Без анимации

                    // Включаем анимацию снова
                    setTimeout(() => {
                        carouselTrack.style.transition = 'transform 0.5s ease-in-out';
                        allowTransition = true;
                        isAnimating = false;
                    }, 50);
                }, 500); // Ждем завершения анимации (0.5s)
            } else {
                // Обычный переход
                currentSlide = newSlide;
                updateCarouselPosition(true);
                setTimeout(() => {
                    isAnimating = false;
                }, 500);
            }
        } else {
            // Обычная прокрутка без бесконечности
            if (newSlide >= 0 && newSlide < totalSlides) {
                currentSlide = newSlide;
                updateCarouselPosition(true);
                setTimeout(() => {
                    isAnimating = false;
                }, 500);
            } else {
                isAnimating = false;
            }
        }

        // Обновляем точки
        updateDots();

        // Перезапускаем автоплей
        if (config.autoPlay) {
            restartAutoPlay();
        }
    }

    // Функция для перехода к конкретному слайду
    function goToSlide(index) {
        if (isAnimating) return;

        isAnimating = true;

        // Для бесконечной карусели: оригинальные слайды начинаются с индекса 1
        currentSlide = config.infiniteScroll ? index + 1 : index;

        updateCarouselPosition(true);
        updateDots();

        setTimeout(() => {
            isAnimating = false;
        }, 500);

        // Перезапускаем автоплей
        if (config.autoPlay) {
            restartAutoPlay();
        }
    }

    // Функция для обновления позиции карусели
    function updateCarouselPosition(withTransition = true) {
        if (!withTransition || !allowTransition) {
            carouselTrack.style.transition = 'none';
        } else {
            carouselTrack.style.transition = 'transform 0.5s ease-in-out';
        }

        carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    }

    // Функция для обновления точек
    function updateDots() {
        if (!carouselDots) return;

        const dots = carouselDots.querySelectorAll('.carousel-dot');
        let activeDotIndex;

        if (config.infiniteScroll) {
            const totalSlides = carouselTrack.children.length;

            // Конвертируем индекс для отображения в точках
            if (currentSlide === 0) {
                activeDotIndex = config.originalImages - 1; // Клон последнего -> последний оригинальный
            } else if (currentSlide === totalSlides - 1) {
                activeDotIndex = 0; // Клон первого -> первый оригинальный
            } else {
                activeDotIndex = currentSlide - 1; // Оригинальные слайды
            }
        } else {
            activeDotIndex = currentSlide;
        }

        dots.forEach((dot, index) => {
            if (index === activeDotIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // Функция для автоплея
    function startAutoPlay() {
        if (autoPlayTimer) clearInterval(autoPlayTimer);

        autoPlayTimer = setInterval(() => {
            changeSlide(1);
        }, config.autoPlayInterval);
    }

    function stopAutoPlay() {
        if (autoPlayTimer) {
            clearInterval(autoPlayTimer);
            autoPlayTimer = null;
        }
    }

    function restartAutoPlay() {
        stopAutoPlay();
        startAutoPlay();
    }

    // Функция для обработки свайпов на мобильных
    function setupTouchEvents() {
        let startX = 0;
        let endX = 0;
        const minSwipeDistance = 50;

        carouselTrack.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        }, { passive: true });

        carouselTrack.addEventListener('touchmove', (e) => {
            endX = e.touches[0].clientX;
        }, { passive: true });

        carouselTrack.addEventListener('touchend', () => {
            const diffX = startX - endX;

            if (Math.abs(diffX) > minSwipeDistance) {
                if (diffX > 0) {
                    changeSlide(1); // Свайп влево -> следующий
                } else {
                    changeSlide(-1); // Свайп вправо -> предыдущий
                }
            }
        });
    }

    // Инициализируем карусель
    initCarousel();

    // Добавляем обработчик клавиатуры для доступности
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            changeSlide(-1);
            e.preventDefault();
        } else if (e.key === 'ArrowRight') {
            changeSlide(1);
            e.preventDefault();
        }
    });
});





// -------------------------------
// Анимация сердца по таймлайну
// -------------------------------
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
