/**
 * GULP TASKS DOCUMENTATION
 *
 * Run 'gulp serve' to monitor sources for changes & compile it automatically.
 *
 * Run 'gulp cleanBuild' to build project in dist/.
 *
 * Run 'gulp connectDist' to launch local server in dist/.
 */

"use strict";

/* ==========================================================================
  Plugins
  ======================================================================== */

const {
  src, lastRun, dest, watch, series, parallel, symlink
} = require("gulp");

// Main plugins
import del from "del";
import browserSync from "browser-sync";
import pugIncludeGlob from "pug-include-glob";
import useref from "gulp-useref";
import uglify from "gulp-uglify-es";
import merge from "merge-stream";
import buffer from "vinyl-buffer";

// PostCSS plugins
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import flexbugsFixes from "postcss-flexbugs-fixes";
import pxtorem from "postcss-pxtorem";

// Imagemin plugins
import imagemin from "gulp-imagemin";
import imageminPngquant from "imagemin-pngquant";
import imageminSvgo from "imagemin-svgo";
import imageminJpegRecompress from "imagemin-jpeg-recompress";
import animation from "postcss-animation";

// Plug the rest via gulp-load-plugins
import loadPlugins from "gulp-load-plugins";
const plugins = loadPlugins();

/* ==========================================================================
  Paths & options
  ======================================================================== */

const PATHS = {
  workspace: {
    renders: "dist/"
  }
};

const OPTIONS = {
  jpegRecompress: {
    quality: "medium"
  },
  pngquant: {
    quality: [0.9, 1]
  },
  pxToRem: {
    propList: ["*", "!box-shadow", "!border*"]
  },
  pug: {
    basedir: `${__dirname}/src`,
    plugins: [pugIncludeGlob()]
  },
  htmlBeautify: {
    indent_size: 2,
    indent_inner_html: true,
    inline: ""
  }
};

/* ==========================================================================
  Local servers & watching process
  ======================================================================== */

export function watchFiles() {
  browserSync.init({
    server: ".temp/",
    notify: false,
    open: false,
    port: 3000,
    reloadDebounce: 500
  });

  watch("src/pug/*!(pages)/**", generateHtml);
  watch("src/pug/pages/*", generateHtmlPage);
  watch("src/scss/**", prebuildStyles);
  watch("src/js/**", prebuildScripts);
  watch("src/images/_svg-to-sprite/*", generateSvgSprite);
  // watch("src/fonts/*", prebuildFonts);

  watch(["src/images/*.*",
         "src/images/*/**",
         "!src/images/_*/**"
        ], {
    delay: 500
  }, prebuildImages);
}

export function connectDist() {
  browserSync.init({
    server: PATHS.workspace.renders,
    notify: false,
    open: false,
    port: 3002
  });
}

/* ==========================================================================
  Clean
  ======================================================================== */

function cleanTemp() {
  console.log("----- Cleaning .temp/ folder -----");
  return del(".temp/**");
}

function cleanDist() {
  console.log("----- Cleaning dist/ folder -----");
  return del(`${PATHS.workspace.renders}/**`, { force: true });
}

const clean = series(cleanTemp, cleanDist);

/* ==========================================================================
  HTML
  ======================================================================== */

export function generateHtml() {
  return src("src/pug/pages/*")
    .pipe(
      plugins.pug(OPTIONS.pug)
      .on("error", plugins.notify.onError())
    )
    .pipe(plugins.htmlBeautify(OPTIONS.htmlBeautify))
    .pipe(dest(".temp/"))
    .pipe(browserSync.stream());
}

export function generateHtmlPage() {
  return src("src/pug/pages/*", {
    since: lastRun(generateHtmlPage)
  })
    .pipe(
      plugins.pug(OPTIONS.pug)
      .on("error", plugins.notify.onError())
    )
    .pipe(plugins.htmlBeautify(OPTIONS.htmlBeautify))
    .pipe(dest(".temp/"))
    .pipe(browserSync.stream());
}

export function buildHtml() {
  return src(".temp/*.html")
    .pipe(useref({
      noAssets: true
    }))
    .pipe(dest(`${PATHS.workspace.renders}`));
}

export function validate() {
  return src(".temp/*.html")
    .pipe(plugins.w3cjs({
      showInfo: true
    }))
    .pipe(plugins.w3cjs.reporter());
}

/* ==========================================================================
  Styles
  ======================================================================== */

export function prebuildStyles() {
  return src(["src/scss/main.scss", "src/scss/vendors/*"])
    .pipe(plugins.sassGlob())
    .pipe(
      plugins.sass({
        outputStyle: "expanded"
      })
      .on("error", plugins.sass.logError))
      .on("error", plugins.notify.onError()
    )
    .pipe(
      plugins.postcss([
        // pxtorem({
	      //   propList: OPTIONS.pxToRem.propList
	      // }),
        flexbugsFixes(),
        // animation(),
        autoprefixer()
      ])
    )
    .pipe(dest(".temp/css/"))
    .pipe(browserSync.stream());
}

export function buildStyles() {
  return src(".temp/css/*")
    .pipe(plugins.concat("forms.css"))
    .pipe(plugins.postcss([ cssnano() ]))
    .pipe(dest(`${PATHS.workspace.renders}/css/`));
}

/* ==========================================================================
  Java Script
  ======================================================================== */

export function prebuildScripts() {
  return src([
    "src/js/vendors-extensions/*.*",
    "src/js/*.*",
    "!src/js/_viewport.js"
  ])
    .pipe(plugins.concat("main.js"))
    .pipe(dest(".temp/js/"))
    .pipe(src(["src/js/vendors/*.*", "src/js/_viewport.js"]))
    .pipe(dest(".temp/js/"))
    .pipe(browserSync.stream());
}

export function buildScripts() {
  return src([".temp/js/*", "!.temp/js/_viewport.js"])
    // .pipe(plugins.betterRollup({}, "iife"))
    // .pipe(plugins.babel())
    .pipe(uglify())
    .pipe(dest(`${PATHS.workspace.renders}/js/`));
}

/* ==========================================================================
  Images
  ======================================================================== */

export function prebuildImages() {
  return src([
    "src/images/*.*",
    "src/images/*/**",
    "!src/images/_*/**"
  ])
    .pipe(plugins.changed(".temp/images/"))
    .pipe(
      imagemin([
        imageminPngquant({
          quality: OPTIONS.pngquant.quality
        }),
        imageminJpegRecompress({
          quality: OPTIONS.jpegRecompress.quality
        }),
        imageminSvgo({
          plugins: [{
            removeViewBox: false
          }]
        })
      ])
    )
    .pipe(dest(".temp/images/"))
    .pipe(plugins.wait(1000))
    .pipe(browserSync.stream());
}

function copyImages() {
  return src(".temp/images/**")
    .pipe(dest(`${PATHS.workspace.renders}/images/`));
}

/* SVG sprites
  ======================================================================== */

export function generateSvgSprite() {
  return src("src/images/_svg-to-sprite/*.svg")
    .pipe(
      imagemin([
        imageminSvgo({
          plugins: [{
            removeViewBox: false
          }]
        })
      ])
    )
    .pipe(plugins.svgstore())
    .pipe(plugins.rename("sprite.svg"))
    .pipe(dest(".temp/images"))
    .pipe(browserSync.stream());
}

/* Raster sprites
  ======================================================================== */

export function generateSprite() {

  const spriteData = src("src/images/_images-to-sprite/*/*.*")
    .pipe(plugins.spritesmithMulti({
      spritesmith: (options) => {
        options.imgName = "sprite.png";
        options.cssName = "_sprite.scss";
        options.padding = 2;
        options.cssTemplate = "sprite.scss.handlebars";
      }
    }));

  const imgStream = spriteData.img
    .pipe(buffer())
    .pipe(
      imagemin([
        imageminPngquant({
          quality: OPTIONS.pngquant.quality
        }),
        imageminJpegRecompress({
          quality: OPTIONS.jpegRecompress.quality
        })
      ])
    )
    .pipe(dest(".temp/images/"));

  const cssStream = spriteData.css
    .pipe(dest("src/scss/abstracts/mixins/"));

  return merge(imgStream, cssStream);
}

/* ==========================================================================
  Fonts
  ======================================================================== */

export function prebuildFonts() {
  return src("src/fonts/")
    .pipe(symlink(".temp/fonts/"))
    .pipe(browserSync.stream());
}

export function buildFonts() {
  return src(".temp/fonts/**")
    .pipe(dest(`${PATHS.workspace.renders}/fonts/`));
}

/* ==========================================================================
  Favicons
  ======================================================================== */

export function copyFavicons() {
  return src("src/favicon-data/*")
    .pipe(dest(`${PATHS.workspace.renders}`));
}

/* ==========================================================================
  Build tasks
  ======================================================================== */

const prebuild = parallel(
  generateHtml,
  prebuildStyles,
  prebuildScripts,
  prebuildImages,
  // prebuildVideos,
  // prebuildFonts,
  generateSvgSprite,
  generateSprite
);

const build = series(
  buildHtml,
  buildScripts,
  buildStyles,
  parallel(
    copyFavicons,
    copyImages,
    // buildVideos,
    // buildFonts
  )
);

const cleanBuild = series(clean, prebuild, build);

/* ==========================================================================
  Main tasks
  ======================================================================== */

// Prebuild and watch files
const serve = series(prebuild, watchFiles);

// Set default task (gulp)
export default serve;

// Build
exports.build = build;

// Clean build
exports.cleanBuild = cleanBuild;
