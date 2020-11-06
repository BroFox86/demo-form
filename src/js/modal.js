/**
 * Modal window.
 * @param {string} selector - Container selector.
 * @version 6.0.10
 */
class Modal {

  constructor( selector ) {
    this._modal = document.querySelector( selector );
    this._pressed = new Set();
    this._lastFocus = null;
    this._listenFocusIn = null;
    this._listenKeydown = null;
    this._listenClearPressed = null;

    // To avoid inheritance issues.
    if ( this._modal ) {
      this._container = this._modal.querySelector(".modal__container");
    }
  }

  open() {
    // Save last focused element.
    this._lastFocus = document.activeElement;

    this._modal.hidden = false;

    this._modal.setAttribute( "aria-modal", true );

    togglePageScroll();

    this._listenFocusIn = this._handleFocusIn( this._container ).bind(this);

    this._listenKeydown = this._handleKeyDown.bind(this);

    this._listenClearPressed = this._clearPressed.bind(this);
    
    document.addEventListener( "focusin", this._listenFocusIn );

    document.addEventListener( "keydown", this._listenKeydown );
    
    document.addEventListener( "keyup", this._listenClearPressed );

    setTimeout(() => {
      this._modal.classList.add("is-visible");
    }, 20 );
  }

  close() {
    const duration = this._getDuration( this._container );

    this._modal.classList.remove("is-visible");

    document.removeEventListener( "focusin", this._listenFocusIn ); 

    document.removeEventListener( "keydown", this._listenKeydown );

    document.removeEventListener( "keyup", this._listenClearPressed );

    setTimeout(() => {

      togglePageScroll();

      this._modal.hidden = true;

      this._modal.removeAttribute("aria-modal");

      this._lastFocus.focus();

    }, duration );
  }

  _handleFocusIn( container ) { 

    return ({ target, relatedTarget }) => {
      const pressed = this._pressed;
      const focusElements = getFocusElements( container );
      const firstFocusElement = focusElements[ 0 ];
      const lastFocusElement = focusElements[ focusElements.length - 1 ];

      if ( pressed.has("Shift") && relatedTarget === firstFocusElement ) {
        lastFocusElement.focus();
        return;
      } 
      
      if ( !pressed.has("Shift") && relatedTarget === lastFocusElement ) {
        firstFocusElement.focus();
        return;
      }

      if ( !container.contains( target ) ) {

        if ( pressed.has("Shift") ) {
          
          lastFocusElement.focus();

        } else {
          firstFocusElement.focus();
        }
      }
    };
  }

  _handleKeyDown({ key }) {
    
    if ( key === "Escape" ) {

      this.close();

    } else {

      this._pressed.add( key );
    }
  }

  _clearPressed({ key }) {
    this._pressed.delete( key );
  }

  _getDuration( element ) {
    return parseFloat(
      getComputedStyle( element ).transitionDuration
    ) * 1000;
  }
}

function togglePageScroll() {
  const FIXED_CLASS = "is-fixed-by-modal";
  const target = document.body;
  // const target = document.querySelector(".js-modal-header-toggle");
  const scrollbar = window.innerWidth - document.documentElement.clientWidth;

  if ( !target.classList.contains( FIXED_CLASS ) ) {

    target.classList.add( FIXED_CLASS );

    target.style.paddingRight = `${scrollbar}px`;

  } else {

    target.classList.remove( FIXED_CLASS );

    target.style.paddingRight = "";
  }
} 

function getFocusElements( container ) {
  return ( container.querySelectorAll(
    `a,
     button:not(:disabled),
     input:not(:disabled),
     textarea:not(:disabled),
     select:not(:disabled),
     *[tabindex]:not(:disabled)`
  ));
}

try {

  window.termsModal = new Modal(".js-terms-modal"); 

} catch( error ) {

  console.log( error );

} 
