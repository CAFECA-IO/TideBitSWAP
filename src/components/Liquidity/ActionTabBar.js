import classes from "./ActionTabBar.module.css";

const ActionTabBar = (props) => {
  return (
    <div className={classes["tab-bar"]}>
      {props.types.map((type, index) => (
        <div className={classes["tab-box"]} key={index + type}>
          <input
            className={classes.controller}
            type="radio"
            name="liquidity-type"
            id={type + index}
            checked={props.typeIndex === index}
            readOnly
          />
          <label
            htmlFor={type + index}
            className={classes.tab}
            onClick={() => props.onSelect(index)}
          >
            {type}
          </label>
        </div>
      ))}
    </div>
  );
};

export default ActionTabBar;
