var fs = require('fs');
var path = require('path');
var os = require('os');
var expect = require('chai').expect;
var getPRBetweenFactoryWrapper = require('../lib/getPRBetween');
var _ = require('lodash');
var starflow = require('starflow');

var getPullRequest200Response = fs.readFileSync(path.resolve(__dirname + '/fixtures/get-pull-request-200.json'), 'utf8');

var githubServiceMock = {
  pullRequests: {
    getAll: function (params, cb) {
      var res = JSON.parse(getPullRequest200Response);

      res.user.login = params.user;
      res.base.label = params.base;
      res.base.ref = res.base.label;
      res.base.user.login = params.user;
      res.base.repo.name = params.repo;
      res.base.repo.owner.login = res.user.login;
      res.head.label = _.last(params.head.split(':'));
      res.head.ref = res.head.label;
      res.head.user.login = _.first(params.head.split(':'));
      res.head.repo.name = params.repo;
      res.head.repo.owner.login = res.user.login;

      cb(null, [res]);
    }
  }
};

beforeEach(function () {
  starflow.logger.mute();
});

afterEach(function () {
  starflow.logger.unmute();
});

describe('GetPRBetween', function () {

  it('Factory should provide an executable instance', function () {
    var getPRBetweenInstance = getPRBetweenFactoryWrapper(starflow)();
    expect(typeof getPRBetweenInstance).to.equal('object');
    expect(typeof getPRBetweenInstance.exec).to.equal('function');
  });

  it('Name should be "github.getPRBetween"', function () {
    var getPRBetweenInstance = getPRBetweenFactoryWrapper(starflow)();
    expect(getPRBetweenInstance.name).to.equal('github.getPRBetween');
  });

  it('should store data about the pull-request in the "pr" entry', function (done) {
    var getPRBetweenInstance = getPRBetweenFactoryWrapper(starflow, githubServiceMock)();
    getPRBetweenInstance
      .exec('octocat', 'Hello-World', 'master', 'my-feature')
      .then(function () {
        var pr = getPRBetweenInstance.storage.get('pr');
        expect(pr.state).to.equal('open');
        expect(pr.user.login).to.equal('octocat');
        expect(pr.base.repo.name).to.equal('Hello-World');
        expect(pr.base.ref).to.equal('master');
        expect(pr.head.ref).to.equal('my-feature');
        done();
      });
  });

});
