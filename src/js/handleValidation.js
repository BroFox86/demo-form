/**
 * Form validation with IntlTelInput support.
 * @param {HTMLElement} form - Form element.
 * @version 2.1.0-beta3-M
 * @author Daur Gamisonia <daurgam@gmail.com>
 * @license MIT
 */
function handleValidation( form ) {
  "use strict";

  const CLASS_VALID = "is-valid";
  const CLASS_INVALID = "is-invalid";
  const CLASS_ACTIVE = "is-focused"; // Only for material fields.
  const CLASS_WRAPPER = "field-group";
  const CLASS_MESSAGE_BOX = "field-group__message";
  let formElement;

  form.addEventListener("change", ({ target }) => {

    if ( !setFormElement( target ) ) {
      return;
    }

    validateElement();
  });

  // Handles form submission.
  form.addEventListener("click", ( event ) => {
    const type = event.target.type;
    const tagName = event.target.tagName;

    if ( type === "submit" || tagName === "BUTTON" && !type ) {

      event.preventDefault();

      validateForm();

      if ( isFormValid() ) {
        form.submit();
      }
    }
  });

  // Handles form reset.
  form.addEventListener("reset", () => {
    const fields = form.querySelectorAll(`.${CLASS_INVALID}, .${CLASS_VALID}`);
    const messageBoxes = form.querySelectorAll(`.${CLASS_MESSAGE_BOX}`);

    for ( const field of fields ) {
      field.classList.remove( 
        CLASS_VALID, CLASS_INVALID, CLASS_ACTIVE 
      );
    }

    for ( const messageBox of messageBoxes ) {
      messageBox.remove();
    }
  });

  function validateForm() {

    for ( const element of form.elements ) {

      if ( !setFormElement( element ) ) {
        continue;
      }
  
      validateElement();
    }
  }

  /**
   * Assigns the formElement variable.
   * @param {HTMLElement} element - Form element.
   * @returns {Boolean} - Is the element correct.
   */
  function setFormElement( element ) {
    const hasName = element.name;
    const isDisabled = element.disabled;

    if ( hasName && !isDisabled ) {

      formElement = element;

      formElement.value.trim();

      return true;

    } else {

      return false;
    }
  }

  /**
   * Checks is the form valid.
   * @returns {Boolean}
   */
  function isFormValid() {

    for ( const element of form.elements ) {

      if ( element.closest(`.${CLASS_INVALID}`) ) {
        return false;
      }
    }

    return true;
  }

  function validateElement() {
    const type = formElement.type;
    const tagName = formElement.tagName;

    if ( type === "radio" ) {

      setState( checkRadioButtons() );

    } else if ( type === "checkbox" ) {

      setState( validateCheckbox() );

    } else if ( type === "number" ) {

      setState( checkNumericalInput() );

    } else if ( type === "tel" ) {

      setState( checkTelInput() );

    } else if ( tagName === "SELECT" ) {

      setState( checkSelectElement() );

    } else if ( tagName === "TEXTAREA" ) {

      setState( checkTextInput() );

    } else if ( type.search(/text|email|password/) === 0 ) {

      setState( checkTextInput() );
    
    } else {

      setState( "ERROR: UNSUPPORTED_FORM_ELEMENT", false );
    }
  }

  // Validates a group of radio buttons within a fieldset element.
  function checkRadioButtons() {
    const fieldset = formElement.closest("fieldset");
    const radioButtons = fieldset.querySelectorAll("input[type=radio]");
    let isRequired;
    let isChecked;

    // Check if group of radio buttons is required/checked.
    for ( const radio of radioButtons ) {

      if ( formElement.name !== radio.name ) {
        throw new Error("The names in the radio button group do not match");
      }

      if ( radio.required ) {
        isRequired = true;
      }

      if ( radio.checked ) {
        isChecked = true;
      }
    }

    if ( isRequired && isChecked ) {

      return { 
        isValid: true,
        wrapperTag: "fieldset"
      };

    } else if ( isRequired && !isChecked ) {

      return { 
        message: "This button group is required",
        isValid: false,
        wrapperTag: "fieldset"
      };

    } else {
      
      return { 
        isValid: true,
        wrapperTag: "fieldset"
      };
    }
  }

  function validateCheckbox() {

    if ( !formElement.checked && formElement.required ) {

      return { 
        message: "This checkbox is required",
        isValid: false 
      };

    } else {
      return { isValid: true };
    }
  }

  function checkNumericalInput() {

    if ( !isFieldPopulated() ) {

      if ( formElement.required ) {

        return { 
          message: "Please enter a valid number",
          isValid: false 
        };

      } else {
        return { isValid: true };
      }
    }
    
    if ( !checkNumericalValue() ) {

      return { 
        message: "This field is required",
        isValid: false 
      };

    } else {
      return { isValid: true };
    }
  }

  function checkTelInput() {
    
    if ( !isFieldPopulated() ) {

      if ( formElement.required ) {

        return { 
          message: "This field is required",
          isValid: false 
        };

      } else {
        return { isValid: true };
      }
    }

    // If intlTelInput plugin is declared.
    if ( intlTelInput ) {

      if ( intlTelInput.isValidNumber() ) {

        return { isValid: true };
  
      } else {
        const errorMap = [
          "Invalid number", 
          "Invalid country code", 
          "Too short", 
          "Too long", 
          "Invalid number"
        ];
        const errorCode = intlTelInput.getValidationError();
  
        return { 
          message: errorMap[ errorCode ],
          isValid: false 
        };
      }
    }

    if ( !checkPatternMatch() || !checkValueLength() ) {

      return { 
        message: "Please enter a valid phone number",
        isValid: false 
      };

    } else {
      return { isValid: true };
    }
  }

  function checkSelectElement() {

    if ( formElement.required && !isOptionSelected() ) {

      return { 
        message: "Please select an option",
        isValid: false 
      };

    } else {
      return { isValid: true };
    }
  }

  function checkTextInput() {

    if ( !isFieldPopulated() ) {

      if ( formElement.required ) {

        return { 
          message: "This field is required",
          isValid: false 
        };

      } else {
        return { isValid: true };
      }
    }
    
    if ( !checkPatternMatch() || !checkValueLength() ) {

      return { 
        message: "Please enter a valid value",
        isValid: false 
      };

    } else {
      return { isValid: true };
    }
  }

  function isFieldPopulated() {
    if ( formElement.value === "" ) {
      return false;
    } else {
      return true;
    }
  }

  function isOptionSelected() {
    const selectedIndex = formElement.selectedIndex;
    const option = formElement.options[ selectedIndex ];

    if ( !option.disabled && option.value ) {
      return true;
    } else {
      return false;
    }
  }

  function checkNumericalValue() {
    const value = formElement.value;
    const min = +formElement.min || -Infinity;
    const max = +formElement.max || Infinity;

    if ( value >= min && value <= max ) {
      return true;
    } else {
      return false;
    }
  }

  // Checks match with the value of the HTML5 `pattern` attribute.
  function checkPatternMatch() {
    const value = formElement.value;
    const pattern = formElement.pattern;

    if ( !pattern ) { 
      return true;
    }

    if ( value.match( new RegExp( pattern ) ) ) {
      return true;
    } else {
      return false;
    }
  }

  function checkValueLength() {
    const minLength = +formElement.getAttribute("minlength");
    const text = formElement.textContent || formElement.value;
    const charSum = (() => {
      let counter = 0;

      while( text[ counter ] ) {
        counter++;
      }
  
      return counter;
    })();

    if ( !minLength || charSum >= minLength ) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Handles validation state of form elements: 
   * 1) Defines wrappers of form elements.
   * 2) Puts validation state on wrappers as HTML classes.
   * 3) Controls feedback messages that placed in wrappers.
   * @param {Object} options - Options object.
   * @param {String} options.message - Feedback message.
   * @param {Boolean} options.isValid - Validation state.
   * @param {String} options.wrapperTag - Wrapper tagname for radio buttons.
   */
  function setState({ message, isValid, wrapperTag }) {
    const wrapper = (
      formElement.closest( wrapperTag ) ||
      formElement.closest(`.${CLASS_WRAPPER}`) || 
      formElement.parentElement
    );
    let messageBox = wrapper.querySelector(`.${CLASS_MESSAGE_BOX}`);

    switch( isValid ) {

      case false:
        wrapper.classList.add( CLASS_INVALID );
        wrapper.classList.remove( CLASS_VALID );
        break;

      case true:
        wrapper.classList.add( CLASS_VALID );
        wrapper.classList.remove( CLASS_INVALID );
        break;
    }

    if ( !messageBox && message ) {

      messageBox = document.createElement("span");

      messageBox.className = CLASS_MESSAGE_BOX;
  
      wrapper.append( messageBox );

      messageBox.textContent = message;

    } else if ( messageBox && message ) {

      messageBox.textContent = message;

    } else if ( messageBox ) {

      messageBox.remove();
    }
  }
}

(()=> {
  const form = document.querySelector(".js-validation-toggle");

  if ( form ) {
    handleValidation( form );
  }
})();
