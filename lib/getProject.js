module.exports = function (starflow, githubService) {

  var _ = require('lodash');
  var Promise = require('bluebird');

  function GetProject() {
    starflow.BaseExecutable.call(this, 'github.getProject');
  }
  GetProject.prototype = Object.create(starflow.BaseExecutable.prototype);
  GetProject.prototype.constructor = GetProject;

  GetProject.prototype.getProject = function getProject(username, projectName) {
    var githubGetProject = Promise.promisify(githubService.repos.get, {context: githubService});
    return githubGetProject({
      user: username,
      repo: projectName
    })
      .then(onSuccess.bind(this), onError);

    function onSuccess(project) {
      starflow.logger.success('Github project "' + project.full_name + '" found - (' + project.stargazers_count + ' ☆)');
      this.storage.set('project', project);
    }

    function onError(err) {
      starflow.logger.error('Github project "' + projectName + '" was not found with ' + username + ' user');
      throw err;
    }

  };

  GetProject.prototype.exec = function exec(username, projectName) {
    if (_.isEmpty(username)) {
      throw new Error('Username/Organization is required to get a Github project');
    }

    if (_.isEmpty(projectName)) {
      throw new Error('Project name is required to get a Github project');
    }

    return this.getProject(username, projectName);
  };

  return function () {
    return new GetProject();
  };


};
