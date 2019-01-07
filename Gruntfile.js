module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);
  
    grunt.loadNpmTasks('grunt-execute');
    grunt.loadNpmTasks('grunt-contrib-clean');
  
    grunt.initConfig({
  
      clean: ["dist"],
  
      copy: {
        src_to_dist: {
          cwd: 'src',
          expand: true,
          src: ['**/*', '!**/*.js', '!**/*.scss'],
          dest: 'dist'
        },
        pluginDef: {
          expand: true,
          src: [ 'plugin.json', 'README.md' ],
          dest: 'dist',
        },
        leaflet: {
          cwd: 'node_modules/leaflet/dist/',
          expand: true,
          src: ['leaflet.js', 'leaflet.css', 'images'],
          dest: 'dist/leaflet'
        },
        leaflet_img: {
          cwd: 'node_modules/leaflet/dist/images',
          expand: true,
          src: '*',
          dest: 'dist/leaflet/images/'
  }
      },
  
      watch: {
        rebuild_all: {
          files: ['src/**/*', 'plugin.json'],
          tasks: ['default'],
          options: {spawn: false}
        },
      },
  
      babel: {
        options: {
          sourceMap: true,
          presets:  ['@babel/preset-env'],
          plugins: ['transform-es2015-modules-systemjs','@babel/plugin-transform-for-of'],
        },
        dist: {
          files: [{
            cwd: 'src',
            expand: true,
            src: ['*.js'],
            dest: 'dist',
            ext:'.js'
          }]
        },
      },
  
    });
  
    grunt.registerTask('default', ['clean', 'copy:src_to_dist', 'copy:pluginDef', 'babel']);
  };