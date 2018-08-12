module.exports = function( grunt ) {
  grunt.initConfig({
    insert: {
      options: {},
      notification_click: {
        src: './build-helpers/ngsw-worker-notification-click.js',
        dest: './dist/lalilulelo/ngsw-worker.js',
        match: '// The debugger generates debug pages in response to debugging requests.'
      },
      on_push: {
        src: './build-helpers/ngsw-worker-onPush.js',
        dest: './dist/lalilulelo/ngsw-worker.js',
        match: 'msg.waitUntil(this.handlePush(msg.data.json()));'
      }
    }
  })

  grunt.registerTask( 'default', ['insert'] )

  grunt.loadNpmTasks( 'grunt-insert' )
}
