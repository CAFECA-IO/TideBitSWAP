import React, { useState, useRef } from "react";
import Button from "../../components/UI/Button";
import Header from "../../components/UI/Header";
import CreatePool from "../../components/CreatePool/CreatePool";
import classes from "./Earn.module.css";
import Dialog from "../../components/UI/Dialog";

const Earn = (props) => {
  const [openDialog, setOpenDialog] = useState(false);

  const cancelHandler = () => {
    setOpenDialog(false);
  };
  const clickHandler = (content) => {
    setOpenDialog(true);
  };

  return (
    <React.Fragment>
      {openDialog && (
        <Dialog title="Create Pool" onCancel={cancelHandler}>
          <CreatePool />
        </Dialog>
      )}
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
