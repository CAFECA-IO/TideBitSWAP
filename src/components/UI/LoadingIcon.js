import classes from "./LoadingIcon.module.css";
const LoadingIcon = (props) => {
  return (
    <div className={`${classes["lds-spinner"]} ${props.className ?classes[props.className]:''}`}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

export default LoadingIcon;
