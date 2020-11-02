/**
 * Modal window.
 * @param {string} selector - Container selector.
 * @version 6.0.7
 */
class Modal {

  constructor( selector ) {
    this._modal = document.querySelector( selector );
    this._container = this._modal.querySelector(".modal__container");
    this._listenKeyDown = this._handleKeyDown( this._modal );
  }

  open() {
    this._modal.hidden = false;

    this._modal.setAttribute( "aria-modal", true );

    this._togglePageScroll();

    document.addEventListener( "keydown", this._listenKeyDown );

    setTimeout(() => {

      this._modal.classList.add("is-visible");

    }, 20 );
  }

  close() {
    const duration = this._getDuration( this._container );

    this._modal.classList.remove("is-visible");

    this._togglePageScroll();

    setTimeout(() => {

      this._modal.hidden = true;

      this._modal.removeAttribute("aria-modal");

      document.removeEventListener( "keydown", this._listenKeyDown );

    }, duration );
  }

  _handleKeyDown( element ) {

    return ( e ) => {
      const focusElements = getFocusElements( element );
      const lastFocusElement = focusElements[ focusElements.length - 1 ];
      
      if ( e.code === "Tab" && e.target === lastFocusElement ) {
    
        e.preventDefault();
        
        focusElements[ 0 ].focus();
      }
    
      if ( e.code === "Escape" ) {
        this.close();
      }
    };
  }

  _togglePageScroll() {
    const body = document.body;
    const FIXED_CLASS = "is-fixed-by-modal";
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const duration = this._getDuration( this._container );

    if ( !body.matches(`.${FIXED_CLASS}`) ) {

      body.classList.add( FIXED_CLASS );

      body.style.paddingRight = `${scrollbar}px`;

    } else {

      setTimeout(() => {

        body.classList.remove( FIXED_CLASS );

        body.style.paddingRight = "";

      }, duration );
    }
  }

  _getDuration( element ) {
    return parseFloat(
      getComputedStyle( element ).transitionDuration
    ) * 1000;
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

try {

  window.termsModal = new Modal(".js-terms-modal"); 

} catch( error ) {

  console.log( error );

}
