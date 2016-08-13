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

    function onSuccess(pr) {
      starflow.logger.success('Pull-request ' + prNumber + ' successfully assigned to ' + assignee);
      this.storage.set('pr', pr);
      return pr;
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
    if (!_.isNumber(prNumber) || prNumber <= 0) {
      throw new Error('A Github pull-request must be targeted by its PR Number');
    }

    return this.assignPR(username, projectName, assignee, prNumber);
  };

  return function () {
    return new AssignPR();
  };

};
