const gulp = require('gulp');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const exec = require('gulp-exec');
const eslint = require('gulp-eslint');
const del = require('del');

// Build scripts
gulp.task('build', () =>
  gulp.src('src/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'))
);

// Clean built scripts
gulp.task('clean', () => del('dist/**'));

// Clean then build
gulp.task('rebuild', gulp.series('clean', 'build'));

// Lint scripts
gulp.task('lint', () =>
  gulp.src('src/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
);

// Commit & tag version
gulp.task('tag-release', () => {
  const version = require('./package.json').version;
  return gulp.src('.')
    .pipe(exec(`git commit -am "Prepare ${version} release"`))
    .pipe(exec(`git tag v${version}`))
    .pipe(exec(`git push origin : v${version}`));
});

gulp.task('default', gulp.parallel('lint', 'rebuild'));