module.exports = function (starflow, githubService) {

  var _ = require('lodash');
  var Promise = require('bluebird');

  function AssignPR() {
    starflow.BaseExecutable.call(this, 'github.assignPR');
  }
  AssignPR.prototype = Object.create(starflow.BaseExecutable.prototype);
  AssignPR.prototype.constructor = AssignPR;

  AssignPR.prototype.assignPR = function assignPR(username, projectName, assignee, prNumber) {
    var githubAssignPr = Promise.promisify(githubService.issues.edit, {context: githubService});
    return githubAssignPr({
      user: username,
      repo: projectName,
      assignee: assignee,
      number: prNumber
    })
      .then(onSuccess.bind(this), onError);

    function onSuccess() {
      starflow.logger.success('Pull-request ' + prNumber + ' successfully assigned to ' + assignee);
      // there is not the base and head objects in the issue received from api.issues.edit, so we need to get the PR
      return Promise.promisify(githubService.pullRequests.get, {context: githubService})({
          user: username,
          repo: projectName,
          number: prNumber
        })
        .then(function (pr) {
          this.storage.set('pr', pr);
          return pr;
        }.bind(this));
    }

    function onError(err) {
      starflow.logger.error('Github project "' + projectName + '" was not found with ' + username + ' user');
      throw err;
    }

  };

  AssignPR.prototype.exec = function exec(username, projectName, assignee, prNumber) {
    if (_.isEmpty(username)) {
      throw new Error('Username/Organization is required to assign someone on a Github pull-request');
    }
    if (_.isEmpty(projectName)) {
      throw new Error('Project name is required to assign someone on a Github pull-request');
    }
    if (!_.isString(assignee)) {
      throw new Error('A Github pull-request must have a valid assignee (emptyString or Github user)');
    }
    if (_.isEmpty(prNumber)) {
      throw new Error('A Github pull-request must be targeted by his PR Number');
    }

    return this.assignPR(username, projectName, assignee, prNumber);
  };

  return function () {
    return new AssignPR();
  };

};
