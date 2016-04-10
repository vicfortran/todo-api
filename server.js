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
	res.json(todos);
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
})

app.listen(PORT, function () {
	console.log('Express listening on port ' + PORT + '!');
});