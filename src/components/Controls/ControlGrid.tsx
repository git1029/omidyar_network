import { useState } from "react";
import { gridSettings } from "../../store/options";
import useStore from "../../store/store";
// import ControlGroup from "./ControlGroup";
import Slider from "../Core/Slider";
import IconArrowX from "/icon_arrow_x.svg";
import IconArrowY from "/icon_arrow_y.svg";
import IconArrowDiag1 from "/icon_arrow_diag_1.svg";
import IconArrowDiag2 from "/icon_arrow_diag_2.svg";
import Toggle from "./Toggle";
// import ControlRatio from "./ControlRatio";

const ControlGrid = () => {
  // const setGrid = useStore((state) => state.setGrid);

  const gridOptions = [
    {
      label: "Square",
      value: 0,
      connectors: [
        { label: "sqr-x", icon: IconArrowX },
        { label: "sqr-y", icon: IconArrowY },
      ],
    },
    {
      label: "Isometric",
      value: 1,
      connectors: [
        { label: "iso-1", icon: IconArrowDiag1 },
        { label: "iso-2", icon: IconArrowDiag2 },
      ],
    },
  ];

  const patternRef = useStore((state) => state.patternRef);

  let defaultGrid = gridOptions.find((o) => o.value === gridSettings.gridType);
  if (!defaultGrid) defaultGrid = gridOptions[0];

  const [grid, setGridOption] = useState(defaultGrid);
  const [gridConnectors, setGridConnectors] = useState(
    gridSettings.gridConnectors
  );

  const handleGridTypeChange = (label: string) => {
    const match = gridOptions.find((o) => o.label === label);
    if (match) {
      setGridOption(match);

      if (patternRef) {
        patternRef.uniforms.uGrid.value = match.value;
      }
    }
  };

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

  const handleGridConnectorChange = (label: string) => {
    const match = gridOptions.find((o) => o.value === grid.value);
    if (match) {
      const connectors = match.connectors;
      const index = connectors.map((c) => c.label).indexOf(label);
      const c = [...gridConnectors];
      if (c[index] && c.filter((c) => !c).length > 0) return;
      c[index] = !c[index];
      setGridConnectors(c);

      if (patternRef) {
        patternRef.uniforms.uConnectors.value.set(
          ...c.map((c) => (c === true ? 1 : 0))
        );
      }
    }

    // const connectors = [...gridConnectors];
    // if (connectors[index] && connectors.filter((c) => !c).length > 0) return;
    // connectors[index] = !connectors[index];
    // setGridConnectors(connectors);
  };

  const gridSliders = [
    {
      label: "Quantity",
      defaultValue: gridSettings.gridQuantity,
      min: 1,
      max: 30,
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
    options: gridOptions.map((o) => ({ label: o.label })),
    onChange: handleGridTypeChange,
    isSelected: (label: string) => grid.label === label,
  };

  const connectorToggle = {
    label: "Connectors",
    iconOnly: true,
    options: gridOptions[grid.value].connectors,
    onChange: handleGridConnectorChange,
    isSelected: (label: string) =>
      gridConnectors[
        gridOptions[grid.value].connectors.map((c) => c.label).indexOf(label)
      ],
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
      <Toggle {...connectorToggle} />
      <div>
        {gridSliders.map((slider) => (
          <Slider key={slider.label} {...slider} />
        ))}
      </div>
    </>
  );
};

export default ControlGrid;
