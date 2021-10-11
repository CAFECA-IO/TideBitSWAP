import classes from "./TypeTabBar.module.css";

const TypeTabBar = (props) => {
  return (
    <div className={classes["tab-bar"]}>
      {props.types.map((type, index) => (
        <div className={classes["tab-box"]} key={index + type}>
          <input
            className={classes.controller}
            type="radio"
            name="liquidity-type"
            id={type + index}
            checked={props.selectedType === type}
            readOnly
          />
          <label
            htmlFor={type + index}
            className={classes.tab}
            onClick={() => props.onSelect(type)}
          >
            {type}
          </label>
        </div>
      ))}
    </div>
  );
};

export default TypeTabBar;
