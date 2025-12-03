# 🌌 Interstellar Particle Universe

A mesmerizing, interactive 3D particle simulation inspired by the black hole "Gargantua" from the movie *Interstellar*. Controlled entirely by your hand gestures via webcam.

![Interstellar Theme](https://img.shields.io/badge/Theme-Interstellar-orange)
![Tech](https://img.shields.io/badge/Tech-React%20%7C%20Three.js%20%7C%20MediaPipe-blue)

## ✨ Features

### 🖐️ Hand Gesture Control
Control the universe with your bare hands using advanced computer vision.
- **One Hand**: Move the black hole through space.
- **Two Hands**: Warp space-time (Expand/Contract the universe).
- **Fist (Implosion)**: Close your hand to trigger a massive gravity spike, crushing particles into the event horizon.

### 🎨 Cinematic Visuals
- **Accretion Disk**: 15,000 individual particles forming a swirling disk around a central event horizon.
- **Bloom Effects**: Post-processing glow for a realistic sci-fi aesthetic.
- **Dynamic Physics**: Particles react to gravity, inertia, and "implosion" forces with smooth, weighted motion.

### 💻 Futuristic UI
- Glassmorphism interface.
- "Orbitron" sci-fi typography.
- Scanning HUD overlay for the webcam feed.

## 🚀 Getting Started

### Prerequisites
- Node.js installed.
- A webcam.

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/interstellar-verse.git
    cd interstellar-verse
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:5173](http://localhost:5173) in your browser.
5.  **Allow Camera Access** when prompted.

## 🛠️ Tech Stack

- **[React](https://reactjs.org/)**: UI Framework.
- **[Three.js](https://threejs.org/)** & **[React Three Fiber](https://docs.pmnd.rs/react-three-fiber)**: 3D Rendering.
- **[MediaPipe](https://developers.google.com/mediapipe)**: Real-time hand tracking.
- **[Zustand](https://github.com/pmndrs/zustand)**: State management.
- **[Postprocessing](https://github.com/pmndrs/postprocessing)**: Bloom and visual effects.

## 🎮 Controls

| Gesture | Action |
| :--- | :--- |
| **Open Hand** | Move the Black Hole |
| **Closed Fist** | **IMPLOSION** (Gravity Spike) |
| **Two Hands (Move Apart)** | Expand Universe |
| **Two Hands (Move Together)** | Shrink Universe |

---

*Created with ❤️ by Antigravity*
