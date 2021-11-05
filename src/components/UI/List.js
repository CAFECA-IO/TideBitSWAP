import React from "react";
import { randomID } from "../../Utils/utils";

import classes from "./List.module.css";
import LoadingIcon from "./LoadingIcon";

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
      {props.isLoading && (
        <div className={classes.loading}>
          <LoadingIcon />
        </div>
      )}
    </div>
  );
};

export default List;
