/**
 * Modal window.
 * @param {string} selector - Container selector.
 * @version 6.0.4-M
 */
class Modal {

  constructor( selector ) {
    this.modal = document.querySelector( selector );
    this.container = this.modal.querySelector(".modal__container");
  }

  open() {
    this.modal.hidden = false;

    this.modal.removeAttribute("aria-hidden");

    this.modal.setAttribute( "aria-modal", true );

    setTimeout(() => {

      this.modal.classList.add("is-visible");

      this._togglePageScroll();

    }, 20 );
  }

  close() {
    const duration = this._getDuration( this.container );

    this.modal.classList.remove("is-visible");

    this.modal.setAttribute("aria-hidden", "true");

    this._togglePageScroll();

    setTimeout(() => {

      this.modal.hidden = true;

      this.modal.removeAttribute("aria-modal");

    }, duration );
  }

  _togglePageScroll() {
    const body = document.body;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const FIXED_CLASS = "is-fixed-by-modal";

    if ( !body.matches(`.${FIXED_CLASS}`) ) {

      body.classList.add( FIXED_CLASS );

      body.style.marginRight = `${scrollbar}px`;

    } else {

      setTimeout(() => {

        body.classList.remove( FIXED_CLASS );

        body.style.marginRight = "";

      }, this._getDuration( this.container ));
    }
  }

  _getDuration( element ) {
    return parseFloat(
      getComputedStyle( element ).transitionDuration
    ) * 1000;
  }
}

try {

  window.termsModal = new Modal(".js-terms-modal");

} catch( error ) {

  console.log( error );

}
