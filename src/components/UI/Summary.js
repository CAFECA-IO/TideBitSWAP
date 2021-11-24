import { randomID } from "../../Utils/utils";
import classes from './Summary.module.css'

const Summary = (props) => {
  return (
    <div className={classes.summary}>
      <div className={classes.title}>Summary</div>
      {props.details?.map((detail) => (
        <div className={classes.detail} key={randomID(6)}>
          {!!detail.explain && (
            <div className={classes.tooltip}>
              <div>{detail.title}</div>
              <div className={classes.tooltiptext}>{detail.explain}</div>
            </div>
          )}
          {!detail.explain && (
            <div className={classes["detail-title"]}>{detail.title}</div>
          )}
          <div className={classes["detail-value"]}>{detail.value}</div>
        </div>
      ))}
    </div>
  );
};

export default Summary;
