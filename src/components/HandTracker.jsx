import React, { useEffect, useRef, useState } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import useStore from '../store/useStore';

const HandTracker = () => {
    const videoRef = useRef(null);
    const [landmarker, setLandmarker] = useState(null);
    const setHands = useStore((state) => state.setHands);
    const setCameraPermission = useStore((state) => state.setCameraPermission);

    useEffect(() => {
        const createHandLandmarker = async () => {
            const vision = await FilesetResolver.forVisionTasks(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
            );
            const handLandmarker = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                    delegate: 'GPU',
                },
                runningMode: 'VIDEO',
                numHands: 2,
            });
            setLandmarker(handLandmarker);
        };

        createHandLandmarker();
    }, []);

    useEffect(() => {
        const startWebcam = async () => {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: {
                            facingMode: 'user',
                            width: 1280,
                            height: 720,
                        },
                    });
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.addEventListener('loadeddata', predictWebcam);
                        setCameraPermission(true);
                    }
                } catch (err) {
                    console.error('Error accessing webcam:', err);
                    setCameraPermission(false);
                }
            }
        };

        startWebcam();
    }, [landmarker]);

    const predictWebcam = () => {
        if (videoRef.current && landmarker) {
            const startTimeMs = performance.now();
            if (videoRef.current.currentTime > 0) {
                const result = landmarker.detectForVideo(videoRef.current, startTimeMs);
                if (result.landmarks) {
                    setHands(result.landmarks);
                }
            }
            requestAnimationFrame(predictWebcam);
        }
    };

    return (
        <div className="glass-panel" style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            zIndex: 10,
            opacity: 0.8,
            pointerEvents: 'none',
            padding: '5px',
            borderRadius: '10px',
            overflow: 'hidden'
        }}>
            <div className="scan-line"></div>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ width: '200px', borderRadius: '5px', transform: 'scaleX(-1)', display: 'block' }}
            />
        </div>
    );
};

export default HandTracker;
