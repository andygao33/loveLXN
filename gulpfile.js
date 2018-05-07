var path = require('path');

var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var notify = require('gulp-notify');
var stripCssComments = require('gulp-strip-css-comments');
var plumber = require('gulp-plumber');
var gutil = require('gulp-util');
var cssbeautify = require('cssbeautify');
var mapStream = require('map-stream');
var colors = require('colors');
var minimatch = require('minimatch');
var concat = require('gulp-concat');//多个文件合并为一个
var uglify = require('gulp-uglify');//js文件压缩
var rename = require('gulp-rename');

var execSync = require('child_process').execSync;
var projectPath = execSync('git rev-parse --show-toplevel').toString().trim().replace(/\\n/g);

// 指定要编译的目录
var watchFilesPath = [
'bower_components/bootstrap/dist/css/bootstrap.css',
'bower_components/slick-carousel/slick/slick.scss',
'bower_components/slick-carousel/slick/slick-theme.scss',
'bower_components/jquery-colorbox/example1/colorbox.css',
'sass/*.scss'
];
var pluginJSPath = ['bower_components/jquery/jquery.js',
'bower_components/slick-carousel/slick/slick.js',
'bower_components/jquery.cookie/jquery.cookie.js',
'bower_components/jquery-colorbox/jquery.colorbox-min.js',
'js/lib/*.js'
];
var jsFilesPath = ['js/custom/*.js'];
var buildCSSBasePath = 'css';
var buildJSBasePath = 'script';

// 编译成功通知开关
var successNotify = true;


// 将.scss/.sass文件实时转变为.css文件
gulp.task('styles', function() {
    return gulp.src(watchFilesPath)
        .pipe(plumber({
            errorHandler: reportError
        }))
        .pipe(mapStream(function(file, cb) {
            cb(null, file);
        }))
        .pipe(sass())
        // 去掉css注释
        .pipe(stripCssComments())
        // auto prefix
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        // css格式化、美化（因为有f2ehint，故在此不再做语法等的检查与修复）
        .pipe(mapStream(function(file, cb) {
            // 添加css代码的格式化
            var cssContent = file.contents.toString();

            if (/\.(css|sass|scss)/.test(path.extname(file.path))) {
                file.contents = new Buffer(cssbeautify(cssContent, {
                    indent: '',
                    openbrace: 'end-of-line',
                    autosemicolon: true
                }));
            }

            cb(null, file);
        }))
        .pipe(concat('style.css'))//合成到一个css
        .pipe(rename('style.css'))//输出到css目录
        // 将编译后的.css文件存放在.scss文件所在目录下
        .pipe(gulp.dest(function(file) {
            return buildCSSBasePath;
        }))
        // 编译成功后的提示（频繁提示会有点烦人，可将successNotify设置为：false关闭掉）
        .pipe(notify(function(file) {
            return successNotify && 'scss/sass编译成功！';
        }));
});

gulp.task('minifyjs', function(){
    return gulp.src(jsFilesPath)
        .pipe(concat('build.js'))//合成到一个js
        .pipe(gulp.dest(buildJSBasePath))//输出到js目录
});

gulp.task('vendorjs', function(){
    return gulp.src(pluginJSPath)
        .pipe(concat('vendor.js'))//合成到一个js
        .pipe(rename('vendor.js'))//输出到js目录
        .pipe(gulp.dest(buildJSBasePath));//输出到js目录
});

gulp.task('watch', function() {
    // Watch .scss files
    gulp.watch(watchFilesPath, ['styles']);
});

// 监听任务时先执行一次编译
gulp.task('default', function() {
    gulp.start('styles', 'minifyjs', 'vendorjs');
});

/**
    ########### helpers ###########
*/

function reportError(error) {
    var lineNumber = (error.lineNumber) ? 'LINE ' + error.lineNumber + ' -- ' : '';

    notify({
        title: '编译失败 [' + error.plugin + ']',
        message: lineNumber + '具体错误请看控制台！',
        sound: 'Sosumi' // See: https://github.com/mikaelbr/node-notifier#all-notification-options-with-their-defaults
    }).write(error);

    gutil.beep();

    // Pretty error reporting
    var report = '';
    var chalk = gutil.colors.white.bgRed;

    report += chalk('TASK:') + ' [' + error.plugin + ']\n';
    report += chalk('PROB:') + ' ' + error.message + '\n';
    if (error.lineNumber) {
        report += chalk('LINE:') + ' ' + error.lineNumber + '\n';
    }
    if (error.fileName) {
        report += chalk('FILE:') + ' ' + error.fileName + '\n';
    }
    console.error(report);

    // Prevent the 'watch' task from stopping
    this.emit('end');
}
