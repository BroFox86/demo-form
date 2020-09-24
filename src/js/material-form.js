/**
 * Control focus states of the material fields.
 * @version 2.0.0
 */
class MaterialForm {
  /**
   * @param {HTMLElement} form - Form element.
   */
  constructor( form ) {
    this.form = form;
    this.handlePopulated();
    this.handleEvents();
  }

  handleEvents() {
    this.form.addEventListener("focus", ( event ) => {
      this.handleState( event.target, event.type );
    }, true );

    this.form.addEventListener("blur", ( event ) => {
      this.handleState( event.target, event.type );
    }, true );

    this.form.addEventListener("change", ( event ) => {
      this.handleState( event.target, event.type );
    });

    this.form.addEventListener("reset", () => {
      this.handleReset();
      this.handlePopulated();
    });
  }

  handlePopulated() {
    for ( let element of this.form.elements ) {
      this.handleState( element );
    }
  }

  handleState( element, eventType ) {
    const wrapper = element.closest(".field-group");

    if ( !wrapper || element.tagName != "INPUT" ) {
      return;
    }

    if ( eventType == "focus" ) {

      if ( element.value == "" ) {
        wrapper.classList.add("is-focused");
      }

    } else {

      if ( element.value != "" ) {

        wrapper.classList.add("is-focused");

      } else {

        wrapper.classList.remove("is-focused");
      }
    }
  }

  handleReset() {
    const focusedElements = this.form.querySelectorAll(".is-focused");

    for ( let wrapper of focusedElements ) {
      wrapper.classList.remove("is-focused");
    }
  }
}

try {

  const materialForm = new MaterialForm(
    document.querySelector(".js-material-form-toggle")
  );

} catch( error ) {

  console.log( error );
}
