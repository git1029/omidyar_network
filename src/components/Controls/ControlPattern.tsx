import { patternSettings } from "../../store/options";
import useStore from "../../store/store";
// import ControlGrid from "./ControlGrid";
import ControlGroup from "./ControlGroup";
import Slider from "./Slider";

const ControlPattern = () => {
  // const dotSize = useStore((state) => state.dotSize);
  const patternRef = useStore((state) => state.patternRef);

  // const updateUniform = (uniform: string | string[], value: number) => {
  //   if (patternRef) {
  //     if (typeof uniform === 'string') {
  //       patternRef.uniforms[uniform].value = value
  //     } else if (Array.isArray(uniform)) {

  //     }
  //   }
  // }

  const patternSliders = [
    {
      label: "Dot Size",
      defaultValue: patternSettings.patternDotSize,
      onChange: (value: number) => {
        if (patternRef) {
          patternRef.uniforms.uDotSize.value = value;
        }
      },
    },
    {
      label: "Contrast",
      defaultValue: patternSettings.patternContrast,
      onChange: (value: number) => {
        if (patternRef) {
          patternRef.uniforms.uInputContrast.value = value;
        }
      },
    },
    // { label: "Frequency" },
    // {
    //   label: "Horizontal Density",
    //   defaultValue: patternSettings.patternDensityX,
    //   onChange: (value: number) => {
    //     if (patternRef) {
    //       patternRef.uniforms.uDensity.value.x = value;
    //     }
    //   },
    // },
    // {
    //   label: "Vertical Density",
    //   defaultValue: patternSettings.patternDensityY,
    //   onChange: (value: number) => {
    //     if (patternRef) {
    //       patternRef.uniforms.uDensity.value.y = value;
    //     }
    //   },
    // },
  ];

  // const options = [
  //   {
  //     label: "Square",
  //     value: 0,
  //   },
  //   { label: "Isometric", value: 1 },
  // ];

  return (
    <ControlGroup title="Pattern Control">
      {patternSliders.map((s) => (
        <Slider key={s.label} {...s} />
      ))}
    </ControlGroup>
  );
};

export default ControlPattern;
