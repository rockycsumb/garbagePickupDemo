import GarbageInfo from "./GarbageInfo";
import GarbagePickupDemo from "./GarbagePickupDemo";
import "./app.css";

export default function App() {
  return (
    <div className="app-container">
      <GarbagePickupDemo />
      <GarbageInfo />
    </div>
  );
}
