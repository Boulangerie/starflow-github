module.exports = function (starflow) {

  var config = {
    TOKEN: starflow.config.get('github.TOKEN')
  };

  var githubService = require('./lib/githubService')(starflow, config);

  return {
    service: githubService,
    factories: {
      getProject: require('./lib/getProject')(starflow, githubService),
      createPR: require('./lib/createPR')(starflow, githubService),
      assignPR: require('./lib/assignPR')(starflow, githubService),
      getPRBetween: require('./lib/getPRBetween')(starflow, githubService)
    }
  };

};
