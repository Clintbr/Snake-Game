document.addEventListener('DOMContentLoaded', () => {
    // Variablen für das Spiel
    let scene, camera, renderer, controls;
    let snake = [];
    let food = null;
    let direction = 'right';
    let nextDirection = 'right';
    let gameInterval;
    let score = 0;
    let highScore = localStorage.getItem('snake3DHighScore') || 0;
    let gameRunning = false;
    let gamePaused = false;
    let obstacles = [];
    let gridSize = 20;
    let snakeSpeed = 150; // ms zwischen Bewegungen
    let boundarySize = 40; // Vergrößertes Spielfeld
    let boundaryWarning = document.getElementById('boundary-warning');
    let backgroundMusic = new Audio('music/music_background.mp3');
    let musicEnabled = true;
    let musicToggleButton = document.getElementById('music-toggle');
    let volumeSlider = document.getElementById('volume-slider');

    // Musik konfigurieren
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.5;

    // UI Elemente
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const finalScoreElement = document.getElementById('final-score');
    const gameOverScreen = document.getElementById('game-over');
    const startButton = document.getElementById('start-button');
    const pauseButton = document.getElementById('pause-button');
    const restartButton = document.getElementById('restart-button');
    const restartGameButton = document.getElementById('restart-game-button');

    // Highscore anzeigen
    highScoreElement.textContent = highScore;

    // Musik-Event-Listener
    musicToggleButton.addEventListener('click', toggleMusic);
    volumeSlider.addEventListener('input', adjustVolume);

    // Musik-Funktionen
    function toggleMusic() {
        musicEnabled = !musicEnabled;

        if (musicEnabled) {
            backgroundMusic.play().catch(error => {
                console.log("Autoplay wurde blockiert:", error);
            });
            musicToggleButton.textContent = "Musik: Ein";
        } else {
            backgroundMusic.pause();
            musicToggleButton.textContent = "Musik: Aus";
        }
    }

    function adjustVolume() {
        backgroundMusic.volume = volumeSlider.value;
    }

    // Musik automatisch starten (mit Nutzerinteraktion)
    document.body.addEventListener('click', function initMusic() {
        if (musicEnabled) {
            backgroundMusic.play().catch(error => {
                console.log("Autoplay wurde blockiert:", error);
            });
        }
        document.body.removeEventListener('click', initMusic);
    }, { once: true });

    // Three.js initialisieren
    function initThreeJS() {
        // Szene erstellen
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0d1b2a);
        scene.fog = new THREE.Fog(0x0d1b2a, 50, 100);

        // Kamera erstellen
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 30, 40);
        camera.lookAt(0, 0, 0);

        // Renderer erstellen
        renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('game-canvas'),
            antialias: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;

        // Beleuchtung hinzufügen
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(20, 40, 20);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);

        // Boden erstellen (viel größer)
        const groundGeometry = new THREE.PlaneGeometry(200, 200, 20, 20);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x1b3a4b,
            roughness: 0.8,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        // Raster für den Boden hinzufügen
        const gridHelper = new THREE.GridHelper(200, 40, 0x000000, 0x000000);
        gridHelper.material.opacity = 0.2;
        gridHelper.material.transparent = true;
        scene.add(gridHelper);

        // Sichtbare Begrenzung hinzufügen
        const boundaryGeometry = new THREE.RingGeometry(boundarySize - 0.5, boundarySize, 64);
        const boundaryMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.3
        });
        const boundary = new THREE.Mesh(boundaryGeometry, boundaryMaterial);
        boundary.rotation.x = -Math.PI / 2;
        boundary.position.y = 0.1;
        scene.add(boundary);

        // Kamera-Steuerung
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 15;
        controls.maxDistance = 100;
        controls.maxPolarAngle = Math.PI / 2 - 0.1;

        // Render-Loop
        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }
        animate();

        // Fenstergröße anpassen
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    // Spiel initialisieren
    function initGame() {
        // Alte Objekte entfernen
        while(scene.children.length > 5) { // Behalte Licht, Boden, Grid und Begrenzung
            scene.remove(scene.children[5]);
        }

        snake = [];
        obstacles = [];
        boundaryWarning.textContent = '';

        // Schlange erstellen
        createSnake();

        // Essen platzieren
        placeFood();

        // Hindernisse und Bäume platzieren (viel mehr Bäume)
        createObstacles();

        // Spielstatus zurücksetzen
        score = 0;
        scoreElement.textContent = score;
        direction = 'right';
        nextDirection = 'right';

        // Event-Listener für Tastatureingaben
        document.addEventListener('keydown', handleKeyPress);
        startButton.addEventListener('click', startGame);
        pauseButton.addEventListener('click', togglePause);
        restartButton.addEventListener('click', restartGame);
        restartGameButton.addEventListener('click', restartGame);
    }

    // Schlange erstellen
    function createSnake() {
        // Kopf der Schlange
        const headGeometry = new THREE.SphereGeometry(0.8, 32, 32);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0x1e3a5f });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 0.8, 0);
        head.castShadow = true;
        scene.add(head);

        // Zwei weitere Segmente
        for (let i = 1; i <= 2; i++) {
            const segmentGeometry = new THREE.SphereGeometry(0.7, 32, 32);
            const segmentMaterial = new THREE.MeshStandardMaterial({ color: 0x3a5f90 });
            const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
            segment.position.set(-i, 0.7, 0);
            segment.castShadow = true;
            scene.add(segment);

            snake.push({
                mesh: segment,
                x: -i,
                y: 0,
                prevX: -i,
                prevY: 0
            });
        }

        // Kopf am Ende hinzufügen, damit er vorne ist
        snake.unshift({
            mesh: head,
            x: 0,
            y: 0,
            prevX: 0,
            prevY: 0
        });
    }

    // Essen platzieren
    function placeFood() {
        // Altes Essen entfernen
        if (food) {
            scene.remove(food.mesh);
        }

        const foodGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const foodMaterial = new THREE.MeshStandardMaterial({
            color: 0xff4757,
            emissive: 0xff4757,
            emissiveIntensity: 0.5
        });
        const foodMesh = new THREE.Mesh(foodGeometry, foodMaterial);
        foodMesh.castShadow = true;

        // Zufällige Position innerhalb des erweiterten Spielfelds
        const maxPos = boundarySize - 5; // Lasse einen Rand von 5 Einheiten
        const foodX = Math.floor(Math.random() * (maxPos * 2 + 1)) - maxPos;
        const foodY = Math.floor(Math.random() * (maxPos * 2 + 1)) - maxPos;

        foodMesh.position.set(foodX, 0.5, foodY);
        scene.add(foodMesh);

        food = {
            mesh: foodMesh,
            x: foodX,
            y: foodY
        };

        // Sicherstellen, dass das Essen nicht auf der Schlange erscheint
        for (let segment of snake) {
            if (segment.x === food.x && segment.y === food.y) {
                return placeFood();
            }
        }

        // Sicherstellen, dass das Essen nicht auf einem Hindernis erscheint
        for (let obstacle of obstacles) {
            if (obstacle.x === food.x && obstacle.y === food.y) {
                return placeFood();
            }
        }
    }

    // Hindernisse und Bäume erstellen (viel mehr Bäume)
    function createObstacles() {
        const obstacleCount = 50; // Viel mehr Bäume
        const maxPos = boundarySize - 2; // Lasse einen Rand von 2 Einheiten

        for (let i = 0; i < obstacleCount; i++) {
            // Zufällige Position
            const x = Math.floor(Math.random() * (maxPos * 2 + 1)) - maxPos;
            const y = Math.floor(Math.random() * (maxPos * 2 + 1)) - maxPos;

            // Sicherstellen, dass kein Hindernis auf der Startposition der Schlange erscheint
            if ((x >= -3 && x <= 1 && y >= -1 && y <= 1)) {
                continue;
            }

            // Verschiedene Baumtypen zufällig auswählen
            const treeType = Math.floor(Math.random() * 3);
            let obstacleMesh;

            // Immer Bäume erstellen (keine Felsen)
            const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
            const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 1;
            trunk.castShadow = true;

            const leavesGeometry = new THREE.SphereGeometry(1, 32, 32);
            let leavesColor;

            // Unterschiedliche Baumtypen mit verschiedenen Farben
            switch(treeType) {
                case 0:
                    leavesColor = 0x228B22; // Dunkelgrün
                    break;
                case 1:
                    leavesColor = 0x32CD32; // Hellgrün
                    break;
                case 2:
                    leavesColor = 0x006400; // Tiefgrün
                    break;
            }

            const leavesMaterial = new THREE.MeshStandardMaterial({ color: leavesColor });
            const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
            leaves.position.y = 2.5;
            leaves.castShadow = true;

            // Bei einigen Bäumen eine zweite Ebene an Blättern hinzufügen
            if (Math.random() > 0.5) {
                const leaves2 = new THREE.Mesh(leavesGeometry, leavesMaterial);
                leaves2.position.y = 3.2;
                leaves2.scale.set(0.8, 0.8, 0.8);
                leaves2.castShadow = true;
                trunk.add(leaves2);
            }

            trunk.add(leaves);
            obstacleMesh = trunk;

            obstacleMesh.position.set(x, 0, y);
            scene.add(obstacleMesh);

            obstacles.push({
                mesh: obstacleMesh,
                x: x,
                y: y
            });
        }
    }

    // Spiel starten
    function startGame() {
        if (!gameRunning) {
            gameRunning = true;
            gamePaused = false;
            gameInterval = setInterval(gameLoop, snakeSpeed);
            startButton.textContent = "Neustart";

            // Musik starten, wenn aktiviert
            if (musicEnabled) {
                backgroundMusic.play().catch(error => {
                    console.log("Musik konnte nicht gestartet werden:", error);
                });
            }
        } else {
            restartGame();
        }
    }

    // Pause umschalten
    function togglePause() {
        if (gameRunning && !gamePaused) {
            clearInterval(gameInterval);
            gamePaused = true;
            pauseButton.textContent = "Weiter";

            // Musik pausieren
            backgroundMusic.pause();
        } else if (gameRunning && gamePaused) {
            gameInterval = setInterval(gameLoop, snakeSpeed);
            gamePaused = false;
            pauseButton.textContent = "Pause";

            // Musik fortsetzen, wenn aktiviert
            if (musicEnabled) {
                backgroundMusic.play().catch(error => {
                    console.log("Musik konnte nicht gestartet werden:", error);
                });
            }
        }
    }

    // Spiel neustarten
    function restartGame() {
        clearInterval(gameInterval);
        gameOverScreen.classList.remove('show');
        initGame();
        startGame();
    }

    // Hauptspielschleife
    function gameLoop() {
        moveSnake();
        checkCollision();
        checkBoundaryWarning();
    }

    // Warnung anzeigen, wenn die Schlange nahe am Rand ist
    function checkBoundaryWarning() {
        const head = snake[0];
        const warningDistance = 5;

        if (Math.abs(head.x) > boundarySize - warningDistance || Math.abs(head.y) > boundarySize - warningDistance) {
            boundaryWarning.textContent = 'ACHTUNG: Du näherst dich dem Spielfeldrand!';
        } else {
            boundaryWarning.textContent = '';
        }
    }

    // Schlange bewegen
    function moveSnake() {
        direction = nextDirection;

        // Vorherige Positionen speichern
        for (let segment of snake) {
            segment.prevX = segment.x;
            segment.prevY = segment.y;
        }

        // Kopf der Schlange basierend auf der Richtung bewegen
        const head = snake[0];

        switch(direction) {
            case 'up':
                head.y--;
                break;
            case 'down':
                head.y++;
                break;
            case 'left':
                head.x--;
                break;
            case 'right':
                head.x++;
                break;
        }

        // Körperteile bewegen
        for (let i = 1; i < snake.length; i++) {
            snake[i].x = snake[i-1].prevX;
            snake[i].y = snake[i-1].prevY;
        }

        // Meshes aktualisieren
        for (let segment of snake) {
            segment.mesh.position.x = segment.x;
            segment.mesh.position.z = segment.y;

            // Sanfte Animation hinzufügen
            segment.mesh.position.y = 0.7 + 0.1 * Math.sin(Date.now() * 0.01);
        }
    }

    // Kollisionserkennung
    function checkCollision() {
        const head = snake[0];

        // Kollision mit den Begrenzungen
        if (Math.abs(head.x) > boundarySize || Math.abs(head.y) > boundarySize) {
            gameOver();
            return;
        }

        // Kollision mit dem eigenen Körper
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                gameOver();
                return;
            }
        }

        // Kollision mit Hindernissen
        for (let obstacle of obstacles) {
            if (head.x === obstacle.x && head.y === obstacle.y) {
                gameOver();
                return;
            }
        }

        // Prüfen, ob die Schlange das Essen frisst
        if (head.x === food.x && head.y === food.y) {
            // Punktestand erhöhen
            score += 10;
            scoreElement.textContent = score;

            // Schlange wachsen lassen
            growSnake();

            // Neues Essen platzieren
            placeFood();

            // Schwierigkeit erhöhen
            if (score % 50 === 0 && snakeSpeed > 50) {
                clearInterval(gameInterval);
                snakeSpeed -= 10;
                gameInterval = setInterval(gameLoop, snakeSpeed);
            }
        }
    }

    // Schlange wachsen lassen
    function growSnake() {
        const lastSegment = snake[snake.length - 1];

        const segmentGeometry = new THREE.SphereGeometry(0.7, 32, 32);
        const segmentMaterial = new THREE.MeshStandardMaterial({ color: 0x3a5f90 });
        const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
        segment.position.set(lastSegment.prevX, 0.7, lastSegment.prevY);
        segment.castShadow = true;
        scene.add(segment);

        snake.push({
            mesh: segment,
            x: lastSegment.prevX,
            y: lastSegment.prevY,
            prevX: lastSegment.prevX,
            prevY: lastSegment.prevY
        });
    }

    // Spielende
    function gameOver() {
        clearInterval(gameInterval);
        gameRunning = false;

        // Musik pausieren
        backgroundMusic.pause();

        // Highscore aktualisieren, falls nötig
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snake3DHighScore', highScore);
            highScoreElement.textContent = highScore;
        }

        // Finalen Punktestand anzeigen
        finalScoreElement.textContent = score;

        // Game Over Screen anzeigen
        gameOverScreen.classList.add('show');
    }

    // Tastatureingaben verarbeiten
    function handleKeyPress(e) {
        if (!gameRunning || gamePaused) return;

        // Richtung basierend auf Tastendruck ändern
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (direction !== 'down') nextDirection = 'up';
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (direction !== 'up') nextDirection = 'down';
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (direction !== 'right') nextDirection = 'left';
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (direction !== 'left') nextDirection = 'right';
                break;
            case 'm':
            case 'M':
                toggleMusic();
                break;
        }
    }

    // Spiel initialisieren
    initThreeJS();
    initGame();
});