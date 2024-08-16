document.addEventListener('DOMContentLoaded', () => {
    const introOverlay = document.querySelector('.intro-overlay');
    const mainSection = document.querySelector('.main');
    const nav = document.querySelector('nav');
    const loadingGif = document.createElement('div');
    const clickSound = new Audio('sound/click.mp3');
    const introOverlaySound = new Audio('sound/intro-overlay.mp3');
    const mainPageSound = new Audio('sound/mainpage.mp3');
    const thudSound = new Audio('sound/thud.mp3');
    const staticSound = new Audio('sound/static.mp3');
    const typingSound = new Audio('sound/typing.mp3');

    // Set volumes
    introOverlaySound.volume = 0.8;
    mainPageSound.volume = 0.4;
    clickSound.volume = 1.0;
    staticSound.volume = 0.5;
    thudSound.volume = 0.8;
    typingSound.volume = 0.4;

    // Play intro overlay sound on page load
    window.addEventListener('load', () => {
        console.log("Page loaded, playing intro overlay sound.");
        introOverlaySound.loop = true;
        introOverlaySound.play();
        window.scrollTo(0, 0); // Ensure page starts at the top
    });

    // Create loading gif element
    loadingGif.style.position = 'fixed';
    loadingGif.style.top = '0';
    loadingGif.style.left = '0';
    loadingGif.style.width = '100%';
    loadingGif.style.height = '100%';
    loadingGif.style.background = 'black url("images/loading.gif") no-repeat center center';
    loadingGif.style.backgroundSize = 'cover';
    loadingGif.style.zIndex = '1001';
    loadingGif.style.display = 'none';
    document.body.appendChild(loadingGif);

    // Play click sound on click
    function playClickSound() {
        clickSound.play();
    }
    document.addEventListener('click', playClickSound);

    // Ensure main section and nav are initially hidden
    mainSection.style.display = 'none';
    nav.style.display = 'none';

    // Handle intro overlay click
    introOverlay.addEventListener('click', () => {
        console.log("Intro overlay clicked.");
        playClickSound();

        console.log("Stopping intro overlay sound.");
        introOverlaySound.pause();
        introOverlaySound.currentTime = 0; // Reset the audio

        loadingGif.style.display = 'block';
        staticSound.play();

        document.body.style.transition = 'background-color 1s';
        document.body.style.backgroundColor = 'black';
        introOverlay.style.transition = 'opacity 1s';
        introOverlay.style.opacity = 0;

        setTimeout(() => {
            introOverlay.style.display = 'none';
            loadingGif.style.display = 'block';
            mainSection.style.display = 'none';
            nav.style.display = 'none';

            setTimeout(() => {
                thudSound.play();
                let fadeOutInterval = setInterval(() => {
                    if (staticSound.volume > 0.1) {
                        staticSound.volume -= 0.1;
                    } else {
                        staticSound.pause();
                        staticSound.currentTime = 0;
                        clearInterval(fadeOutInterval);
                    }
                }, 100);

                setTimeout(() => {
                    loadingGif.style.display = 'none';
                    mainSection.style.display = 'flex';
                    nav.style.display = 'block';
                    document.body.style.backgroundColor = '';

                    mainPageSound.play();
                    mainPageSound.loop = true;
                    console.log("Main page sound started.");

                    // Typing animation
                    const typingContainer = document.getElementById('typing-container');
                    const text = "Welcome to My Portfolio!\nI'm Matthew Burns.\n\nHello! I'm a dedicated IT professional with a Bachelor's degree in Information Technology, majoring in Cybersecurity and Technology. I'm certified in CompTIA Security+ (601) and specialize in Network Analysis and SOC operations.\n\nI'm passionate about cybersecurity and committed to continuous learning and professional growth. Feel free to explore my projects and get to know more about my work. Thank you for visiting!\n\nThis website was developed solely by me.";
                    let index = 0;

                    // Play typing sound and ensure it loops
                    typingSound.loop = true;
                    typingSound.play();

                    function type() {
                        if (index < text.length) {
                            typingContainer.innerHTML += text[index] === '\n' ? '<br>' : text[index];
                            index++;
                            setTimeout(type, 50); // Adjust the speed here
                        } else {
                            typingSound.pause();
                            typingSound.currentTime = 0;
                        }
                    }

                    type();
                }, 1340);
            }, 3000);
        }, 1000);
    });

    document.querySelector('.btn').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector(e.target.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });

    // Animate counters
    let coffeeCounter = document.getElementById('cupsOfCoffee');
    let coffeeCount = 2249;
    setInterval(() => {
        coffeeCount++;
        coffeeCounter.innerText = coffeeCount;
    }, 10000);

    let tasksCounter = document.getElementById('totalTasks');
    let tasksCount = 1079;
    setInterval(() => {
        tasksCount++;
        tasksCounter.innerText = tasksCount;
    }, 5000);
});
