import React, { useState } from "react";
import Button from "../UI/Button";
import Dialog from "../UI/Dialog";
import classes from "./FilterDialog.module.css";
import FilterDropDown from "./FilterDropDown";

const FilterDialog = (props) => {
  const [openDialog, setOpenDialog] = useState(false);
  const closeHandler = () => {
    setOpenDialog(false);
  };
  const clickHandler = () => {
    setOpenDialog(true);
  };

  return (
    <React.Fragment>
      {openDialog && (
        <Dialog title="Search Condition" onCancel={closeHandler} expand={true}>
          <div className={classes.content}>
            <FilterDropDown
              label="Pools"
              options={props.poolTypes}
              selected={props.selectedType}
              onSelect={props.onSelectType}
            />
            <FilterDropDown
              label="Sort by"
              options={props.sortConditions}
              selected={props.selectedCondition}
              onSelect={props.onSelectCondition}
            />
            <input
              className={classes.controller}
              type="checkbox"
              id="filter-checkbox"
              name="filter-checkbox"
              checked={props.checked}
              onChange={props.onMatch}
            />
            <label htmlFor="filter-checkbox" className={classes.checkbox}>
              <div className={classes.icon}></div>
              <div className={classes.value}>Match My Available Assets</div>
            </label>
            <div className={classes.button}>
              <Button type="button" onClick={props.onReset}>
                Reset
              </Button>
              <Button type="button" onClick={closeHandler}>
                Search
              </Button>
            </div>
          </div>
        </Dialog>
      )}
      <button type="button" className={classes.filter} onClick={clickHandler}>
        &#8652;
      </button>
    </React.Fragment>
  );
};

export default FilterDialog;
