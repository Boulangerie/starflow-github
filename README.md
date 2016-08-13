# starflow-github [![Build Status](https://travis-ci.org/Boulangerie/starflow-github.svg?branch=master)](https://travis-ci.org/Boulangerie/starflow-github)

## Prerequisites

In order to use this plugin, your project must have [starflow](http://github.com/boulangerie/starflow) as a dependency.

## Install

```
$ npm install --save-dev starflow-github
```

## Usage

Using a workflow:

```js
var starflow = require('starflow');

var steps = [
  {'github.getProject': ['user-name', 'project-name']}
];

var workflow = new starflow.Workflow(steps);
return workflow
  .addPlugin(require('starflow-github'))
  .run();
```

In an executable:

```js
module.exports = function (starflow) {
  var getProjectFactory = require('starflow-github')(starflow).factories.getProject;

  function MyExecutable() {
    starflow.BaseExecutable.call(this, 'myPlugin.myExecutable');
  }
  MyExecutable.prototype = Object.create(starflow.BaseExecutable.prototype);
  MyExecutable.prototype.constructor = MyExecutable;

  MyExecutable.prototype.exec = function exec() {
    var getProjectExecutable = this.createExecutable(getProjectFactory);
    return new starflow.Task(getProjectExecutable, ['user-name', 'project-name'])
      .run()
      .then(function () {
        var projectResponse = this.storage.get('github.getProject/project');
        starflow.logger.log('Got the following Github project: ' + projectResponse);
      }.bind(this));
  };

  return function () {
    return new MyExecutable();
  };
};
```

## Executables

Thereafter is the list of all the executable classes provided by this plugin.

> **Important** The titles indicate the name that can be used when writing the steps of a workflow.

### github.getProject

Given an user/organization name and a project name, gets all the data about the project.

Usage:
```js
// for a workflow
var steps = [
  {'github.getProject': ['Boulangerie', 'starflow-github']}
];

// in an executable
var getProjectFactory = require('starflow-github')(starflow).factories.getProject;
var getProjectExecutable = this.createExecutable(getProjectFactory);

var myTask = new starflow.Task(getProjectExecutable, ['Boulangerie', 'starflow-github']);
```

### github.createPR

Given an user/organization name, a project name, source and target branches, and a title, creates a new pull-request.

Usage:
```js
// for a workflow
var steps = [
  {'github.createPR': ['Boulangerie', 'starflow-github', 'master', 'my-feature', 'This is the title']}
];

// in an executable
var createPRFactory = require('starflow-github')(starflow).factories.createPR;
var createPRExecutable = this.createExecutable(createPRFactory);

var myTask = new starflow.Task(createPRExecutable, ['Boulangerie', 'starflow-github', 'master', 'my-feature', 'This is the title']);
```

### github.assignPR

Given an user/organization name, a project name, an assignee name and a pull-request ID, assigns someone to the PR.

Usage:
```js
// for a workflow
var steps = [
  {'github.assignPR': ['Boulangerie', 'starflow-github', 'bob', 42]}
];

// in an executable
var assignPRFactory = require('starflow-github')(starflow).factories.assignPR;
var assignPRExecutable = this.createExecutable(assignPRFactory);

var myTask = new starflow.Task(assignPRExecutable, ['Boulangerie', 'starflow-github', 'bob', 42]);
```

### github.getPRBetween

Given an user/organization name, a project name, source and target branches, gets the pull-request (if it exists) that matches this pair of branches.

Usage:
```js
// for a workflow
var steps = [
  {'github.getPRBetween': ['Boulangerie', 'starflow-github', 'master', 'my-feature']}
];

// in an executable
var getPRBetweenFactory = require('starflow-github')(starflow).factories.getPRBetween;
var getPRBetweenExecutable = this.createExecutable(getPRBetweenFactory);

var myTask = new starflow.Task(getPRBetweenExecutable, ['Boulangerie', 'starflow-github', 'master', 'my-feature']);
```

## Config

Some behaviors of this plugin depend on the values of config variables, here's the list of them and their effect.

- **TOKEN** (no default value, **mandatory**) Github token to access the API.

You can set these config variable from several ways:

- Env variables on your machine.
  
  Example (assuming `index.js` contains your workflow that uses the _github_ executables):
  
  ```
  $ starflow_github__TOKEN=abc123 node index.js 
  ```

- `.starflowrc` file at the root of your project (but you probably shouldn't choose this option as the credentials shouldn't be so easily accessible).

  Example:

  ```json
  {
    "github": {
      "TOKEN": "abc123"
    }
  }
  ```

> :bulb: **Recommendation** Store your Github token as a `starflow_github__TOKEN` variable in your `~/.bash_profile` or `~/.zshrc` file.

Internally, Starflow uses the [rc module](https://github.com/dominictarr/rc) to handle the config values.

## Storage

Some of the executables of this plugin store some values in their storage.

### github.getProject

- **project** Contains the project data (id, name, branches...) from Github.

  Example:

  ```js
  var starflow = require('starflow');

  var steps = [
    {'github.getProject': ['user-name', 'project-name']},
    {'custom.echo': '{{/github.getProject/project.name}}'} // displays "project-name"
  ];

  var workflow = new starflow.Workflow(steps);
  return workflow
    .addPlugin(require('starflow-github'))
    .addPlugin(require('starflow-custom')) // plugin that contains the 'echo' executable
    .run();
  ```

### github.createPR

- **pr** Contains the pull-request data (id, title, description...) from Github.

  Example:

  ```js
  var starflow = require('starflow');

  var steps = [
    {'github.createPR': ['Boulangerie', 'starflow-github', 'master', 'my-feature', 'This is the title']},
    {'custom.echo': '{{/github.createPR/pr.title}}'} // displays "This is the title"
  ];

  var workflow = new starflow.Workflow(steps);
  return workflow
    .addPlugin(require('starflow-github'))
    .addPlugin(require('starflow-custom')) // plugin that contains the 'echo' executable
    .run();
  ```

### github.assignPR

- **pr** Contains the pull-request data (id, title, description...) from Github.

  Example:

  ```js
  var starflow = require('starflow');

  var steps = [
    {'github.assignPR': ['Boulangerie', 'starflow-github', 'bob', 42]},
    {'custom.echo': '{{/github.assignPR/pr.title}}'} // e.g. displays "This is an awesome title!"
  ];

  var workflow = new starflow.Workflow(steps);
  return workflow
    .addPlugin(require('starflow-github'))
    .addPlugin(require('starflow-custom')) // plugin that contains the 'echo' executable
    .run();
  ```

### github.getPRBetween

- **pr** Contains the pull-request data (id, title, description...) from Github.

  Example:

  ```js
  var starflow = require('starflow');

  var steps = [
    {'github.getPRBetween': ['Boulangerie', 'starflow-github', 'master', 'my-feature']},
    {'custom.echo': '{{/github.getPRBetween/pr.title}}'} // e.g. displays "Title for my-feature dev"
  ];

  var workflow = new starflow.Workflow(steps);
  return workflow
    .addPlugin(require('starflow-github'))
    .addPlugin(require('starflow-custom')) // plugin that contains the 'echo' executable
    .run();
  ```

> **Note:** learn more about storage paths on the [Starflow documentation page](http://github.com/boulangerie/starflow/blob/master/docs/API.md#path-format).

If you want to contribute, please take the time to update this README file with the new executables/API brought by your contribution. Thank you! :heart:
