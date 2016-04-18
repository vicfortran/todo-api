var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

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
	var queryParams = _.pick(req.query, 'q', 'completed');

	if (queryParams.hasOwnProperty('completed') && queryParams.completed === "true") {
		queryParams.completed = true;
	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed === "false") {
		queryParams.completed = false;
	}

	db.todo.then(function () {
		if (queryParams.q && queryParams.completed) {
			return db.todo.findAll({
				where: {
					description: {
						$like: '%' +queryParams.q + '%'
					},
					completed: queryParams.completed
				}
			});
		} else if (queryParams.q) {
			return db.todo.findAll({
				where: {
					description: {
						$like: '%' +queryParams.q + '%'
					}
				}
			});
		} else if (queryParams.completed) {
			return db.todo.findAll({
				where: {
					completed: queryParams.completed
				}
			});			
		} else {
			return db.todo.findAll();	
		}
	}).then(function (todos) {
		res.json(todos);
	}).catch(function (e) {
		res.status(404).json(e);
	});
});

//GET /todos/:id
app.get('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id, 10);

	db.todo.findOne({
		where: {
			id: todoId
		}
	}).then(function (todo) {
		res.json(todo);
	}).catch(function (e) {
		res.status(404).json(e);
	});
});

// POST /todos
app.post('/todos', function (req, res) {
	var body = _.pick(req.body, 'description', 'completed');

	db.todo.create(body).then(function (todo) {
		res.json(todo.toJSON());
	}).catch(function (e) {
		res.status(400).json(e);
	});
});

// DELETE /todoes/:id
app.delete('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id, 10);

	db.todo.destroy({
		where: {
			id: todoId
		}
	}).then(function () {
		res.json(matchedTodo);
	}).catch(function (e) {
		res.status(404).json(e);
	});	
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

db.sequelize.sync().then(function () {
	app.listen(PORT, function () {
		console.log('Express listening on port ' + PORT + '!');
	});
});