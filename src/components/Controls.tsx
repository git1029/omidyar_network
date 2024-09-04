import { colors } from "../store/options";

const Controls = () => {
  return (
    <div className="w-1/2">
      <h1 className="font-[TestFeijoaDisplay]">Omidyar Network</h1>
      <div className="border-t border-black">
        <h2>Input</h2>
        <select>
          <option>Image</option>
          <option>Video</option>
          <option>Camera</option>
          <option>Text</option>
        </select>
      </div>
      <div className="border-t border-black">
        <h2>Ratio</h2>
        <select>
          <option>1x1</option>
          <option>16x9</option>
          <option>9x16</option>
        </select>
      </div>
      <div className="border-t border-black">
        <h2>Pattern Settings</h2>
        <div>
          <label>Dot Size</label>
          <input type="range" min="0" max="100" />
        </div>
        <div>
          <label>Contrast</label>
          <input type="range" min="0" max="100" />
        </div>
        <div>
          <label>Frequency</label>
          <input type="range" min="0" max="100" />
        </div>
        <div>
          <label>Horizontal Density</label>
          <input type="range" min="0" max="100" />
        </div>
        <div>
          <label>Vertial Density</label>
          <input type="range" min="0" max="100" />
        </div>
      </div>

      <div className="border-t border-black">
        <h2>Color</h2>
        <label>Background</label>
        <div className="flex gap-x-1">
          {colors.map((c) => {
            return (
              <div
                key={`background-color-${c}`}
                className="w-6 h-4 border border-black-100"
                style={{ backgroundColor: c }}
              ></div>
            );
          })}
        </div>
        <label>Foreground</label>
        <div className="flex gap-x-1">
          {colors.map((c) => {
            return (
              <div
                key={`foreground-color-${c}`}
                className="w-6 h-4 border border-black-100"
                style={{ backgroundColor: c }}
              ></div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-black">
        <h2>Export</h2>
        <select>
          <option>PNG</option>
          <option>MP4</option>
        </select>
      </div>
    </div>
  );
};

export default Controls;
