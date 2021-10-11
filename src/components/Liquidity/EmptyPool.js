import classes from "./EmptyPool.module.css";
import img from "../../resource/no-product-found.png";

const EmptyPool = (props) => {
  return (
    <div className={classes.container}>
      <div className={classes.image}>
        <img src={img} alt="" />
      </div>
      {props.typeIndex === 0 && (
        <div className={classes.hint}>No product found.</div>
      )}
      {props.typeIndex === 1 && (
        <div className={classes.hint}>
          You don’t have any Liquid portion to remove.
        </div>
      )}
    </div>
  );
};

export default EmptyPool;
