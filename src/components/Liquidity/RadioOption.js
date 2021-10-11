import { randomID } from "../../Utils/utils";
import RadioText from "../UI/RadioText";

const RadioOption = (props) => {
  return (
    <div className="radio-container">
      {props.radioOption.map((option, index) => (
        <RadioText
          key={randomID(6)}
          name={props.name}
          checked={index === props.radioIndex}
          value={option}
          onChange={() => props.onChange(index)}
        />
      ))}
    </div>
  );
};
export default RadioOption;
