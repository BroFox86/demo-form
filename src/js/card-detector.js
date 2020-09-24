class CardDetector {
  /**
   * @param {HTMLElement} field - Field wrapper.
   */
  constructor( field ) {
    this.field = field;
    this.handleInput();
  }

  handleInput() {
    this.field.addEventListener("input", ( event ) => {
      this._handleIcons( event.target.value );
    });
  }

  _handleIcons( value ) {
    const field = this.field;

    // if ( value.length != 16 ) {

    //   field.dataset.cardType = "";

    //   return;
    // }

    switch( value[0] ) {

      case "3":
        field.dataset.cardType = "amex";
        break;

      case "4":
        field.dataset.cardType = "visa";
        break;

      case "5":
        field.dataset.cardType = "mc";
        break;

      case "6":
        field.dataset.cardType = "discover";
        break;

      default:
        field.dataset.cardType = "";
        break;
    }
  }
}

try {

  const cardDetector = new CardDetector(
    document.querySelector(".js-card-detection-toggle")
  );

} catch( error ) {

  console.log( error );

}
