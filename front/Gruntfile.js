module.exports = function( grunt ) {
  grunt.initConfig({
    insert: {
      options: {},
      alter_manifest: {
        src: './build-helpers/alter-manifest.js',
        dest: './dist/service-worker.js',
        match: 'self.__precacheManifest = [].concat(self.__precacheManifest || []);'
      },
    }
  })

  grunt.registerTask( 'default', ['insert'] )

  grunt.loadNpmTasks( 'grunt-insert' )
}
