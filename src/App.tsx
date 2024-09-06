import Controls from "./components/Controls/Controls";
import Pattern from "./components/Pattern";

function App() {
  return (
    <div className="flex bg-gray-100 text-black-100 h-screen w-full p-8 gap-8">
      <Controls />
      <Pattern />
    </div>
  );
}

export default App;
