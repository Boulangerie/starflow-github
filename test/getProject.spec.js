var fs = require('fs');
var path = require('path');
var os = require('os');
var expect = require('chai').expect;
var getProjectFactoryWrapper = require('../lib/getProject');
var starflow = require('starflow');

var getRepo200Response = fs.readFileSync(path.resolve(__dirname + '/fixtures/get-repo-200.json'), 'utf8');

var githubServiceMock = {
  repos: {
    get: function (params, cb) {
      var res = JSON.parse(getRepo200Response);

      res.owner.login = params.user;
      res.name = params.repo;

      cb(null, res);
    }
  }
};

beforeEach(function () {
  starflow.logger.mute();
});

afterEach(function () {
  starflow.logger.unmute();
});

describe('GetProject', function () {

  it('Factory should provide an executable instance', function () {
    var getProjectInstance = getProjectFactoryWrapper(starflow)();
    expect(typeof getProjectInstance).to.equal('object');
    expect(typeof getProjectInstance.exec).to.equal('function');
  });

  it('Name should be "github.getProject"', function () {
    var getProjectInstance = getProjectFactoryWrapper(starflow)();
    expect(getProjectInstance.name).to.equal('github.getProject');
  });

  it('should store data about the repository in the "project" entry', function (done) {
    var getProjectInstance = getProjectFactoryWrapper(starflow, githubServiceMock)();
    getProjectInstance
      .exec('octocat', 'Hello-World')
      .then(function () {
        var project = getProjectInstance.storage.get('project');
        expect(project.owner.login).to.equal('octocat');
        expect(project.name).to.equal('Hello-World');
        done();
      });
  });

});
