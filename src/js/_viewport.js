/**
 * Display viewport size of the page.
 * @param {string} styles - String with CSS decalrations.
 * @author Daur Gamisonia <daurgam@gmail.com>
 * @version 1.0.1
 */
function showViewportSize( styles ) {
  const indicator = document.createElement("div");

  indicator.style.cssText = styles;

  document.body.append( indicator );

  [ "DOMContentLoaded", "resize" ].forEach(( item ) => {
    window.addEventListener( item, () => {
      indicator.textContent = window.innerWidth + "x" + window.innerHeight;
    });
  });
}

showViewportSize(`
  position: fixed;
  z-index: 9999;
  bottom: 0;
  left: 1%;
  background: white;
  color: blue;
`);