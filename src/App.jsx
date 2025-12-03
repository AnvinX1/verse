import React from 'react';
import Experience from './components/Experience';
import HandTracker from './components/HandTracker';
import useStore from './store/useStore';

function App() {
  const cameraPermission = useStore((state) => state.cameraPermission);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <HandTracker />
      <Experience />

      {!cameraPermission && (
        <div className="glass-panel" style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: '40px',
          borderRadius: '20px',
          textAlign: 'center',
          pointerEvents: 'none',
          zIndex: 20
        }}>
          <h1 style={{ margin: '0 0 20px 0', textShadow: '0 0 10px #00ffff' }}>INITIALIZING UNIVERSE</h1>
          <p>Awaiting Neural Link (Camera Access)...</p>
        </div>
      )}

      {cameraPermission && (
        <div className="glass-panel" style={{
          position: 'absolute',
          top: 30,
          left: 30,
          padding: '20px',
          borderRadius: '15px',
          pointerEvents: 'none',
          zIndex: 20
        }}>
          <h3 style={{ margin: '0 0 10px 0', textShadow: '0 0 5px #00ffff' }}>SYSTEM ACTIVE</h3>
          <p style={{ margin: 0, fontSize: '0.9em', opacity: 0.8 }}>
            ONE HAND: GRAVITY CONTROL<br />
            TWO HANDS: SPATIAL WARP
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
