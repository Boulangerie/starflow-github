module.exports = function (starflow, config) {

  // API: http://github.com/mikedeboer/node-github
  var GithubApi = require('github');

  var githubService = new GithubApi({version: '3.0.0'});
  githubService.authenticate({
    type: 'oauth',
    token: config.TOKEN
  });

  return githubService;

};
