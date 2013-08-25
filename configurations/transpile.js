module.exports = {
  main: {
    type: "amd",
    compatFix: true, // remove once RSVP is on the new transpiler
    files: [{
      expand: true,
      cwd: 'lib/',
      src: ['**/*.js'],
      dest: 'tmp/amd/'
    }, {
      expand: true,
      cwd: 'tmp/',
      src: ['oasis/**/*.js'],
      dest: 'tmp/amd/'
    }]
  },

  test: {
    type: "amd",
    files: [{
      expand: true,
      src: ['test/*.js', 'test/helpers/**/*.js'],
      dest: 'tmp'
    }]
  }
};
