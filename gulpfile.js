//gulpとgulpのパッケージを読み込み
const { src, dest, watch, lastRun, parallel, series } = require("gulp");
const sass = require("gulp-sass");
const glob = require("gulp-sass-glob");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const htmlmin = require("gulp-htmlmin");
const del = require("del");
const ejs = require("gulp-ejs");
const concat = require("gulp-concat");
const order = require("gulp-order");
const rename = require("gulp-rename");
const cleanCSS = require("gulp-clean-css");
const pngquant = require("imagemin-pngquant");
const imagemin = require("gulp-imagemin");
const mozjpeg = require("imagemin-mozjpeg");
const uglify = require("gulp-uglify");
const browserSync = require("browser-sync");
const replace = require("gulp-replace");

//開発と本番で処理を分ける
//今回はhtmlの処理のところで使っています
const mode = require("gulp-mode")({
  modes: ["production", "development"],
  default: "development",
  verbose: false
});

//読み込むパスと出力するパスを指定
const srcPath = {
  html: {
    src: ["./source/**/*.ejs", "!" + "./source/**/_*.ejs"],
    dist: "./public"
  },
  styles: {
    src: "./source/css/**/*.scss",
    dist: "./public/css/",
    map: "./public/css/map"
  },
  scripts: {
    src: "./source/js/**/*.js",
    dist: "./public/js/",
    map: "./public/js/map",
  },
  images: {
    src: "./source/img/**/*.{jpg,jpeg,png,gif,svg}",
    dist: "./public/img/"
  }
};

//htmlの処理自動化
const htmlFunc = () => {
  return src(srcPath.html.src)
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    )
    .pipe(ejs({}, {}, { ext: ".html" })) //ejsを纏める
    .pipe(rename({ extname: ".html" })) //拡張子をhtmlに

    .pipe(
      mode.production(
        //本番環境のみ
        htmlmin({
          //htmlの圧縮
          collapseWhitespace: true, // 余白を除去する
          preserveLineBreaks: true, //改行を詰める
          minifyJS: true, // jsの圧縮
          removeComments: true // HTMLコメントを除去する
        })
      )
    )
    .pipe(replace(/[\s\S]*?(<!DOCTYPE)/, "$1"))
    .pipe(dest(srcPath.html.dist))
    .pipe(browserSync.reload({ stream: true }));
};

//Sassの処理自動化（開発用）
const stylesFunc = () => {
  return src(srcPath.styles.src, { sourcemaps: true })
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    )
    .pipe(glob())
    .pipe(sass({ outputStyle: "expanded" }).on("error", sass.logError))
    .pipe(
      postcss([
        autoprefixer({
          // IEは11以上、Androidは4、ios safariは8以上
          // その他は最新2バージョンで必要なベンダープレフィックスを付与する
          //指定の内容はpackage.jsonに記入している
          cascade: false,
          grid: true
        })
      ])
    )
    .pipe(dest(srcPath.styles.dist, { sourcemaps: "./map" }))
    .pipe(browserSync.reload({ stream: true }));
};

//Sassの処理自動化（本番用）
const stylesCompress = () => {
  return src(srcPath.styles.src)
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    )
    .pipe(glob())
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(
      postcss([
        autoprefixer({
          //上の指定と同じ
          cascade: false,
          grid: true
        })
      ])
    )
    .pipe(cleanCSS())
    .pipe(dest(srcPath.styles.dist))
    .pipe(browserSync.reload({ stream: true }));
};

//scriptの処理自動化
const scriptFunc = () => {
  return src(srcPath.scripts.src, { sourcemaps: true })
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    )
    .pipe(concat("init.js"))
    .pipe(uglify({ output: { comments: /^!/ } }))
    .pipe(
      rename({
        suffix: ".min"
      })
    )
    .pipe(dest(srcPath.scripts.dist, { sourcemaps: "./map" }))
    .pipe(browserSync.reload({ stream: true }));
};

//画像圧縮の定義
const imagesBase = [
  pngquant({
    quality: [0.7, 0.85]
  }),
  mozjpeg({
    quality: 85
  }),
  imagemin.gifsicle(),
  imagemin.mozjpeg(),
  imagemin.optipng(),
  imagemin.svgo({
    removeViewBox: false
  })
];

//画像の処理自動化
const imagesFunc = () => {
  return src(srcPath.images.src, { since: lastRun(imagesFunc) })
    .pipe(plumber({ errorHandler: notify.onError("<%= error.message %>") }))
    .pipe(imagemin(imagesBase))
    .pipe(dest(srcPath.images.dist));
};

// マップファイル除去
const cleanMap = () => {
  return del([srcPath.styles.map, srcPath.scripts.map]);
};

// ブラウザの読み込み処理
const browserSyncFunc = () => {
  browserSync({
    server: {
      baseDir: "./public",
      index: "index.html"
    },
    reloadOnRestart: true
  });
};

// ファイルに変更があったら反映
const watchFiles = (done) => {
  watch(srcPath.html.src, htmlFunc);
  watch(srcPath.styles.src, stylesFunc);
  watch(srcPath.scripts.src, scriptFunc);
  watch(srcPath.images.src, imagesFunc);
  done();
};

exports.default = parallel(watchFiles, browserSyncFunc); //gulpの初期処理
exports.build = parallel(htmlFunc, stylesFunc, scriptFunc, imagesFunc);

exports.sasscompress = stylesCompress;
exports.cleanmap = cleanMap;