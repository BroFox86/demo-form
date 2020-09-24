/**
 * Form validation.
 * @param {HTMLElement} form - Form element.
 * @version 2.0.7
 * @author Daur Gamisonia <daurgam@gmail.com>
 */
function handleValidation( form ) {
  "use strict";

  const CLASS_VALID = "is-valid";
  const CLASS_INVALID = "is-invalid";
  const CLASS_FOCUSED = "is-focused"; // Only for material fields.
  const CLASS_WRAPPER = "field-group";
  const CLASS_INPUT = "field-group__input";
  const CLASS_MESSAGE = "field-group__message";
  const MESSAGE_VALID = "";
  const MESSAGES = {
    "tel": "Please follow these patterns: 123-456-7890, 123 456 7890 or 1234567890",
    "bday-day": "Please enter a valid date of birth",
    "cc-name": "Please enter a valid card name",
    "cc-number": "Please enter a valid card number",
    "cc-csc": "Please enter a valid secure code"
  };
  let field;

  [ "input", "change" ].forEach(( item ) => {

    form.addEventListener( item, ( event ) => {

      field = event.target;

      validateElement();
    });
  });

  form.onclick = ( event ) => {

    if ( event.target.type == "submit" ) {

      event.preventDefault();

      validateForm();
    }
  };

  function validateForm() {

    for ( let element of form.elements ) {

      if ( element.tagName == "BUTTON" ) {
        continue;
      }

      field = element;

      validateElement();
    }

    if ( isFormValid() ) {

      form.submit();
    }
  }

  function validateElement() {

    if ( field.type.search(/search|hidden|radio|button/) == 0 ) {
      return;
    }

    if ( field.disabled) {
      return;
    }

    if ( field.required ) {

      if ( field.type == "checkbox" && !field.checked ) {

        setStatus( "This checkbox is required", false );

        return;
      }

      if ( field.tagName == "INPUT" && !isFilled() ) {

        setStatus( "This field is required", false );
  
        return;
      }

      if ( field.tagName == "SELECT" && !isSelected() ) {

        setStatus( "Please select an option", false );
  
        return;
      }
    }

    if ( field.type == "checkbox" && !field.checked ) {

      setStatus( "Unchecked checkbox is allowed", false );

      return;
    }

    if ( field.tagName == "INPUT" && field.value == "" ) {

      setStatus( "Empty field is allowed", true );
  
      return;
    }

    if ( field.tagName == "SELECT" && !isSelected() ) {

        setStatus( "Empty option is allowed", true );
  
        return;
    }

    if ( field.type == "number" ) {

      if ( !checkNumber() ) {

        setStatus( "Please enter a valid number", false );

      } else {

        setStatus( MESSAGE_VALID, true );
      }

      return;
    }

    if ( !checkLength() || !checkPattern() ) {
      let fieldType = field.autocomplete || field.type;

      if ( MESSAGES[ fieldType ] != undefined ) {

        setStatus( MESSAGES[ fieldType ], false );

      } else {

        setStatus( `Please enter a valid ${fieldType}`, false );
      }

    } else {

      setStatus( MESSAGE_VALID, true );
    }
  }

  function isFilled() {
    if ( field.value != "" ) {
      return true;
    }
  }

  function isSelected() {
    let option = field.options[ field.selectedIndex ];

    if ( !option.disabled && option.className != "js-select-placeholder" ) {
      return true;
    }
  }

  function checkLength() {
    const minLength = +field.getAttribute("minlength");
    const text = field.textContent || field.value;
    const charSum = getCharSum( text );

    if ( !minLength || charSum >= minLength ) {
      return true;
    }
  }

  function getCharSum( string ) {
    let counter = 0;

    while( string[ counter ] ) {
      counter++;
    }

    return counter;
  }

  function checkPattern() {
    const value = field.value;

    if ( field.pattern ) {
      const pattern = new RegExp( field.pattern );

      if ( value.match( pattern ) ) {
        return true;
      }

    } else {

      return true;
    }
  }

  function checkNumber() {
    const value = field.value;
    const min = +field.min || -Infinity;
    const max = +field.max || Infinity;

    if ( value >= min && value <= max ) {
      return true;
    }
  }

  function setStatus( text, isValid ) {
    let wrapper = field.closest(`.${CLASS_WRAPPER}`) || field.parentElement;

    // Skip the 3rd party input.
    if ( !field.classList.contains( CLASS_INPUT ) ) {
      return;
    }

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

    handleMessage( text );
  }

  function handleMessage( text ) {
    let wrapper;
    let message;

    wrapper = field.closest(`.${CLASS_WRAPPER}`) || field.parentElement;

    message = wrapper.querySelector(`.${CLASS_MESSAGE}`);

    if ( !text ) {

      if ( message ) message.remove();

      return;
    }

    if ( !message ) {

      message = document.createElement("span");

      message.className = CLASS_MESSAGE;

      wrapper.append( message );
    }

    message.textContent = text;
  }

  function isFormValid() {

    for ( let element of form.elements ) {

      if ( element.closest(`.${CLASS_INVALID}`) ) {
        return false;
      }
    }

    return true;
  }

  form.addEventListener("reset", () => {
    const messages = form.querySelectorAll(`.${CLASS_MESSAGE}`);
    const fields = form.querySelectorAll(`.${CLASS_INVALID}, .${CLASS_VALID}`);

    for ( let fieldWrapper of fields ) {

      fieldWrapper.classList.remove( 
        CLASS_VALID, CLASS_INVALID, CLASS_FOCUSED 
      );
    }

    for ( let message of messages ) {
      message.remove();
    }
  });
}

try {

  handleValidation( document.querySelector(".js-validation-toggle") );

} catch( error ) {

  console.log( error );

}
