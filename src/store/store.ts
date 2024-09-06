import { create } from "zustand";
import { colors } from "./options";
import { ShaderMaterial } from "three";

interface State {
  backgroundColor: string;
  nodeColor: string;
  setBackgroundColor: (backgroundColor: string) => void;
  setNodeColor: (nodeColor: string) => void;
  grid: number;
  setGrid: (grid: number) => void;

  // patternDotSize: number;
  // patternContrast: number;
  // patternFrequency: number;
  // patternDensityX: number;
  // patternDensityY: number;

  // setPatternDotSize: (size: number) => void;
  // setPatternContrast: (contrast: number) => void;
  // setPatternFrequency: (frequency: number) => void;
  // setPatternDensityX: (density: number) => void;
  // setPatternDensityY: (density: number) => void;

  // gridType: number;
  // gridQuantity: number;

  // setGridType: (type: number) => void;
  // setGridQuantity: (quantity: number) => void;

  patternRef: ShaderMaterial | null;
  setPatternRef: (ref: ShaderMaterial) => void;
}

const useStore = create<State>((set) => ({
  backgroundColor: colors[0],
  nodeColor: colors[1],
  setBackgroundColor: (backgroundColor) => set(() => ({ backgroundColor })),
  setNodeColor: (nodeColor) => set(() => ({ nodeColor })),
  grid: 0,
  setGrid: (grid: number) => set(() => ({ grid })),

  // ...patternSettings,
  // setPatternDotSize: (size) => set(() => ({ patternDotSize: size })),
  // setPatternContrast: (contrast) => set(() => ({ patternContrast: contrast })),
  // setPatternFrequency: (frequency) =>
  //   set(() => ({ patternFrequency: frequency })),
  // setPatternDensityX: (density) => set(() => ({ patternDensityX: density })),
  // setPatternDensityY: (density) => set(() => ({ patternDensityY: density })),

  // ...gridSettings,
  // setGridType: (type) => set(() => ({ gridType: type })),
  // setGridQuantity: (quantity) => set(() => ({ gridQuantity: quantity })),

  patternRef: null,
  setPatternRef: (ref) => set(() => ({ patternRef: ref })),
}));

useStore.subscribe((state) => console.log(state));

export default useStore;
