import { create } from 'zustand';

const useStore = create((set) => ({
  hands: [],
  setHands: (hands) => set({ hands }),
  cameraPermission: false,
  setCameraPermission: (status) => set({ cameraPermission: status }),
}));

export default useStore;
