/**
 * Modal window.
 * @param {string} selector - Container selector.
 * @version 6.0.8
 */
class Modal {

  constructor( selector ) {
    this._modal = document.querySelector( selector );
    this._container = this._modal.querySelector(".modal__container");
    this._listenKeyDown = this._handleKeyDown( this._modal );
    this._pressed = new Set();
    this._lastFocus = null;
  }

  open() {
    // Save last focused element.
    this._lastFocus = document.activeElement;

    document.activeElement.blur();

    this._modal.hidden = false;

    this._modal.setAttribute( "aria-modal", true );

    togglePageScroll( this._container );

    document.addEventListener( "keydown", this._listenKeyDown );
    
    document.addEventListener( "keyup", this._clearPressed.bind( this ) );

    setTimeout(() => {

      this._modal.classList.add("is-visible");

    }, 20 );
  }

  close() {
    const duration = getDuration( this._container );

    this._modal.classList.remove("is-visible");

    togglePageScroll( this._container );

    setTimeout(() => {

      this._modal.hidden = true;

      this._modal.removeAttribute("aria-modal");

      this._lastFocus.focus();

      document.removeEventListener( "keydown", this._listenKeyDown );

      document.removeEventListener( "keyup", this._clearPressed.bind( this ) );

    }, duration );
  }

  _handleKeyDown( element ) {
    
    return ( event ) => {
      const pressed = this._pressed;
      const focusElements = getFocusElements( element );
      const firstFocusElement = focusElements[ 0 ];
      const lastFocusElement = focusElements[ focusElements.length - 1 ];
      const isOnFirstFocus = event.target === firstFocusElement;
      const isOnLastFocus = event.target === lastFocusElement;

      pressed.add( event.key );

      if ( event.key === "Escape" ) {
        this.close();
      }

      if ( !pressed.has("Tab") ) {
        return;
      }

      if ( document.activeElement === document.body ) {

        event.preventDefault();

        firstFocusElement.focus();
      }

      if ( isOnLastFocus && !pressed.has("Shift") ) {

        event.preventDefault();

        firstFocusElement.focus();
      }

      if ( isOnFirstFocus && pressed.has("Shift") ) {

        event.preventDefault();

        lastFocusElement.focus();
      }
    };
  }

  _clearPressed( event ) {
    this._pressed.delete( event.key );
  }
}

function togglePageScroll( container ) {
  const FIXED_CLASS = "is-fixed-by-modal";
  const target = document.body;
  // const target = document.querySelector(".js-modal-header-toggle");
  const scrollbar = window.innerWidth - document.documentElement.clientWidth;
  const duration = getDuration( container );

  if ( !target.matches(`.${FIXED_CLASS}`) ) {

    target.classList.add( FIXED_CLASS );

    target.style.paddingRight = `${scrollbar}px`;

  } else {

    setTimeout(() => {

      target.classList.remove( FIXED_CLASS );

      target.style.paddingRight = "";

    }, duration );
  }
}

function getFocusElements( element ) {
  return ( element.querySelectorAll(
    `a,
     button:not(:disabled),
     input:not(:disabled),
     textarea:not(:disabled),
     select:not(:disabled),
     *[tabindex]`
  ));
}

function getDuration( element ) {
  return parseFloat(
    getComputedStyle( element ).transitionDuration
  ) * 1000;
}

try {

  window.termsModal = new Modal(".js-terms-modal"); 

} catch( error ) {

  console.log( error );

}
