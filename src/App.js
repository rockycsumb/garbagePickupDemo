import GarbagePickup from "./GarbagePickupQuickDemo";
import GarbageInfo from "./GarbageInfo";
import QuickCheck from "./QuickCheck";
import "./app.css";

export default function App() {
  return (
    <div className="app-container">
      <QuickCheck />
      <GarbageInfo />
    </div>
  );
}
