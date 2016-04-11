var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.send('Todo API Root');
});

//GET /todos
app.get('/todos', function (req, res) {
	var queryParams = _.pick(req.query, 'description', 'completed');
	var filteredTodos = todos;

	if (queryParams.hasOwnProperty('completed') && queryParams.completed === "true") {
		queryParams.completed = true;
	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed === "false") {
		queryParams.completed = false;
	}

	filteredTodos = _.where(filteredTodos, queryParams);

	res.json(filteredTodos);
});

//GET /todoes/:id
app.get('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});

	if (matchedTodo) {
		res.json(matchedTodo);
	} else {
		res.status(404).send();
	}
});

// POST /todos
app.post('/todos', function (req, res) {
	var todo = _.pick(req.body, 'description', 'completed');

	if (!_.isBoolean(todo.completed) || !_.isString(todo.description) || todo.description.trim().length === 0) {
		return res.status(400).send();
	}

	todo.description = todo.description.trim();
	todo.id = todoNextId++;	
	todos.push(todo);

	res.json(todo);
});

// DELETE /todoes/:id
app.delete('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});

	if (!matchedTodo) {
		return res.status(404).send();	
	}

	todos = _.without(todos, matchedTodo);
	res.json(matchedTodo);	
});

// PUT /todos/:id
app.put('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});
	var body = _.pick(req.body, 'description', 'completed');
	var validAttributes = {};

	if (!matchedTodo) {
		return res.status(404).send();
	}

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		return res.status(400).send();
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		validAttributes.description = body.description;
	} else if (body.hasOwnProperty('description')) {
		return res.status(400).send();
	}

	_.extend(matchedTodo, validAttributes);
	res.json(matchedTodo);
});

app.listen(PORT, function () {
	console.log('Express listening on port ' + PORT + '!');
});