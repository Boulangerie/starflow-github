var fs = require('fs');
var path = require('path');
var os = require('os');
var expect = require('chai').expect;
var createPRFactoryWrapper = require('../lib/createPR');
var _ = require('lodash');
var starflow = require('starflow');

var getPullRequest200Response = fs.readFileSync(path.resolve(__dirname + '/fixtures/get-pull-request-200.json'), 'utf8');

var githubServiceMock = {
  pullRequests: {
    create: function (params, cb) {
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
      res.title = params.title;

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

describe('CreatePR', function () {

  it('Factory should provide an executable instance', function () {
    var createPRInstance = createPRFactoryWrapper(starflow)();
    expect(typeof createPRInstance).to.equal('object');
    expect(typeof createPRInstance.exec).to.equal('function');
  });

  it('Name should be "github.createPR"', function () {
    var createPRInstance = createPRFactoryWrapper(starflow)();
    expect(createPRInstance.name).to.equal('github.createPR');
  });

  it('should store data about the pull-request in the "pr" entry', function (done) {
    var createPRInstance = createPRFactoryWrapper(starflow, githubServiceMock)();
    createPRInstance
      .exec('octocat', 'Hello-World', 'master', 'new-topic', 'new-feature')
      .then(function () {
        var pr = createPRInstance.storage.get('pr');
        expect(pr.user.login).to.equal('octocat');
        expect(pr.base.repo.name).to.equal('Hello-World');
        expect(pr.base.ref).to.equal('master');
        expect(pr.head.ref).to.equal('new-topic');
        expect(pr.title).to.equal('new-feature');
        done();
      });
  });

});
