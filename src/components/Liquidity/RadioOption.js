
import RadioText from "../UI/RadioText";

const RadioOption = (props) => {
  return (
    <div className="radio-container">
      {props.radioOption.map((option, index) => (
        <RadioText
          key={`radio-container+${index}`}
          name="radio-container"
          checked={index === props.radioIndex}
          value={option}
          onChange={() => props.onChange(index)}
        />
      ))}
    </div>
  );
};
export default RadioOption;
