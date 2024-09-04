import { create } from "zustand";

interface State {
  bears: number;
  increasePopulation: () => void;
  removeAllBears: () => void;
}

const useStore = create<State>((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
}));

useStore.subscribe((state) => console.log(state));

export default useStore;
