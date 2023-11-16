const dartSass = require('sass')

module.exports = function (grunt) {
    grunt.initConfig({
        // Clean
        clean: ['dist/public', 'govuk_modules'],

        // Builds Sass
        sass: {
            dev: {
                options: {
                    implementation: dartSass,
                    quietDeps: true,
                    style: 'expanded',
                    sourcemap: true,
                    includePaths: [
                        'node_modules',
                        'govuk_modules/accessible-autocomplete/'
                    ],
                    outputStyle: 'compressed'
                },
                files: [
                    {
                        expand: true,
                        cwd: 'src/assets/sass',
                        src: ['*.scss'],
                        dest: 'dist/public/stylesheets/',
                        ext: '.min.css'
                    }
                ]
            }
        },

        // Copies templates and assets from external modules and dirs
        copy: {
            assets: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/assets/',
                        src: ['**/*', '!sass/**'],
                        dest: 'dist/public/'
                    }
                ]
            }
        },
    });

    [
        'grunt-sass',
        'grunt-contrib-clean',
        'grunt-contrib-copy',
    ].forEach(function (task) {
        grunt.loadNpmTasks(task)
    })

    grunt.registerTask('generate-assets', [
        'clean',
        'copy',
        'sass'
    ])

    const defaultTasks = ['generate-assets', 'concurrent:target']

    grunt.registerTask('default', defaultTasks)

    grunt.event.on('watch', function (action, filepath, target) {
        // just copy the asset that was changed, not all of them

        if (target === 'assets') {
            grunt.config(
                'copy.assets.files.0.src',
                filepath.replace('src/assets/', '')
            )
        }
    })
}
