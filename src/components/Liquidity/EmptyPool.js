import classes from "./EmptyPool.module.css";
import img from "../../resource/no-product-found.png";
import { liquidityType } from "../../constant/constant";

const EmptyPool = (props) => {
  return (
    <div className={classes.container}>
      <div className={classes.image}>
        <img src={img} alt="" />
      </div>
      {props.selectedType === liquidityType.PROVIDE && (
        <div className={classes.hint}>No product found.</div>
      )}
      {props.selectedType === liquidityType.TAKE && (
        <div className={classes.hint}>
          You don’t have any Liquid portion to remove.
        </div>
      )}
    </div>
  );
};

export default EmptyPool;
