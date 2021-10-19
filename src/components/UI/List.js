import React from "react";
import { randomID } from "../../Utils/utils";

import classes from "./List.module.css";

const List = (props) => {
  return (
    <div className={props.className}>
      {!!props.title && <div className={classes.title}>{props.title}</div>}
      <ul className={`${classes.list} `}>
        {props.data.map((data) => (
          <li
            // className={`${classes["list-item"]}`}
            key={data.id || randomID(6)}
            onClick={() => {
              !!props.onClick && props.onClick(data);
            }}
          >
            {props.children(data)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default List;
