import "./garbageInfoStyles.css";

const GarbageInfo = () => {
  return (
    <div className="garbageinfo-container">
      <hr className="garbageinfo-hr" />
      <h1>Garbage Can Pickup Info</h1>

      <h3 className="garbageinfo-h3">How this demo works</h3>
      <p className="garbageinfo-testcases">
        tested on: pixel 7 android blah, iphone chrome OS something
      </p>
      <p className="garbageinfo-p">
        Here's some more detail on how to start demo. Make sure you have camera
        permissions on, and enabled. On another device, open the sample video I
        provide on youtube that shows a garbage pickup
        <a
          className="youtube-link"
          href="https://www.youtube.com/watch?v=EO4XX_kX9C8"
          target="_blank"
        >
          "Garbage pickup sample video"
        </a>
        . Tap "ENABLE CAMERA TO START DETECTION", then point to the video. You
        can also try a live view by pointing at your garbage pickup, and maybe
        the garbage worker will give you a wave 👋.
      </p>

      <h3 className="garbageinfo-h3">Machine Learning and Stuff</h3>
      <p className="garbageinfo-p">
        I gathered video from a few sources, created frames, and then using
        Roboflow{" "}
        <a
          href="https://roboflow.com/"
          className="garbageinfo-links"
          target="_blank"
        >
          Roboflow
        </a>
        , I labled, trained, and deployed machine learning model. Then I used
        NodeJS{" "}
        <a
          href="https://nodejs.org/en"
          className="garbageinfo-links"
          target="_blank"
        >
          NodeJS
        </a>
        , ReactJS
        <a
          href="https://react.dev/"
          className="garbageinfo-links"
          target="_blank"
        >
          ReactJS
        </a>
        for frontend and logic. To go a step further I used Socket.io
        <a
          href="https://socket.io/"
          className="garbageinfo-links"
          target="_blank"
        >
          Socket.io
        </a>
        so I can view realtime pickup from my camera setup. That was fun! Then I
        used twilio
        <a
          href="https://www.twilio.com/en-us"
          className="garbageinfo-links"
          target="_blank"
        >
          twilio
        </a>
        for text service to receive a text.
      </p>
      <p className="garbageinfo-p">A full stack course coming soon...</p>
    </div>
  );
};

export default GarbageInfo;
