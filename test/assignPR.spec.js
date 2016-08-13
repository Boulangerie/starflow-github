var fs = require('fs');
var path = require('path');
var os = require('os');
var expect = require('chai').expect;
var assignPRFactoryWrapper = require('../lib/assignPR');
var starflow = require('starflow');

var getPullRequest200Response = fs.readFileSync(path.resolve(__dirname + '/fixtures/get-pull-request-200.json'), 'utf8');

var githubServiceMock = {
  issues: {
    edit: function (params, cb) {
      var res = JSON.parse(getPullRequest200Response);

      res.number = params.number;
      res.assignee.login = params.assignee;
      res.user.login = params.user;
      res.base.user.login = params.user;
      res.base.repo.name = params.repo;
      res.base.repo.owner.login = params.user;
      res.head.user.login = params.user;
      res.head.repo.name = params.repo;
      res.head.repo.owner.login = params.user;

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

describe('AssignPR', function () {

  it('Factory should provide an executable instance', function () {
    var assignPRInstance = assignPRFactoryWrapper(starflow)();
    expect(typeof assignPRInstance).to.equal('object');
    expect(typeof assignPRInstance.exec).to.equal('function');
  });

  it('Name should be "github.assignPR"', function () {
    var assignPRInstance = assignPRFactoryWrapper(starflow)();
    expect(assignPRInstance.name).to.equal('github.assignPR');
  });

  it('should store data about the pull-request in the "pr" entry', function (done) {
    var assignPRInstance = assignPRFactoryWrapper(starflow, githubServiceMock)();
    assignPRInstance
      .exec('octocat', 'Hello-World', 'bob', 123)
      .then(function () {
        var pr = assignPRInstance.storage.get('pr');
        expect(pr.number).to.equal(123);
        expect(pr.assignee.login).to.equal('bob');
        expect(pr.user.login).to.equal('octocat');
        expect(pr.base.repo.name).to.equal('Hello-World');
        done();
      });
  });

});
