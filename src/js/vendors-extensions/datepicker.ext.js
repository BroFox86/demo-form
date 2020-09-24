{
  const inputs = document.querySelectorAll(".js-datepicker-toggle");
  const obj = {};

  for ( let i = 0; i < inputs.length; i++ ) {

    obj.i = datepicker( inputs[ i ], {

      onSelect() {
        const event = new Event("change", {
          "bubbles": true
        });

        inputs[ i ].dispatchEvent( event );
      },

      formatter: function( input, date, instance ) {
        const value = date.toISOString().slice( 0, 10 );

        input.value = value;
      }

    });
  }
}