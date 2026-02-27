import "../style/boxLoader.css";

type Props = {};

export default function Loader({}: Props) {
  return (
    <div className="load-wrapper">
      <div className="box-wrapper">
        <div>
          <span></span>
        </div>
        <div>
          <span></span>
        </div>
        <div>
          <span></span>
        </div>
        <div>
          <span></span>
        </div>
      </div>
      <p>loading!..</p>
    </div>
  );
}
