import { randomHex } from "../utils/utils";

class CustomInput extends HTMLElement {
  constructor() {
    super();
  }
  set focus(val) {
    if (val) {
      Array.from(document.querySelectorAll("input__container")).forEach(
        (controller) => (controller.focus = false)
      );
      this.setAttribute("focus", "");
    } else {
      this.removeAttribute("focus");
    }
  }
  set error(val) {
    if (val) {
      this.setAttribute("error", "");
    } else {
      this.removeAttribute("error");
    }
  }
  get hasValue() {
    return this.hasAttribute("has-value");
  }
  set hasValue(val) {
    if (val) {
      this.setAttribute("has-value", "");
    } else {
      this.removeAttribute("has-value");
    }
  }
  set inputType(val) {
    this.input.type = val;
  }
  set validation(val) {
    this.validator = val;
  }
  set errorMessage(val) {
    if (val === undefined) this.children[1].style.display = "none";
    this.children[1].textContent = val;
  }
  get inputValue() {
    return this.input.value;
  }
  set inputValue(val) {
    if (val !== "") {
      this.hasValue = true;
    } else {
      this.hasValue = false;
    }
    this.input.value = val;
  }
  set inputTitleTitle(val) {
    document.querySelector(
      `label[for=${this.id} > input__title--title`
    ).textContent = val;
  }
  set inputTitleValue(val) {
    document.querySelector(
      `label[for=${this.id} > input__title--value`
    ).textContent = val;
  }
  set inputSubtitleTitle(val) {
    document.querySelector(
      `label[for=${this.id} > input__subtitle--title`
    ).textContent = val;
  }
  set inputSubtitleValue(val) {
    document.querySelector(
      `label[for=${this.id} > input__subtitle--value`
    ).textContent = val;
  }
  connectedCallback() {
    this.className = "input";
    this.innerHTML = `
        <div class="input__container">
            <label class="input__label" for=${this.id}>
                <div class="input__title">
                    <div class="input__title--title"></div>
                    <div class="input__title--value"></div>
                </div>
                <div class="input__subtitle">
                    <div class="input__subtitle--title"></div>
                    <div class="input__subtitle--value"></div>
                </div>
            </label>
            <div class="input__field">
                <input 
                    type="text" 
                    class="input__input" 
                    id=${this.id} 
                    value=${this.defaultValue} 
                    ${this.disabled ? disabled : null}>
                <div class="input__suffix">
                    <div class="input__suffix--hint">MAX</div>
                    <div class="input__suffix--divider">&verbar;</div>
                    <div class="input__suffix--symbol">
                        <img
                          src=${this.imageSource}
                          alt=""
                          class="input__suffix--image"
                        />
                        <p class="input__suffix--text">${this.imageLabel}</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="input__error-message"></div>     
    `;
    this.input = document.querySelector(`input[id="${this.id}"]`);
    this.input.addEventListener("focus", (_) => (this.focus = true));
    this.input.addEventListener("focusout", (_) => (this.focus = false));
    this.input.addEventListener("input", (e) => this.handleInput(e));
  }
  disconnectedCallback() {
    this.input.removeEventListener("focus", (_) => (this.focus = true));
    this.input.removeEventListener("focusout", (_) => (this.focus = false));
    this.input.removeEventListener("input", (e) => this.handleInput(e));
  }
  handleInput(e) {
    this.inputValue = e.target.value;
    let checked;
    if (this.validator !== undefined) {
      this.isValid = this.validator(e.target.value);
      checked = e.target.value === "" || (await this.validator(e.target.value));
    }
    if (checked !== undefined) {
      this.error = !checked;
    }
  }
}

customElements.define("input-container", CustomInput);

class Input {
  constructor(
    id,
    {
      inputType = "text",
      inputTitleTitle,
      inputTitleValue = "",
      inputSubtitleTitle = "",
      inputSubtitleValue = "",
      defaultValue = "",
      disabled = false,
      imageSource,
      imageLabel,
      errorMessage = "",
      validation,
    }
  ) {
    this.id = id;
    this.inputType = inputType;
    this.inputTitleTitle = inputTitleTitle;
    this.inputTitleValue = inputTitleValue;
    this.inputSubtitleTitle = inputSubtitleTitle;
    this.inputSubtitleValue = inputSubtitleValue;
    this.defaultValue = defaultValue;
    this.disabled = disabled;
    this.imageSource = imageSource;
    this.imageLabel = imageLabel;
    this.errorMessage = errorMessage;
    this.validation = validation;
  }
  render(parentElement) {
    this.element = document.createElement("input-container");
    parentElement.insertAdjacentElement("beforeend", this.element);
    this.element.id = this.id;
    this.element.inputType = this.inputType;
    this.element.inputTitleTitle = inputTitleTitle;
    this.element.inputTitleValue = inputTitleValue;
    this.element.inputSubtitleTitle = inputSubtitleTitle;
    this.element.inputSubtitleValue = inputSubtitleValue;
    this.element.defaultValue = defaultValue;
    this.element.disabled = disabled;
    this.element.imageSource = imageSource;
    this.element.imageLabel = imageLabel;
    this.element.errorMessage = this.errorMessage;
    this.element.validation = this.validation;
  }
  get inputValue() {
    return this.element?.inputValue;
  }

  set inputValue(value) {
    this.element.inputValue = value;
  }

}

export default Input;
