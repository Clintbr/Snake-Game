# Snake 3D Game - Dokumentation

![Snake 3D Game](https://img.shields.io/badge/Version-1.0.0-brightgreen.svg)
![Three.js](https://img.shields.io/badge/Three.js-r128-blue.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

Ein modernes 3D-Snake-Spiel, entwickelt mit Three.js, das ein immersives Spielerlebnis in einer dreidimensionalen Welt mit realistischen Bäumen und Hindernissen bietet.

![Snake 3D Game Screenshot](https://via.placeholder.com/800x400/1a2a3a/ffffff?text=Snake+3D+Game)

## 🎮 Funktionen

- **3D-Spielumgebung**: Erlebe Snake in einer vollständig dreidimensionalen Welt
- **Realistische Grafik**: Detailreiche Bäume und natürliche Umgebung
- **Hintergrundmusik**: Anpassbare Soundkulisse mit Lautstärkeregler
- **Erweitertes Spielfeld**: Großzügige Spielarena mit sichtbaren Grenzen
- **Responsive Design**: Optimiert für Desktop- und Mobile-Geräte
- **Highscore-System**: Lokale Speicherung der Bestwerte
- **Intuitive Steuerung**: Einfache Bedienung mit Tastatur oder Touch

## 📁 Projektstruktur

```
Snake-Game/
│
├── music/
│   └── music_background/
│       └── epic-adventure-124947.mp3
│
├── index.html          # Haupt-HTML-Datei
├── style.css           # Styling und Responsive Design
└── script.js           # Spiel-Logik und Three.js-Implementierung
```

## 🚀 Installation

1. **Repository klonen**:
   ```bash
   git clone https://github.com/your-username/snake-3d-game.git
   cd snake-3d-game
   ```

2. **Musikdatei hinzufügen**:
   - Laden Sie die Hintergrundmusik von [Pixabay](https://pixabay.com/music/epic-adventure-124947/) herunter
   - Speichern Sie die Datei im Ordner `music/music_background/` als `epic-adventure-124947.mp3`

3. **Spiel starten**:
   - Öffnen Sie die `index.html` in einem modernen Webbrowser
   - Oder nutzen Sie einen lokalen Server:
     ```bash
     # Mit Python
     python -m http.server 8000
     
     # Mit Node.js (http-server benötigt)
     npx http-server
     ```

## 🎯 Spielsteuerung

### Tastatur:
- **Pfeiltasten** oder **W, A, S, D**: Schlange bewegen
- **P**: Spiel pausieren/fortsetzen
- **M**: Musik ein-/ausschalten
- **R**: Spiel neustarten

### Touch-Geräte:
- Die Steuerungstasten werden auf mobilen Geräten automatisch angezeigt

## 🎨 Technische Implementierung

### Verwendete Technologien:
- **Three.js r128**: 3D-Grafikrendering
- **HTML5 Canvas**: Zeichenfläche für die 3D-Szene
- **CSS3**: Styling und Animationen
- **Vanilla JavaScript**: Spiellogik und Interaktion

### Hauptkomponenten:

#### 1. 3D-Szene (script.js)
```javascript
// Three.js Initialisierung
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game-canvas'), antialias: true });
```

#### 2. Spielobjekte
- **Schlange**: Aus mehreren sphärischen Segmenten
- **Bäume**: Realistische 3D-Modelle mit Stämmen und Blättern
- **Futter**: Leuchtende sphärische Objekte
- **Boden**: Texturierte Ebene mit Raster

#### 3. Musiksystem
```javascript
// Hintergrundmusik
let backgroundMusic = new Audio('music/music_background/epic-adventure-124947.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;
```

## ⚙️ Anpassungen

### Schwierigkeitsgrad:
Passen Sie die Geschwindigkeit in `script.js` an:
```javascript
let snakeSpeed = 150; // Niedrigere Werte = schnelleres Spiel
```

### Spielfeldgröße:
Ändern Sie die Boundary-Größe:
```javascript
let boundarySize = 40; // Größere Werte = größeres Spielfeld
```

### Musik:
Ersetzen Sie die Musikdatei im Ordner `music/music_background/` und aktualisieren Sie den Pfad in `script.js`.

## 🌐 Browserkompatibilität

| Browser | Unterstützung |
|---------|---------------|
| Chrome | ✅ Vollständig |
| Firefox | ✅ Vollständig |
| Safari | ✅ Vollständig |
| Edge | ✅ Vollständig |
| Mobile Browser | ✅ Eingeschränkt (leistungsabhängig) |

## 📝 Entwicklerhinweise

### Erweiterungsmöglichkeiten:
1. **Mehr Obstsorten**: Verschiedene Arten von Futter mit unterschiedlichen Punkten
2. **Power-Ups**: Temporäre Fähigkeiten wie Geschwindigkeitsboost oder Unverwundbarkeit
3. **Level-System**: Verschiedene Schwierigkeitsstufen mit steigendem Anspruch
4. **Multiplayer**: Wettkampfmodus für zwei Spieler

### Performance-Optimierung:
- Für langsamere Geräte: Reduzieren Sie die Anzahl der Bäume
- Qualitätseinstellungen: Verringern Sie die Geometrie-Details der 3D-Objekte

## 🐛 Bekannte Probleme

1. **Autoplay-Einschränkungen**: Einige Browser blockieren automatisches Abspielen von Audio
   - Lösung: Musik muss manuell aktiviert werden
2. **Mobile Performance**: Auf älteren Mobilgeräten kann die Performance eingeschränkt sein
3. **Touch-Steuerung**: Die Steuerung auf Touch-Geräten ist weniger präzise

## 📄 Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Siehe die [LICENSE](LICENSE)-Datei für Details.

## 👥 Beitragende

- [Ihr Name] - Hauptentwickler
- [Mitwirkende] - Weitere Beitragende

## 🙏 Danksagungen

- **Three.js Team** für die leistungsstarke 3D-Bibliothek
- **Pixabay** für die bereitgestellte Hintergrundmusik
- **Contributors** für Feedback und Verbesserungsvorschläge

---

**Viel Spaß beim Spielen!** 🐍🎮

Für Fragen oder Unterstützung wenden Sie sich bitte an [ihre-email@example.com] oder erstellen Sie ein Issue im GitHub-Repository.
