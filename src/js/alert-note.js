class AlertNote {

  close( button ) {
    const element = button.parentElement;
    const duration = this._getDuration( element );

    element.classList.add("is-hidden");

    setTimeout(() => element.remove(), duration);
  }

  _getDuration( element ) {
    return parseFloat(
      getComputedStyle( element ).transitionDuration
    ) * 1000;
  }
}

const alertNote = new AlertNote();