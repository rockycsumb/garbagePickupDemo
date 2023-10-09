import "./garbagePickupStatsStyles.css";
const GarbagePickupStats = (props) => {
  return (
    <div>
      <h3>Pickup Times:</h3>
      {props.pickupTimes.map((el, index) => (
        <p className="alert-bar" key={index}>
          {el}
        </p>
      ))}
    </div>
  );
};
export default GarbagePickupStats;
