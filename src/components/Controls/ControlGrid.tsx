import { useEffect, useState } from "react";
import {
  connectorOptions,
  gridOptions,
  gridSettingsDefault,
} from "../../store/options";
import useStore from "../../store/store";
// import ControlGroup from "./ControlGroup";
import Slider from "../Core/Slider";
// import Toggle from "./Toggle";
import Toggle from "../Core/Toggle";
import Control from "../Core/Control";
// import ControlRatio from "./ControlRatio";

const ControlGrid = () => {
  // const setGrid = useStore((state) => state.setGrid);

  const inputMode = useStore((state) => state.inputMode);
  const grid = useStore((state) => state.grid);
  const patternRef = useStore((state) => state.patternRef);
  const setValue = useStore((state) => state.setValue);

  // const [grid, setGridOption] = useState(gridOptions[0]);

  const quantityMin = inputMode.value === 3 ? 25 : 4;
  const quantityMax = inputMode.value === 3 ? 50 : 30;

  const [gridConnectors, setGridConnectors] = useState([true, false]);
  const [quantity, setQuantity] = useState(gridSettingsDefault.gridQuantity);

  const handleGridTypeChange = <T,>(value: T) => {
    if (value === grid) return;
    const match = gridOptions.find((o) => o === value);
    if (match) {
      // setGridOption(match);
      setValue("grid", match);

      if (patternRef) {
        patternRef.uniforms.uGrid.value = match.value;
      }
    }
  };

  useEffect(() => {
    if (quantity < quantityMin) {
      setQuantity(quantityMin);
      if (patternRef) {
        patternRef.uniforms.uQuantity.value = quantityMin;
      }
    } else if (quantity > quantityMax) {
      setQuantity(quantityMax);
      if (patternRef) {
        patternRef.uniforms.uQuantity.value = quantityMax;
      }
    }
  }, [quantity, quantityMin, quantityMax, patternRef]);

  // const handleGridConnectorChange = (index: number) => {
  //   const connectors = [...gridConnectors];
  //   if (connectors[index] && connectors.filter((c) => !c).length > 0) return;
  //   connectors[index] = !connectors[index];
  //   setGridConnectors(connectors);

  //   if (patternRef) {
  //     patternRef.uniforms.uConnectors.value.set(
  //       ...connectors.map((c) => (c === true ? 1 : 0))
  //     );
  //   }
  // };

  // const handleGridConnectorChange = (label: string) => {
  //   const match = gridOptions.find((o) => o.value === grid.value);
  //   if (match) {
  //     const connectors = match.connectors;
  //     const index = connectors.map((c) => c.label).indexOf(label);
  //     const c = [...gridConnectors];
  //     if (c[index] && c.filter((c) => !c).length > 0) return;
  //     c[index] = !c[index];
  //     setGridConnectors(c);

  //     if (patternRef) {
  //       patternRef.uniforms.uConnectors.value.set(
  //         ...c.map((c) => (c === true ? 1 : 0))
  //       );
  //     }
  //   }

  //   // const connectors = [...gridConnectors];
  //   // if (connectors[index] && connectors.filter((c) => !c).length > 0) return;
  //   // connectors[index] = !connectors[index];
  //   // setGridConnectors(connectors);
  // };

  const gridSliders = [
    {
      label: "Quantity",
      // defaultValue: quantity,
      value: quantity,
      setValue: setQuantity,
      min: quantityMin,
      max: quantityMax,
      normalized: false,
      onChange: (value: number) => {
        if (patternRef) {
          patternRef.uniforms.uQuantity.value = value;
        }
      },
    },
  ];

  const gridToggle = {
    label: "Grid",
    options: gridOptions,
    value: grid,
    onChange: handleGridTypeChange,
  };

  // const connectorToggle = {
  //   label: "Connectors",
  //   iconOnly: true,
  //   options: gridOptions[grid.value].connectors,
  //   onChange: handleGridConnectorChange,
  //   isSelected: (label: string) =>
  //     gridConnectors[
  //       gridOptions[grid.value].connectors.map((c) => c.label).indexOf(label)
  //     ],
  // };

  const handleConnectorChange = (i: number) => {
    const connectors = [...gridConnectors];
    if (connectors[i] && connectors.filter((c) => !c).length > 0) return;
    connectors[i] = !connectors[i];
    setGridConnectors(connectors);
    if (patternRef) {
      patternRef.uniforms.uConnectors.value.set(
        ...connectors.map((c) => (c ? 1 : 0))
      );
    }
  };

  return (
    // <ControlGroup title="Layout">
    <>
      {/* <div className="flex items-center">
        <label>Layout</label>
        <select
          value={grid}
          onChange={(e) => handleGridTypeChange(Number(e.target.value))}
        >
          {gridOptions.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div> */}
      <Toggle {...gridToggle} />
      {/* <div className="flex items-center">
        <label>Connectors</label>
        <div className="flex gap-x-1">
          {gridOptions[grid.value].connectors.map((c, i) => (
            <img
              key={c.label}
              src={c.icon}
              className={`w-8 h-8 flex border border-black-100 rounded-sm cursor-pointer ${
                gridConnectors[i] ? "bg-white" : ""
              }`}
              onClick={() => handleGridConnectorChange(i)}
            />
          ))}
        </div>
      </div> */}
      <Control label="Connectors">
        <div className="flex gap-x-1">
          {connectorOptions.map((o, i) => (
            <div
              key={o.label}
              className={`w-8 h-8 border rounded-md cursor-pointer ${
                gridConnectors[i]
                  ? "bg-contrast/5 border-contrast"
                  : "border-contrast/50"
              }`}
              onClick={() => handleConnectorChange(i)}
            >
              <img src={o.icon[grid.value]} />
            </div>
          ))}
        </div>
      </Control>
      {/* <Toggle {...connectorToggle} /> */}
      <div>
        {gridSliders.map((slider) => (
          <Slider key={slider.label} {...slider} />
        ))}
      </div>
    </>
  );
};

export default ControlGrid;
