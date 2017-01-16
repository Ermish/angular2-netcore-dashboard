/// <binding Clean='clean' />
/// <binding BeforeBuild='css' />

'use strict';

var chalk = require('chalk'),
    del = require('del'),
    es = require('event-stream'),
    filter = require('gulp-filter'),
    gulp = require('gulp'),
    gulpif = require('gulp-if'),
    path = require('path'),
    tap = require('gulp-tap'),

    autoprefixer = require('autoprefixer'),
    concat = require('gulp-concat'),
    cssmin = require('gulp-cssmin'),
    htmlmin = require('gulp-htmlmin'),
    logger = require('gulp-logger'),
    postcss = require('gulp-postcss'),
    htmlpostcss = require('gulp-html-postcss'),
    rename = require('gulp-rename'),
    rev = require('gulp-rev'),
    revReplace = require('gulp-rev-replace'),
    RevAll = require('gulp-rev-all'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    webpack = require('gulp-webpack');


var cleanAll = function (cb) {
    del.sync(['./wwwroot/dist/**/*']);
    console.log(chalk.cyan('Cleaned up wwwroot/dist folder'));
    if (typeof cb === 'function')
        cb();
}

var cleanCss = function (cb) {
    del.sync(['./wwwroot/dist/css/**/*']);
    console.log(chalk.cyan('Cleaned up css folder'));
    if (typeof cb === 'function')
        cb();
}

var cleanJs = function (cb) {
    del.sync(['./wwwroot/dist/js/**/*']);
    console.log(chalk.cyan('Cleaned up js folder'));
    if (typeof cb === 'function')
        cb();
}

var cleanHtml = function (cb) {
    del.sync(['./wwwroot/dist/html/**/*']);
    console.log(chalk.cyan('Cleaned up views folder'));
    if (typeof cb === 'function')
        cb();
}

var processComponentsCss = function () {
    return gulp.src('wwwroot/src/components/**/*.scss', { base: '.' })
        .pipe(logger({
            before: 'Starting to process scss files in components...',
            after: 'Done processing scss files!',
            showChange: true
        }))
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([
            autoprefixer({ browsers: ['last 20 versions'] })
        ]))
        .pipe(cssmin())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('.'));
};


var processCss = function(isMinimal) {
    return gulp.src('wwwroot/src/css/**/*.scss')
        .pipe(logger({
            before: 'Starting to process scss files...',
            after: 'Done processing scss files!',
            showChange: true
        }))
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([
            autoprefixer({ browsers: ['last 20 versions'] }), require('postcss-flexbugs-fixes')
        ]))
        .pipe(concat('app.css'))
        .pipe(gulp.dest('wwwroot/dist/css')) //output app.css
        .pipe(cssmin())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('wwwroot/dist/css')) //output app.min.css
        .pipe(gulp.dest('wwwroot/dist/css')); //output app-123.min.css
};

var processJs = function(isMinimal) {
    return gulp.src('wwwroot/src/js/app.js')
        .pipe(logger({
            before: 'Starting to process js files...',
            after: 'Done processing js files!',
            showChange: true
        }))
        .pipe(webpack({
            entry: {
                app: './wwwroot/src/js/app.js'
            },
            output: {
                library: 'foo',
                libraryTarget: 'window',
                filename: '[name].js'
            },
            module: {
                loaders: [
                    //{
                    //    //exclude: /(node_modules|bower_components)/,
                    //    loader: 'babel', // 'babel-loader' is also a valid name to reference
                    //    query: {
                    //        presets: ['es2015']
                    //    }
                    //}
                ]
            }
        }))
        .pipe(gulp.dest('wwwroot/dist/js')) //output app.js
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('wwwroot/dist/js')) //output app.min.js
        .pipe(gulp.dest('wwwroot/dist/js')); //output app-123.min.js
};

var processHtml = function (isMinimal) {
    var cacheBustingRevisionsManifest = "wwwroot/dist/rev-manifest.json";
    var htmlFilter = filter('**/*.html', { restore: true });
    var jsFilter = filter('**/*.js', { restore: true });

    if (isMinimal) {
        return gulp.src('wwwroot/src/html/**/*.html')
            .pipe(logger({
                before: 'Starting to process html files...',
                after: 'Done processing html files!',
                showChange: true
            }))
            .pipe(gulp.dest('wwwroot/dist/html'));
    }
    
    return gulp.src('wwwroot/src/html/**/*.html')
        .pipe(logger({
            before: 'Starting to process html files...',
            after: 'Done processing hmtl files!',
            showChange: true
        }))
        .pipe(
        //DO ANGULAR 2 STuff
         )
        .pipe(rename({ dirname: '' })) //flattens folder structure


        //.pipe(jsFilter)
        //.pipe(uglify())
        //.pipe(jsFilter.restore)
        //.pipe(htmlFilter)
        //  .pipe(htmlpostcss([
        //    autoprefixer({ browsers: ['last 20 versions'] }), require('postcss-flexbugs-fixes')
        //  ]))
        //.pipe(htmlmin({
        //    collapseWhitespace: true,
        //    minifyCSS: true
        //}))
        //.pipe(htmlFilter.restore)
        //.pipe(RevAll.revision({
        //    dontRenameFile: ['.html'],
        //    //prefix: 'wwwroot/dist/html/',
        //    replacer: function(fragment, replaceRegExp, newReference, referencedFile) {
        //        var prefix = 'wwwroot/dist/html/';
        //        var regExp = replaceRegExp;
                
        //        if (referencedFile.path.match(/.js/) && replaceRegExp.toString().includes('.js')) {
        //            //console.log(chalk.cyan('regex pattern: ' + regExp));
        //            fragment.contents = fragment.contents.replace(regExp, '$1' + prefix + newReference + '$3$4');
        //        }
        //    }
        //}))
        .pipe(gulp.dest('wwwroot/dist/html'));
};

var processImages = function () {
    return gulp.src('wwwroot/src/images/**/*')//.src('wwwroot/src/html/**/*.html')
        .pipe(logger({
            before: 'Starting to process image files...',
            after: 'Processing image files complete!',
            showChange: true
        }))
        .pipe(gulp.dest('wwwroot/dist/images'));
};


//-----------------------Tasks-----------------------\\


/**
 * Watches for any changes, processes, and automatically updates the wwwroot/dist folder.
 */
gulp.task('watch', function () {
    gulp.watch('wwwroot/src/components/**/*.scss', function(cb) {
        return processComponentsCss();
    });

    gulp.watch('wwwroot/src/css/**/*.scss', function (cb) {
        cleanCss(cb);
        return processCss(true);
    });

    gulp.watch('wwwroot/src/**/*.js', function (cb) {
        cleanJs(cb);
        return processJs(true);
    });

    gulp.watch('wwwroot/src/components/**/*.html', function (cb) {
        cleanHtml(cb);
        return processHtml(true);
    });

    gulp.watch('wwwroot/src/html/**/*.html', function (cb) {
        cleanHtml(cb);
        return processHtml(true);
    });
});

/**
 * /This performs the same functionality as the watch tasks, but does a quick complete build that loads the 'wwwroot/dist' folder. 
 * It does not vulcanize and does minimal optimization.
 */
gulp.task('build-dev-lite', function(cb) {
    cleanAll();

    es.merge([
            processImages(),
            processCss(true),
            processComponentsCss(),
            processJs(true)
        ])
        .on('end', function() {
            processHtml(true).on('end', function() { cb();  });
        });
});

/**
 * /This performs complete build that loads the 'wwwroot/dist' folder. 
 * This includes full optimization, cache-busting, vulcanization.
 */
gulp.task('build-dev', function (cb) {
    cleanAll();

    es.merge([
            processImages(),
            processCss(),
            processComponentsCss(),
            processCss(),
            processJs()
        ])
        .on('end', function() {
            processHtml(false).on('end', function () { cb(); });
        });
});

/**
 * /This is identical to build-dev except environment variables.
 */
gulp.task('build-prod', function (cb) {
    cleanAll();

    es.merge([
            processImages(),
            processCss(),
            processComponentsCss(),
            processCss(),
            processJs()
        ])
        .on('end', function() {
            processHtml().on('end', function () { cb(); });
        });
});