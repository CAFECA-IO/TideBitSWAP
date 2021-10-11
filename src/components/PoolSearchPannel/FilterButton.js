import React, { useState } from "react";
import classes from "./FilterButton.module.css";
import Button from "../UI/Button";
import Dialog from "../UI/Dialog";
import DropDown from "../UI/DropDown";
import RadioText from "../UI/RadioText";

const OptionContainer = (props) => {
  return <div className={classes.option}>{props}</div>;
};

const FilterButton = (props) => {
  const [openDialog, setOpenDialog] = useState(false);

  const closeHandler = () => {
    setOpenDialog(false);
  };
  const clickHandler = () => {
    setOpenDialog(true);
  };

  const onSearch = () => {
    props.onSearch();
    setOpenDialog(false);
  };

  const onMatchHandler = (e) => {
    props.onMatch(e.target.checked);
  };

  return (
    <React.Fragment>
      {openDialog && (
        <Dialog title="Search Condition" onCancel={closeHandler} expand={true}>
          <div className={classes.content}>
            {!!Object.keys(props.filterConditions)?.length && (
              <DropDown
                label="Pools"
                options={Object.keys(props.filterConditions)}
                selected={props.selectedFilter}
                onSelect={props.onSelectFilter}
                placeholder="Select Filter"
              >
                {(key) => OptionContainer(props.filterConditions[key])}
              </DropDown>
            )}
            {!!Object.keys(props.sortingConditions)?.length && (
              <DropDown
                label="Sort by"
                options={Object.keys(props.sortingConditions)}
                selected={props.selectedSorting}
                onSelect={props.onSelectSorting}
                placeholder="Select Sort"
              >
                {(key) => OptionContainer(props.sortingConditions[key])}
              </DropDown>
            )}
            <RadioText
              type="checkbox"
              name="filter-checkbox"
              checked={props.matchMyAssets}
              onChange={onMatchHandler}
              value="Match My Available Assets"
            />

            <div className={classes.button}>
              <Button type="button" onClick={props.onReset}>
                Reset
              </Button>
              <Button type="button" onClick={onSearch}>
                Search
              </Button>
            </div>
          </div>
        </Dialog>
      )}
      <div className={classes.filter} onClick={clickHandler}>
        &#8652;
      </div>
    </React.Fragment>
  );
};

export default FilterButton;
