import { randomID } from "../../Utils/utils";

const Summary = (props) => {
  return (
    <div className="summary">
      <div className="sub-title">Summary</div>
      {props.details?.map((detail) => (
        <div className="detail" key={randomID(6)}>
          {!!detail.explain && (
            <div className="tooltip">
              <div>{detail.title}</div>
              <div className="tooltiptext">{detail.explain}</div>
            </div>
          )}
          {!detail.explain && (
            <div className="detail-title">{detail.title}</div>
          )}
          <div className="detail-value">{detail.value}</div>
        </div>
      ))}
    </div>
  );
};

export default Summary;
