module.exports = function( grunt ) {
  grunt.initConfig({
    insert: {
      options: {},
      main: {
        src: './build-helpers/ngsw-worker.js',
        dest: './dist/chat-front/ngsw-worker.js',
        match: '// The debugger generates debug pages in response to debugging requests.'
      }
    }
  })

  grunt.registerTask( 'default', ['insert'] )

  grunt.loadNpmTasks( 'grunt-insert' )
}
