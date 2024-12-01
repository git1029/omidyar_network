import { useEffect, useState } from "react";
import {
  connectorOptions,
  gridOptions,
  gridSettingsDefault,
} from "../../store/options";
import useStore from "../../store/store";
import Slider from "../Core/Slider";
import Toggle from "../Core/Toggle";
import Control from "../Core/Control";

const ControlGrid = () => {
  const inputMode = useStore((state) => state.inputMode);
  const grid = useStore((state) => state.grid);
  const patternRef = useStore((state) => state.patternRef);
  const setValue = useStore((state) => state.setValue);

  const quantityMin = inputMode.value === 3 ? 25 : 4;
  const quantityMax = inputMode.value === 3 ? 50 : 30;

  const [gridConnectors, setGridConnectors] = useState([true, false]);
  const [quantity, setQuantity] = useState(gridSettingsDefault.gridQuantity);

  const handleGridTypeChange = <T,>(value: T) => {
    if (value === grid) return;
    const match = gridOptions.find((o) => o === value);
    if (match) {
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

  const gridSliders = [
    {
      label: "Quantity",
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
    <>
      <Toggle {...gridToggle} />
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
      <div>
        {gridSliders.map((slider) => (
          <Slider key={slider.label} {...slider} />
        ))}
      </div>
    </>
  );
};

export default ControlGrid;
