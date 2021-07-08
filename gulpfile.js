let gulp = require('gulp'),
    sass = require('gulp-sass'),
    gutil = require('gulp-util'),
    webpack = require('webpack'),
    WebpackDevServer = require('webpack-dev-server'),
    webpackConfig = require('./webpack.config.js'),
    csso = require('gulp-csso')
rename      = require('gulp-rename'),
    LOCAL_SERVER_PORT = 4000;
const path = require('path');

sass.compiler = require('node-sass');

gulp.task('sass', function () {
    return gulp.src('./src/ui/styles/*.scss')
        .pipe(sass({
            outputStyle: 'expanded',
            includePaths: ['node_modules']
        }))
        .pipe(csso())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('./dist'));
});

gulp.task('sass:watch', function () {
    gulp.watch(['./src/ui/styles/*.scss'], gulp.parallel('sass'));
});


// modify some webpack config options
let myDevConfig = Object.create(webpackConfig);
console.log(webpackConfig);
let devCompiler = webpack(webpackConfig);

gulp.task('webpack:build-dev', function (callback) {
    // run webpack
    devCompiler.run(function (err, stats) {
        if (err) throw new gutil.PluginError('webpack:build-dev', err);
        gutil.log('[webpack:build-dev]', stats.toString({
            colors: true
        }));
        callback();
    });
});


gulp.task('webpack:build', function (callback) {
    // modify some webpack config options
    var myConfig = Object.create(webpackConfig);
    myConfig.plugins = myConfig.plugins.concat(
        new webpack.DefinePlugin({
            'process.env': {
                // This has effect on the react lib size
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin()
    );

    // run webpack
    webpack(myConfig, function (err, stats) {
        webpack(myConfig, function (err, stats) {
            if (err) throw new gutil.PluginError('webpack:build', err);
            gutil.log('[webpack:build]', stats.toString({
                colors: true
            }));
            callback();
        });
    });
});

gulp.task('webpack-dev-server', function (callback) {
    // modify some webpack config options

    var myConfig = Object.create(webpackConfig);


    // Start a webpack-dev-server
    new WebpackDevServer(webpack(webpackConfig), {
        publicPath: '/' + myConfig.output.publicPath,
        stats: {
            colors: true
        },
        contentBase: 'dist/'
    }).listen(8080, 'localhost', function (err) {
        if (err) throw new gutil.PluginError('webpack-dev-server', err);
        gutil.log('[webpack-dev-server]', 'http://localhost:8080/webpack-dev-server/index.html');
    });
});

gulp.task('build-dev', gulp.series('webpack:build-dev'), function () {
    gulp.watch(['scripts/**/*'], [ 'webpack:build-dev']);
});

// Production build
gulp.task('build', gulp.series('webpack:build'));

gulp.task('default', gulp.parallel('sass:watch', 'webpack:build-dev', 'webpack-dev-server'));
