import { useState } from "react";
import { gridSettings } from "../../store/options";
import useStore from "../../store/store";
import ControlGroup from "./ControlGroup";
import Slider from "./Slider";
import IconArrowX from "/icon_arrow_x.svg";
import IconArrowY from "/icon_arrow_y.svg";
import IconArrowDiag1 from "/icon_arrow_diag_1.svg";
import IconArrowDiag2 from "/icon_arrow_diag_2.svg";

const ControlGrid = () => {
  // const setGrid = useStore((state) => state.setGrid);

  const patternRef = useStore((state) => state.patternRef);

  const [grid, setGridOption] = useState(gridSettings.gridType);
  const [gridConnectors, setGridConnectors] = useState(
    gridSettings.gridConnectors
  );

  const handleGridTypeChange = (value: number) => {
    if (patternRef) {
      patternRef.uniforms.uGrid.value = value;
    }
    setGridOption(value);
  };

  const handleGridConnectorChange = (index: number) => {
    const connectors = [...gridConnectors];
    connectors[index] = !connectors[index];
    setGridConnectors(connectors);

    if (patternRef) {
      patternRef.uniforms.uConnectors.value.set(
        ...connectors.map((c) => (c === true ? 1 : 0))
      );
    }
  };

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

  return (
    <ControlGroup>
      <h2>Grid</h2>
      <div className="flex flex-col">
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
      </div>
      <div className="flex items-center">
        <label className="w-[200px]">Connectors</label>
        <div className="flex gap-x-1">
          {gridOptions[grid].connectors.map((c, i) => (
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
      </div>
      <div>
        {gridSliders.map((slider) => (
          <Slider key={slider.label} {...slider} />
        ))}
      </div>
    </ControlGroup>
  );
};

export default ControlGrid;
