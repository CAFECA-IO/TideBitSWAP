import React, { useState, useRef } from "react";
import Button from "../../components/UI/Button";
import Header from "../../components/UI/Header";
import CreatePool from "../../components/CreatePool/CreatePool";
import classes from "./Earn.module.css";

const Earn = (props) => {
  const [open, setOpen] = useState(false);
  const [openPage, setOpenPage] = useState(null);

  const closeHandler = () => {
    setOpen(false);
  };

  const clickHandler = (pageName) => {
    console.log(pageName);
    setOpen(true);
    setOpenPage(<CreatePool onClose={closeHandler} />);
  };
  return (
    <React.Fragment>
      {open && openPage}
      <div className={classes.earn}>
        <Header
          title="Earn"
          leading="<"
          back="/home"
          onDisconnect={props.onDisconnect}
        />
        <Button type="button" onClick={clickHandler}>
          Create
        </Button>
      </div>
    </React.Fragment>
  );
};

export default Earn;
