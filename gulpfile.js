const gulp = require('gulp')
const browserSync = require('browser-sync').create()
const cleanCSS = require('gulp-clean-css');
const changed = require('gulp-changed');
const imagemin = require('gulp-imagemin');
const imageminJpg = require('imagemin-jpeg-recompress');
const imageminPng = require('imagemin-pngquant');
const imageminGif = require('imagemin-gifsicle');
const svgmin = require('gulp-svgmin');
const htmlmin = require('gulp-htmlmin');

const paths = {
    srcDir: './src/img',
    dstDir: './dist/img'
}


gulp.task('minify-html', () => {
    return gulp.src('src/*.html')
        .pipe(htmlmin({
            // 余白を除去する
            collapseWhitespace: true,
            // HTMLコメントを除去する
            removeComments: true
        }))
        .pipe(gulp.dest('dist'))
})

gulp.task('sass', () => {
    const sass = require('gulp-sass')
    const cssnext = require('postcss-cssnext')
    const postcss = require('gulp-postcss')
    const processors = [cssnext({
        browsers: ['last 2 version']
    })]
    return gulp
        .src('./src/scss/*.scss')
        .pipe(sass())
        .pipe(postcss(processors))
        .pipe(cleanCSS({
            compatibility: 'ie9'
        }))
        .pipe(gulp.dest('./dist/css'))
})

gulp.task('babel', () => {
    const babel = require('gulp-babel')
    return gulp
        .src('./src/js/*.js')
        .pipe(babel())
        .pipe(gulp.dest('./dist/js'))
})

gulp.task('serve', done => {
    browserSync.init({
        server: {
            baseDir: './dist',
            index: 'index.html',
        },
    })
    done()
})

// jpg,png,gif画像の圧縮タスク
gulp.task('imagemin', function () {
    const srcGlob = paths.srcDir + '/**/*.+(jpg|jpeg|png|gif)';
    const dstGlob = paths.dstDir;
    gulp.src(srcGlob)
        .pipe(changed(dstGlob))
        .pipe(imagemin([
            imageminPng(),
            imageminJpg(),
            imageminGif({
                interlaced: false,
                optimizationLevel: 3,
                colors: 180
            })
        ]
        ))
        .pipe(gulp.dest(dstGlob));
});
// svg画像の圧縮タスク
gulp.task('svgmin', function () {
    const srcGlob = paths.srcDir + '/**/*.+(svg)';
    const dstGlob = paths.dstDir;
    gulp.src(srcGlob)
        .pipe(changed(dstGlob))
        .pipe(svgmin())
        .pipe(gulp.dest(dstGlob));
});

gulp.task('watch', () => {
    const browserReload = done => {
        browserSync.reload()
        done()
    }
    gulp.watch('./**/*', browserReload)
    gulp.watch('./src/*.html', gulp.series('minify-html'))
    gulp.watch('./src/scss/*.scss', gulp.series('sass'))
    gulp.watch('./src/js/*.js', gulp.series('babel'))
    gulp.watch(paths.srcDir + '/**/*', gulp.series(gulp.parallel('imagemin', 'svgmin')))
})

gulp.task('default', gulp.series('serve', 'watch', 'imagemin', 'svgmin'))
