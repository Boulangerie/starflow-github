module.exports = function (starflow, githubService) {

  var _ = require('lodash');
  var Promise = require('bluebird');

  function CreatePR() {
    starflow.BaseExecutable.call(this, 'github.createPR');
  }
  CreatePR.prototype = Object.create(starflow.BaseExecutable.prototype);
  CreatePR.prototype.constructor = CreatePR;

  CreatePR.prototype.createPR = function createPR(username, projectName, sourceBranch, targetBranch, title) {
    var githubCreatePR = Promise.promisify(githubService.pullRequests.create, {context: githubService});
    return githubCreatePR({
      user: username,
      repo: projectName,
      base: sourceBranch,
      head: (username + ':' + targetBranch),
      title: title
    })
      .then(onSuccess.bind(this), onError);

    function onSuccess(pr) {
      starflow.logger.success('Pull-request successfully created: ' + pr.html_url);
      this.storage.set('pr', pr);
    }

    function onError(err) {
      if (/already exists/.test(err.message)) {
        var prKey = username + '/' + projectName + ' ' + sourceBranch + ':' + targetBranch; // e.g. me/my-project master:my-dev
        starflow.logger.warning('Pull-request "' + prKey + '" already exists');
      }
      else {
        starflow.logger.error('Could not create the pull-request');
        throw err;
      }
    }

  };

  CreatePR.prototype.exec = function exec(username, projectName, sourceBranch, targetBranch, title) {
    if (_.isEmpty(username)) {
      throw new Error('Username/Organization is required to create a Github pull-request');
    }
    if (_.isEmpty(projectName)) {
      throw new Error('Project name is required to create a Github pull-request');
    }
    if (!_.isString(sourceBranch)) {
      throw new Error('A source branch (base) is required to create a Github pull-request');
    }
    if (_.isEmpty(targetBranch)) {
      throw new Error('A target branch (head) is required to create a Github pull-request');
    }
    if (_.isEmpty(title)) {
      throw new Error('A title is required to create a Github pull-request');
    }

    return this.createPR(username, projectName, sourceBranch, targetBranch, title);
  };

  return function () {
    return new CreatePR();
  };

};
