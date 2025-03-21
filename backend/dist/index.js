"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
// backend/index.js
var express = require('express');
var http = require('http');
var socketIo = require('socket.io');
var cors = require('cors');
var mongoose = require('mongoose');
var multer = require('multer');
var path = require('path');
var config = require('./config.js');
var fs = require('fs');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');
var app = express();
app.use(cors());
app.use(express.json());
var server = http.createServer(app);

// Utilisation de la configuration CORS avec socket.io
var io = socketIo(server, {
  cors: {
    origin: config.api,
    // URL de votre frontend
    methods: ['GET', 'POST', 'PUT']
  }
});
mongoose.connect(config.db, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(function () {
  console.log('✅ Database connection successful');
  io.emit('dbStatus', {
    status: 'connected'
  });
})["catch"](function (error) {
  console.log('❌ Database connection failed:', error.message);
  io.emit('dbStatus', {
    status: 'error',
    message: "Database connection failed: ".concat(error.message)
  });
});

// -------- Schemas ------------------------

var FileSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    "default": Date.now
  },
  size: Number
});
var File = mongoose.model('File', FileSchema);
var meetingSchema = new mongoose.Schema({
  roomId: String,
  name: String,
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: Date,
  active: {
    type: Boolean,
    "default": true
  }
});
var Meeting = mongoose.model('Meeting', meetingSchema);
var TaskSchema = new mongoose.Schema({
  title: String,
  status: String,
  // 'todo', 'inProgress', 'done'
  order: Number,
  color: {
    type: String,
    "default": '#4A90E2'
  },
  description: String,
  begindate: Date,
  enddate: Date,
  priority: String,
  projectId: String,
  gauge: {
    type: Number,
    "default": 0
  },
  workingDay: {
    type: Number,
    "default": 0
  },
  dependencies: {
    type: String,
    "default": null
  },
  users: [{
    type: String
  }],
  likes: [{
    type: String
  }],
  // Array of user IDs who liked the task
  comments: [{
    user: String,
    content: String,
    createdAt: Date,
    firstName: String,
    lastName: String
  }]
});
var Task = mongoose.model('Task', TaskSchema);
var ProjectSchema = new mongoose.Schema({
  title: String,
  description: String,
  order: Number,
  rating: Number,
  enddate: Date,
  image: String,
  gauge: {
    type: Number,
    "default": 0
  },
  columns: {
    type: Map,
    of: {
      type: {
        name: String,
        color: {
          type: String,
          "default": '#4CAF50'
        }
      },
      "default": {
        todo: {
          name: 'Todo',
          color: '#4CAF50'
        },
        inProgress: {
          name: 'In Progress',
          color: '#4CAF50'
        },
        done: {
          name: 'Done',
          color: '#4CAF50'
        }
      }
    }
  }
});
ProjectSchema.statics.findColumnNamesByProjectId = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(projectId) {
    var project;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return this.findById(projectId);
        case 2:
          project = _context.sent;
          return _context.abrupt("return", project ? project.columns : null);
        case 4:
        case "end":
          return _context.stop();
      }
    }, _callee, this);
  }));
  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();
var Project = mongoose.model('Project', ProjectSchema);
var ProjectUsersSchema = new mongoose.Schema({
  projectId: String,
  userId: String
});
var ProjectUsers = mongoose.model('ProjectUsers', ProjectUsersSchema);
var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  // Assurez-vous de hacher les mots de passe avant de les sauvegarder !
  company: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  } // Vous pouvez sauvegarder le chemin vers l'avatar ici
});
var User = mongoose.model('User', UserSchema);
var CollaboratorSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  lastName: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  // Vous pouvez sauvegarder le chemin vers l'avatar ici
  emailGroup: {
    type: String,
    required: true
  }
});
var Collaborator = mongoose.model('Collaborator', CollaboratorSchema);

// -------- Fin de Schemas ------------------------

var namefile = '';

// io.socket 
var fileChunks = new Map();
io.on('connection', function (socket) {
  socket.on('fileChunk', /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(data) {
      var projectId, fileName, chunk, chunkIndex, totalChunks, fileType, fileSize, chunks, receivedChunks, completeFile, uploadDir, filePath, uploadedFile;
      return _regeneratorRuntime().wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            projectId = data.projectId, fileName = data.fileName, chunk = data.chunk, chunkIndex = data.chunkIndex, totalChunks = data.totalChunks, fileType = data.fileType, fileSize = data.fileSize;
            if (!fileChunks.has(fileName)) {
              fileChunks.set(fileName, new Array(totalChunks));
            }
            chunks = fileChunks.get(fileName);
            chunks[chunkIndex] = Buffer.from(chunk);
            receivedChunks = chunks.filter(Boolean).length;
            if (!(receivedChunks === totalChunks)) {
              _context2.next = 16;
              break;
            }
            completeFile = Buffer.concat(chunks);
            uploadDir = path.join(__dirname, '..', 'frontend', 'public', 'uploads', projectId);
            if (!fs.existsSync(uploadDir)) {
              fs.mkdirSync(uploadDir, {
                recursive: true
              });
            }
            filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, completeFile);
            _context2.next = 13;
            return File.create({
              projectId: projectId,
              name: fileName,
              path: "/uploads/".concat(projectId, "/").concat(fileName),
              type: fileType,
              size: fileSize
            });
          case 13:
            uploadedFile = _context2.sent;
            socket.emit('fileUploaded', uploadedFile);
            fileChunks["delete"](fileName);
          case 16:
          case "end":
            return _context2.stop();
        }
      }, _callee2);
    }));
    return function (_x2) {
      return _ref2.apply(this, arguments);
    };
  }());
  socket.on('uploadFile', /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(data) {
      var _projectId, file, uploadDir, buffer, filePath, uploadedFile;
      return _regeneratorRuntime().wrap(function _callee3$(_context3) {
        while (1) switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _projectId = data.projectId, file = data.file; // Create upload directory if it doesn't exist
            uploadDir = path.join(__dirname, '..', 'frontend', 'public', 'uploads', _projectId);
            if (!fs.existsSync(uploadDir)) {
              fs.mkdirSync(uploadDir, {
                recursive: true
              });
            }

            // Write file using Buffer
            buffer = Buffer.from(file.data);
            filePath = path.join(uploadDir, file.name);
            fs.writeFileSync(filePath, buffer);

            // Create database entry
            _context3.next = 9;
            return File.create({
              projectId: _projectId,
              name: file.name,
              path: "/uploads/".concat(_projectId, "/").concat(file.name),
              type: file.type,
              size: file.size
            });
          case 9:
            uploadedFile = _context3.sent;
            socket.emit('fileUploaded', uploadedFile);
            _context3.next = 16;
            break;
          case 13:
            _context3.prev = 13;
            _context3.t0 = _context3["catch"](0);
            console.error('Error uploading file:', _context3.t0);
          case 16:
          case "end":
            return _context3.stop();
        }
      }, _callee3, null, [[0, 13]]);
    }));
    return function (_x3) {
      return _ref3.apply(this, arguments);
    };
  }());
  socket.on('updateTask', /*#__PURE__*/function () {
    var _ref5 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4(_ref4) {
      var taskId, status, order;
      return _regeneratorRuntime().wrap(function _callee4$(_context4) {
        while (1) switch (_context4.prev = _context4.next) {
          case 0:
            taskId = _ref4.taskId, status = _ref4.status, order = _ref4.order;
            _context4.prev = 1;
            _context4.next = 4;
            return Task.findByIdAndUpdate(taskId, {
              status: status,
              order: order
            });
          case 4:
            // Diffuser la mise à jour à tous les clients connectés
            io.emit('taskUpdated', {
              taskId: taskId,
              status: status,
              order: order
            });
            _context4.next = 10;
            break;
          case 7:
            _context4.prev = 7;
            _context4.t0 = _context4["catch"](1);
            console.error('Error updating task:', _context4.t0);
          case 10:
          case "end":
            return _context4.stop();
        }
      }, _callee4, null, [[1, 7]]);
    }));
    return function (_x4) {
      return _ref5.apply(this, arguments);
    };
  }());
  socket.on('taskUpdated', function (task) {
    socket.broadcast.emit('taskUpdated', task);
  });

  // Gérez les événements pour les projets ici
  socket.on('addProject', /*#__PURE__*/function () {
    var _ref6 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5(projectData) {
      var project, defaultColumns, _projectId2;
      return _regeneratorRuntime().wrap(function _callee5$(_context5) {
        while (1) switch (_context5.prev = _context5.next) {
          case 0:
            _context5.prev = 0;
            project = '';
            defaultColumns = new Map([['todo', {
              name: 'Todo',
              color: '#4CAF50'
            }], ['inProgress', {
              name: 'In Progress',
              color: '#4CAF50'
            }], ['done', {
              name: 'Done',
              color: '#4CAF50'
            }]]);
            if (projectData.tempImage) {
              project = new Project({
                title: projectData.title,
                description: projectData.description,
                enddate: projectData.enddate,
                image: "/uploads/projects/".concat(projectData._id, "/").concat(namefile),
                gauge: projectData.gauge,
                // Add this
                columns: defaultColumns
              });
            } else {
              project = new Project({
                title: projectData.title,
                description: projectData.description,
                enddate: projectData.enddate,
                image: '',
                gauge: projectData.gauge,
                // Add this
                columns: defaultColumns
              });
            }
            _context5.next = 6;
            return project.save();
          case 6:
            _projectId2 = {
              _id: project._id
            };
            io.emit('addProjectResponse', _projectId2);
            return _context5.abrupt("return", _projectId2);
          case 11:
            _context5.prev = 11;
            _context5.t0 = _context5["catch"](0);
            console.error('Error adding project:', _context5.t0);
          case 14:
          case "end":
            return _context5.stop();
        }
      }, _callee5, null, [[0, 11]]);
    }));
    return function (_x5) {
      return _ref6.apply(this, arguments);
    };
  }());
  socket.on('addCollab', /*#__PURE__*/function () {
    var _ref7 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee6(collabData) {
      var salt, hashedPassword, collaborator;
      return _regeneratorRuntime().wrap(function _callee6$(_context6) {
        while (1) switch (_context6.prev = _context6.next) {
          case 0:
            _context6.prev = 0;
            _context6.next = 3;
            return bcrypt.genSalt(10);
          case 3:
            salt = _context6.sent;
            _context6.next = 6;
            return bcrypt.hash(collabData.password, salt);
          case 6:
            hashedPassword = _context6.sent;
            console.log(collabData.avatar);
            collaborator = new User({
              email: collabData.email,
              lastName: collabData.lastname,
              firstName: collabData.firstname,
              position: collabData.position,
              company: collabData.company,
              password: hashedPassword,
              avatar: collabData.avatar
            });
            _context6.next = 11;
            return collaborator.save();
          case 11:
            io.emit('CollaboratorAdded', collaborator);
            _context6.next = 17;
            break;
          case 14:
            _context6.prev = 14;
            _context6.t0 = _context6["catch"](0);
            console.error('Error adding Collaborator:', _context6.t0);
          case 17:
          case "end":
            return _context6.stop();
        }
      }, _callee6, null, [[0, 14]]);
    }));
    return function (_x6) {
      return _ref7.apply(this, arguments);
    };
  }());
  socket.on('updateProject', /*#__PURE__*/function () {
    var _ref8 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee7(projectData) {
      var _id, title, description, enddate, tempImage, gauge;
      return _regeneratorRuntime().wrap(function _callee7$(_context7) {
        while (1) switch (_context7.prev = _context7.next) {
          case 0:
            _context7.prev = 0;
            _id = projectData._id, title = projectData.title, description = projectData.description, enddate = projectData.enddate, tempImage = projectData.tempImage, gauge = projectData.gauge;
            if (!tempImage) {
              _context7.next = 7;
              break;
            }
            _context7.next = 5;
            return Project.findByIdAndUpdate(_id, {
              title: title,
              description: description,
              enddate: enddate,
              image: "/uploads/projects/".concat(_id, "/").concat(namefile),
              // Store complete path with filename
              gauge: gauge
            });
          case 5:
            _context7.next = 9;
            break;
          case 7:
            _context7.next = 9;
            return Project.findByIdAndUpdate(_id, {
              title: title,
              description: description,
              enddate: enddate,
              gauge: gauge
            });
          case 9:
            io.emit('projectUpdated', projectData);
            return _context7.abrupt("return", function () {
              socket.off('projectUpdated');
            });
          case 13:
            _context7.prev = 13;
            _context7.t0 = _context7["catch"](0);
            console.error('Error updating project:', _context7.t0);
          case 16:
          case "end":
            return _context7.stop();
        }
      }, _callee7, null, [[0, 13]]);
    }));
    return function (_x7) {
      return _ref8.apply(this, arguments);
    };
  }());
  socket.on('updateRatingProject', /*#__PURE__*/function () {
    var _ref9 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee8(projectData) {
      var _id, rating;
      return _regeneratorRuntime().wrap(function _callee8$(_context8) {
        while (1) switch (_context8.prev = _context8.next) {
          case 0:
            _context8.prev = 0;
            _id = projectData._id, rating = projectData.rating;
            _context8.next = 4;
            return Project.findByIdAndUpdate(_id, {
              rating: rating
            });
          case 4:
            io.emit('projectRatingUpdated', projectData);
            _context8.next = 10;
            break;
          case 7:
            _context8.prev = 7;
            _context8.t0 = _context8["catch"](0);
            console.error('Error updating project:', _context8.t0);
          case 10:
          case "end":
            return _context8.stop();
        }
      }, _callee8, null, [[0, 7]]);
    }));
    return function (_x8) {
      return _ref9.apply(this, arguments);
    };
  }());
  socket.on('updateCollaborator', /*#__PURE__*/function () {
    var _ref10 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee9(collaboratorData) {
      var salt, hashedPassword, _id, email, company, lastName, firstName, position, password;
      return _regeneratorRuntime().wrap(function _callee9$(_context9) {
        while (1) switch (_context9.prev = _context9.next) {
          case 0:
            _context9.prev = 0;
            _context9.next = 3;
            return bcrypt.genSalt(10);
          case 3:
            salt = _context9.sent;
            _context9.next = 6;
            return bcrypt.hash(password, salt);
          case 6:
            hashedPassword = _context9.sent;
            _id = collaboratorData._id, email = collaboratorData.email, company = collaboratorData.company, lastName = collaboratorData.lastName, firstName = collaboratorData.firstName, position = collaboratorData.position, password = collaboratorData.password;
            _context9.next = 10;
            return Project.findByIdAndUpdate(_id, {
              email: email,
              company: company,
              lastName: lastName,
              firstName: firstName,
              position: position,
              password: hashedPassword
            });
          case 10:
            io.emit('projectUpdated', collaboratorData);
            _context9.next = 16;
            break;
          case 13:
            _context9.prev = 13;
            _context9.t0 = _context9["catch"](0);
            console.error('Error updating project:', _context9.t0);
          case 16:
          case "end":
            return _context9.stop();
        }
      }, _callee9, null, [[0, 13]]);
    }));
    return function (_x9) {
      return _ref10.apply(this, arguments);
    };
  }());
  socket.on('updateCollaborators', /*#__PURE__*/function () {
    var _ref11 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee10(userData) {
      var _id, email, compagny, lastName, firstName, position, avatar;
      return _regeneratorRuntime().wrap(function _callee10$(_context10) {
        while (1) switch (_context10.prev = _context10.next) {
          case 0:
            _context10.prev = 0;
            _id = userData._id, email = userData.email, compagny = userData.compagny, lastName = userData.lastName, firstName = userData.firstName, position = userData.position, avatar = userData.avatar;
            _context10.next = 4;
            return User.findByIdAndUpdate(_id, {
              email: email,
              compagny: compagny,
              lastName: lastName,
              firstName: firstName,
              position: position,
              avatar: avatar
            });
          case 4:
            io.emit('collaboratorsUpdated', userData);
            _context10.next = 10;
            break;
          case 7:
            _context10.prev = 7;
            _context10.t0 = _context10["catch"](0);
            console.error('Error updating project:', _context10.t0);
          case 10:
          case "end":
            return _context10.stop();
        }
      }, _callee10, null, [[0, 7]]);
    }));
    return function (_x10) {
      return _ref11.apply(this, arguments);
    };
  }());
  socket.on('deleteProject', /*#__PURE__*/function () {
    var _ref12 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee11(projectId) {
      var _validProjectId, existingUsers, deleteResult, projectUploadPath;
      return _regeneratorRuntime().wrap(function _callee11$(_context11) {
        while (1) switch (_context11.prev = _context11.next) {
          case 0:
            _context11.prev = 0;
            _validProjectId = new mongoose.Types.ObjectId(projectId); // Check existing records before deletion
            _context11.next = 4;
            return ProjectUsers.find({
              projectId: projectId
            });
          case 4:
            existingUsers = _context11.sent;
            _context11.next = 7;
            return ProjectUsers.deleteMany({
              $or: [{
                projectId: projectId
              }, {
                projectId: _validProjectId
              }]
            });
          case 7:
            deleteResult = _context11.sent;
            _context11.next = 10;
            return Task.deleteMany({
              projectId: projectId
            });
          case 10:
            _context11.next = 12;
            return Project.findByIdAndDelete(_validProjectId);
          case 12:
            // Add directory deletion here
            projectUploadPath = path.join(__dirname, '..', 'frontend', 'public', 'uploads', 'projects', projectId);
            if (fs.existsSync(projectUploadPath)) {
              fs.rmSync(projectUploadPath, {
                recursive: true,
                force: true
              });
            }
            io.emit('projectDeleted', projectId);
            _context11.next = 20;
            break;
          case 17:
            _context11.prev = 17;
            _context11.t0 = _context11["catch"](0);
            console.error('Error deleting project:', _context11.t0);
          case 20:
          case "end":
            return _context11.stop();
        }
      }, _callee11, null, [[0, 17]]);
    }));
    return function (_x11) {
      return _ref12.apply(this, arguments);
    };
  }());
  socket.on('deleteUser', /*#__PURE__*/function () {
    var _ref13 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee12(userId) {
      var validUserId;
      return _regeneratorRuntime().wrap(function _callee12$(_context12) {
        while (1) switch (_context12.prev = _context12.next) {
          case 0:
            _context12.prev = 0;
            validUserId = new mongoose.Types.ObjectId(userId);
            _context12.next = 4;
            return User.findByIdAndDelete(validUserId);
          case 4:
            io.emit('userDeleted', userId);
            _context12.next = 10;
            break;
          case 7:
            _context12.prev = 7;
            _context12.t0 = _context12["catch"](0);
            console.error('Error deleting user:', _context12.t0);
          case 10:
          case "end":
            return _context12.stop();
        }
      }, _callee12, null, [[0, 7]]);
    }));
    return function (_x12) {
      return _ref13.apply(this, arguments);
    };
  }());
  socket.on('disconnect', function () {});
});

// -------- Authentification ------------------------

app.use(passport.initialize());

// Configuration de Passport pour l'authentification locale

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, /*#__PURE__*/function () {
  var _ref14 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee13(email, password, done) {
    var user, isMatch;
    return _regeneratorRuntime().wrap(function _callee13$(_context13) {
      while (1) switch (_context13.prev = _context13.next) {
        case 0:
          _context13.prev = 0;
          _context13.next = 3;
          return User.findOne({
            email: email
          });
        case 3:
          user = _context13.sent;
          if (user.firstName) {
            _context13.next = 6;
            break;
          }
          return _context13.abrupt("return", done(null, false, {
            message: 'Incorrect email.'
          }));
        case 6:
          _context13.next = 8;
          return bcrypt.compare(password, user.password);
        case 8:
          isMatch = _context13.sent;
          if (isMatch) {
            _context13.next = 11;
            break;
          }
          return _context13.abrupt("return", done(null, false, {
            message: 'Incorrect password.'
          }));
        case 11:
          return _context13.abrupt("return", done(null, user));
        case 14:
          _context13.prev = 14;
          _context13.t0 = _context13["catch"](0);
          return _context13.abrupt("return", done(_context13.t0));
        case 17:
        case "end":
          return _context13.stop();
      }
    }, _callee13, null, [[0, 14]]);
  }));
  return function (_x13, _x14, _x15) {
    return _ref14.apply(this, arguments);
  };
}()));

// Create new meeting
app.post('/meetings', /*#__PURE__*/function () {
  var _ref15 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee14(req, res) {
    var meeting;
    return _regeneratorRuntime().wrap(function _callee14$(_context14) {
      while (1) switch (_context14.prev = _context14.next) {
        case 0:
          _context14.prev = 0;
          meeting = new Meeting(req.body);
          _context14.next = 4;
          return meeting.save();
        case 4:
          res.status(201).json(meeting);
          _context14.next = 10;
          break;
        case 7:
          _context14.prev = 7;
          _context14.t0 = _context14["catch"](0);
          res.status(500).json({
            error: _context14.t0.message
          });
        case 10:
        case "end":
          return _context14.stop();
      }
    }, _callee14, null, [[0, 7]]);
  }));
  return function (_x16, _x17) {
    return _ref15.apply(this, arguments);
  };
}());

// Add this route with your other endpoints
app.get('/meetings/active/:userId', /*#__PURE__*/function () {
  var _ref16 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee15(req, res) {
    var userId, activeMeetings;
    return _regeneratorRuntime().wrap(function _callee15$(_context15) {
      while (1) switch (_context15.prev = _context15.next) {
        case 0:
          _context15.prev = 0;
          userId = req.params.userId;
          if (!(!userId || userId === 'null')) {
            _context15.next = 4;
            break;
          }
          return _context15.abrupt("return", res.status(400).json({
            message: 'Valid user ID is required'
          }));
        case 4:
          _context15.next = 6;
          return Meeting.find({
            participants: userId,
            active: true,
            createdAt: {
              $gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          }).populate('createdBy', 'firstName lastName');
        case 6:
          activeMeetings = _context15.sent;
          res.json(activeMeetings);
          _context15.next = 14;
          break;
        case 10:
          _context15.prev = 10;
          _context15.t0 = _context15["catch"](0);
          console.error('Error fetching active meetings:', _context15.t0);
          res.status(500).json({
            message: 'Error fetching active meetings'
          });
        case 14:
        case "end":
          return _context15.stop();
      }
    }, _callee15, null, [[0, 10]]);
  }));
  return function (_x18, _x19) {
    return _ref16.apply(this, arguments);
  };
}());

// Get user's meetings
app.get('/meetings/user/:userId', /*#__PURE__*/function () {
  var _ref17 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee16(req, res) {
    var meetings;
    return _regeneratorRuntime().wrap(function _callee16$(_context16) {
      while (1) switch (_context16.prev = _context16.next) {
        case 0:
          _context16.prev = 0;
          _context16.next = 3;
          return Meeting.find({
            participants: req.params.userId,
            active: true
          }).populate('participants', 'firstName lastName');
        case 3:
          meetings = _context16.sent;
          res.json(meetings);
          _context16.next = 10;
          break;
        case 7:
          _context16.prev = 7;
          _context16.t0 = _context16["catch"](0);
          res.status(500).json({
            error: _context16.t0.message
          });
        case 10:
        case "end":
          return _context16.stop();
      }
    }, _callee16, null, [[0, 7]]);
  }));
  return function (_x20, _x21) {
    return _ref17.apply(this, arguments);
  };
}());
app.put('/projects/:projectId/columns/:columnId/color', /*#__PURE__*/function () {
  var _ref18 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee17(req, res) {
    var color, project, columnData;
    return _regeneratorRuntime().wrap(function _callee17$(_context17) {
      while (1) switch (_context17.prev = _context17.next) {
        case 0:
          _context17.prev = 0;
          color = req.body.color;
          _context17.next = 4;
          return Project.findById(req.params.projectId);
        case 4:
          project = _context17.sent;
          columnData = project.columns.get(req.params.columnId);
          project.columns.set(req.params.columnId, {
            name: columnData.name,
            // Keep the existing name
            color: color // Update only the color
          });
          _context17.next = 9;
          return project.save();
        case 9:
          res.json(project.columns);
          _context17.next = 15;
          break;
        case 12:
          _context17.prev = 12;
          _context17.t0 = _context17["catch"](0);
          res.status(500).json({
            message: _context17.t0.message
          });
        case 15:
        case "end":
          return _context17.stop();
      }
    }, _callee17, null, [[0, 12]]);
  }));
  return function (_x22, _x23) {
    return _ref18.apply(this, arguments);
  };
}());
app.get('/users/:userId/tasks', /*#__PURE__*/function () {
  var _ref19 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee18(req, res) {
    var userId, tasks;
    return _regeneratorRuntime().wrap(function _callee18$(_context18) {
      while (1) switch (_context18.prev = _context18.next) {
        case 0:
          _context18.prev = 0;
          userId = req.params.userId; // Find all tasks where this user is assigned
          _context18.next = 4;
          return Task.find({
            users: userId
          });
        case 4:
          tasks = _context18.sent;
          res.json(tasks);
          _context18.next = 11;
          break;
        case 8:
          _context18.prev = 8;
          _context18.t0 = _context18["catch"](0);
          res.status(500).json({
            message: 'Error fetching user tasks',
            error: _context18.t0.message
          });
        case 11:
        case "end":
          return _context18.stop();
      }
    }, _callee18, null, [[0, 8]]);
  }));
  return function (_x24, _x25) {
    return _ref19.apply(this, arguments);
  };
}());
app.post('/tasks/:taskId/userId/:userId/like', /*#__PURE__*/function () {
  var _ref20 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee19(req, res) {
    var taskId, userId, task, userLikedIndex;
    return _regeneratorRuntime().wrap(function _callee19$(_context19) {
      while (1) switch (_context19.prev = _context19.next) {
        case 0:
          taskId = req.params.taskId;
          userId = req.params.userId;
          _context19.prev = 2;
          _context19.next = 5;
          return Task.findById(taskId);
        case 5:
          task = _context19.sent;
          if (task) {
            _context19.next = 8;
            break;
          }
          return _context19.abrupt("return", res.status(404).json({
            message: 'Task not found'
          }));
        case 8:
          userLikedIndex = task.likes.indexOf(userId);
          if (userLikedIndex === -1) {
            task.likes.push(userId);
          } else {
            task.likes.splice(userLikedIndex, 1);
          }
          _context19.next = 12;
          return task.save();
        case 12:
          res.json({
            likes: task.likes.length
          });
          _context19.next = 18;
          break;
        case 15:
          _context19.prev = 15;
          _context19.t0 = _context19["catch"](2);
          res.status(500).json({
            message: 'Error updating likes'
          });
        case 18:
        case "end":
          return _context19.stop();
      }
    }, _callee19, null, [[2, 15]]);
  }));
  return function (_x26, _x27) {
    return _ref20.apply(this, arguments);
  };
}());
app.get('/projects/:projectId/columns', /*#__PURE__*/function () {
  var _ref21 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee20(req, res) {
    var _projectId3, columnNames;
    return _regeneratorRuntime().wrap(function _callee20$(_context20) {
      while (1) switch (_context20.prev = _context20.next) {
        case 0:
          _context20.prev = 0;
          _projectId3 = req.params.projectId; // Fetch column names from the database for the given projectId
          // Replace this with your actual database query
          _context20.next = 4;
          return Project.findColumnNamesByProjectId(_projectId3);
        case 4:
          columnNames = _context20.sent;
          res.json(columnNames);
          _context20.next = 11;
          break;
        case 8:
          _context20.prev = 8;
          _context20.t0 = _context20["catch"](0);
          res.status(500).json({
            message: 'Error fetching column names',
            error: _context20.t0
          });
        case 11:
        case "end":
          return _context20.stop();
      }
    }, _callee20, null, [[0, 8]]);
  }));
  return function (_x28, _x29) {
    return _ref21.apply(this, arguments);
  };
}());
app.put('/projects/:projectId/columns/:columnId', /*#__PURE__*/function () {
  var _ref22 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee21(req, res) {
    var _req$params, projectId, columnId, name, project, currentColumn;
    return _regeneratorRuntime().wrap(function _callee21$(_context21) {
      while (1) switch (_context21.prev = _context21.next) {
        case 0:
          _req$params = req.params, projectId = _req$params.projectId, columnId = _req$params.columnId;
          name = req.body.name;
          _context21.prev = 2;
          _context21.next = 5;
          return Project.findById(projectId);
        case 5:
          project = _context21.sent;
          if (project) {
            _context21.next = 8;
            break;
          }
          return _context21.abrupt("return", res.status(404).json({
            message: 'Project not found'
          }));
        case 8:
          currentColumn = project.columns.get(columnId);
          project.columns.set(columnId, {
            name: name,
            color: currentColumn.color || '#4CAF50'
          });
          _context21.next = 12;
          return project.save();
        case 12:
          res.json({
            message: 'Column name updated successfully',
            column: project.columns.get(columnId)
          });
          _context21.next = 19;
          break;
        case 15:
          _context21.prev = 15;
          _context21.t0 = _context21["catch"](2);
          console.error('Error updating column name:', _context21.t0);
          res.status(500).json({
            message: 'Error updating column name',
            error: _context21.t0.message
          });
        case 19:
        case "end":
          return _context21.stop();
      }
    }, _callee21, null, [[2, 15]]);
  }));
  return function (_x30, _x31) {
    return _ref22.apply(this, arguments);
  };
}());
app.get('/users/:userId', /*#__PURE__*/function () {
  var _ref23 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee22(req, res) {
    var user;
    return _regeneratorRuntime().wrap(function _callee22$(_context22) {
      while (1) switch (_context22.prev = _context22.next) {
        case 0:
          _context22.prev = 0;
          _context22.next = 3;
          return User.findById(req.params.userId);
        case 3:
          user = _context22.sent;
          if (user) {
            _context22.next = 6;
            break;
          }
          return _context22.abrupt("return", res.status(404).json({
            message: 'User not found'
          }));
        case 6:
          res.json(user);
          _context22.next = 13;
          break;
        case 9:
          _context22.prev = 9;
          _context22.t0 = _context22["catch"](0);
          console.error('Error fetching user:', _context22.t0);
          res.status(500).json({
            message: 'Server error'
          });
        case 13:
        case "end":
          return _context22.stop();
      }
    }, _callee22, null, [[0, 9]]);
  }));
  return function (_x32, _x33) {
    return _ref23.apply(this, arguments);
  };
}());
app.get('/tasks/:taskId/users/:userId', /*#__PURE__*/function () {
  var _ref24 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee23(req, res) {
    var task, exists;
    return _regeneratorRuntime().wrap(function _callee23$(_context23) {
      while (1) switch (_context23.prev = _context23.next) {
        case 0:
          _context23.prev = 0;
          _context23.next = 3;
          return Task.findById(req.params.taskId);
        case 3:
          task = _context23.sent;
          if (task) {
            _context23.next = 6;
            break;
          }
          return _context23.abrupt("return", res.status(404).json({
            message: "Task not found"
          }));
        case 6:
          exists = task.users.includes(req.params.userId);
          res.json({
            exists: exists
          });
          _context23.next = 13;
          break;
        case 10:
          _context23.prev = 10;
          _context23.t0 = _context23["catch"](0);
          res.status(500).json({
            message: _context23.t0.message
          });
        case 13:
        case "end":
          return _context23.stop();
      }
    }, _callee23, null, [[0, 10]]);
  }));
  return function (_x34, _x35) {
    return _ref24.apply(this, arguments);
  };
}());
app.put('/tasks/:taskId', /*#__PURE__*/function () {
  var _ref25 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee24(req, res) {
    var taskId, task;
    return _regeneratorRuntime().wrap(function _callee24$(_context24) {
      while (1) switch (_context24.prev = _context24.next) {
        case 0:
          _context24.prev = 0;
          taskId = req.params.taskId;
          _context24.next = 4;
          return Task.findByIdAndUpdate(taskId, _objectSpread({}, req.body), {
            "new": true,
            runValidators: true
          });
        case 4:
          task = _context24.sent;
          res.json(task);
          _context24.next = 11;
          break;
        case 8:
          _context24.prev = 8;
          _context24.t0 = _context24["catch"](0);
          res.status(500).json({
            message: 'Error updating task',
            error: _context24.t0.message
          });
        case 11:
        case "end":
          return _context24.stop();
      }
    }, _callee24, null, [[0, 8]]);
  }));
  return function (_x36, _x37) {
    return _ref25.apply(this, arguments);
  };
}());
app.get('/tasks/:taskId', /*#__PURE__*/function () {
  var _ref26 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee25(req, res) {
    var task;
    return _regeneratorRuntime().wrap(function _callee25$(_context25) {
      while (1) switch (_context25.prev = _context25.next) {
        case 0:
          _context25.prev = 0;
          _context25.next = 3;
          return Task.findById(req.params.taskId);
        case 3:
          task = _context25.sent;
          if (task) {
            _context25.next = 6;
            break;
          }
          return _context25.abrupt("return", res.status(404).json({
            message: 'Task not found'
          }));
        case 6:
          res.json(task);
          _context25.next = 12;
          break;
        case 9:
          _context25.prev = 9;
          _context25.t0 = _context25["catch"](0);
          res.status(500).json({
            message: 'Error fetching task',
            error: _context25.t0.message
          });
        case 12:
        case "end":
          return _context25.stop();
      }
    }, _callee25, null, [[0, 9]]);
  }));
  return function (_x38, _x39) {
    return _ref26.apply(this, arguments);
  };
}());
app.post('/tasks/comment', /*#__PURE__*/function () {
  var _ref27 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee26(req, res) {
    var _req$body, taskId, comment, firstName, lastName, task;
    return _regeneratorRuntime().wrap(function _callee26$(_context26) {
      while (1) switch (_context26.prev = _context26.next) {
        case 0:
          _req$body = req.body, taskId = _req$body.taskId, comment = _req$body.comment, firstName = _req$body.firstName, lastName = _req$body.lastName;
          _context26.prev = 1;
          _context26.next = 4;
          return Task.findByIdAndUpdate(taskId, {
            $push: {
              comments: {
                content: comment,
                createdAt: new Date(),
                firstName: firstName,
                lastName: lastName
              }
            }
          }, {
            "new": true
          });
        case 4:
          task = _context26.sent;
          res.json(task);
          _context26.next = 11;
          break;
        case 8:
          _context26.prev = 8;
          _context26.t0 = _context26["catch"](1);
          res.status(500).json({
            message: 'Error adding comment',
            error: _context26.t0
          });
        case 11:
        case "end":
          return _context26.stop();
      }
    }, _callee26, null, [[1, 8]]);
  }));
  return function (_x40, _x41) {
    return _ref27.apply(this, arguments);
  };
}());
app.post('/tasks/:taskId/comments', /*#__PURE__*/function () {
  var _ref28 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee27(req, res) {
    var taskId, _req$body2, userId, content, task, newComment, user, commentWithUserDetails;
    return _regeneratorRuntime().wrap(function _callee27$(_context27) {
      while (1) switch (_context27.prev = _context27.next) {
        case 0:
          taskId = req.params.taskId;
          _req$body2 = req.body, userId = _req$body2.userId, content = _req$body2.content;
          _context27.prev = 2;
          _context27.next = 5;
          return Task.findById(taskId);
        case 5:
          task = _context27.sent;
          if (task) {
            _context27.next = 8;
            break;
          }
          return _context27.abrupt("return", res.status(404).json({
            message: 'Task not found'
          }));
        case 8:
          newComment = {
            user: userId,
            content: content,
            createdAt: new Date()
          }; // Fetch user details
          _context27.next = 11;
          return User.findById(userId);
        case 11:
          user = _context27.sent;
          // Attach user details to the comment
          commentWithUserDetails = _objectSpread(_objectSpread({}, newComment), {}, {
            firstName: user.firstName,
            lastName: user.lastName
          });
          task.comments.push(commentWithUserDetails);
          _context27.next = 16;
          return task.save();
        case 16:
          res.status(201).json(commentWithUserDetails);
          _context27.next = 23;
          break;
        case 19:
          _context27.prev = 19;
          _context27.t0 = _context27["catch"](2);
          console.error('Error adding comment:', _context27.t0);
          res.status(500).json({
            message: 'Error adding comment'
          });
        case 23:
        case "end":
          return _context27.stop();
      }
    }, _callee27, null, [[2, 19]]);
  }));
  return function (_x42, _x43) {
    return _ref28.apply(this, arguments);
  };
}());

// Point de terminaison /login
app.post('/login', /*#__PURE__*/function () {
  var _ref29 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee28(req, res, next) {
    return _regeneratorRuntime().wrap(function _callee28$(_context28) {
      while (1) switch (_context28.prev = _context28.next) {
        case 0:
          passport.authenticate('local', function (err, user, info) {
            if (err) {
              return next(err);
            }
            if (!user) {
              return res.status(400).json({
                message: info.message
              });
            }
            // Vous pouvez aussi implémenter des sessions ici si nécessaire
            return res.json({
              message: 'Login successful',
              user: user
            });
          })(req, res, next);
        case 1:
        case "end":
          return _context28.stop();
      }
    }, _callee28);
  }));
  return function (_x44, _x45, _x46) {
    return _ref29.apply(this, arguments);
  };
}());

// Route pour enregistrer un nouvel utilisateur
app.post('/signup', /*#__PURE__*/function () {
  var _ref30 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee29(req, res) {
    var _req$body3, email, password, company, lastName, firstName, position, existingUser, salt, hashedPassword, user;
    return _regeneratorRuntime().wrap(function _callee29$(_context29) {
      while (1) switch (_context29.prev = _context29.next) {
        case 0:
          _context29.prev = 0;
          // Extract the password from the request body
          _req$body3 = req.body, email = _req$body3.email, password = _req$body3.password, company = _req$body3.company, lastName = _req$body3.lastName, firstName = _req$body3.firstName, position = _req$body3.position; // Check if user with the same email already exists
          _context29.next = 4;
          return User.findOne({
            email: email
          });
        case 4:
          existingUser = _context29.sent;
          if (!existingUser) {
            _context29.next = 7;
            break;
          }
          return _context29.abrupt("return", res.status(200).send({
            message: 'Already existing user'
          }));
        case 7:
          _context29.next = 9;
          return bcrypt.genSalt(10);
        case 9:
          salt = _context29.sent;
          _context29.next = 12;
          return bcrypt.hash(password, salt);
        case 12:
          hashedPassword = _context29.sent;
          user = new User({
            email: email,
            password: hashedPassword,
            company: company,
            lastName: lastName,
            firstName: firstName,
            position: position,
            avatar: namefile
          });
          _context29.next = 16;
          return user.save();
        case 16:
          res.status(200).send({
            message: 'User successfully registered!'
          });
          _context29.next = 23;
          break;
        case 19:
          _context29.prev = 19;
          _context29.t0 = _context29["catch"](0);
          res.status(500).send({
            message: 'Could not register user.'
          });
          res.status(400).send({
            message: 'Could not register user.'
          });
        case 23:
        case "end":
          return _context29.stop();
      }
    }, _callee29, null, [[0, 19]]);
  }));
  return function (_x47, _x48) {
    return _ref30.apply(this, arguments);
  };
}());
app.put('/user/:id', /*#__PURE__*/function () {
  var _ref31 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee30(req, res) {
    var userId, user, salt, hashedPassword;
    return _regeneratorRuntime().wrap(function _callee30$(_context30) {
      while (1) switch (_context30.prev = _context30.next) {
        case 0:
          _context30.prev = 0;
          userId = req.params.id; // Find the user by ID
          _context30.next = 4;
          return User.findById(userId);
        case 4:
          user = _context30.sent;
          if (user) {
            _context30.next = 7;
            break;
          }
          return _context30.abrupt("return", res.status(404).send({
            message: 'User not found'
          }));
        case 7:
          // Update all fields including avatar
          user.email = req.body.email;
          user.company = req.body.company;
          user.lastName = req.body.lastName;
          user.firstName = req.body.firstName;
          user.position = req.body.position;
          user.avatar = req.body.avatar; // Make sure this line exists
          if (!req.body.password) {
            _context30.next = 21;
            break;
          }
          _context30.next = 16;
          return bcrypt.genSalt(10);
        case 16:
          salt = _context30.sent;
          _context30.next = 19;
          return bcrypt.hash(req.body.password, salt);
        case 19:
          hashedPassword = _context30.sent;
          user.password = hashedPassword;
        case 21:
          _context30.next = 23;
          return user.save();
        case 23:
          res.status(200).send({
            message: 'User successfully edited!'
          });
          _context30.next = 30;
          break;
        case 26:
          _context30.prev = 26;
          _context30.t0 = _context30["catch"](0);
          console.error('Error updating user:', _context30.t0);
          res.status(500).send({
            message: 'Could not update user.'
          });
        case 30:
        case "end":
          return _context30.stop();
      }
    }, _callee30, null, [[0, 26]]);
  }));
  return function (_x49, _x50) {
    return _ref31.apply(this, arguments);
  };
}());
app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));
app.get('/auth/google/callback', passport.authenticate('google', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

// -------- Fin de Authentification ------------------------

//sans io.socket
app.get('/tasks/project/:projectId', /*#__PURE__*/function () {
  var _ref32 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee31(req, res) {
    var projectId, order, tasks;
    return _regeneratorRuntime().wrap(function _callee31$(_context31) {
      while (1) switch (_context31.prev = _context31.next) {
        case 0:
          projectId = req.params.projectId;
          order = req.params.order;
          _context31.prev = 2;
          _context31.next = 5;
          return Task.find({
            projectId: projectId
          }).sort({
            order: 1
          });
        case 5:
          tasks = _context31.sent;
          res.json(tasks);
          _context31.next = 12;
          break;
        case 9:
          _context31.prev = 9;
          _context31.t0 = _context31["catch"](2);
          res.status(500).json({
            error: 'An error occurred'
          });
        case 12:
        case "end":
          return _context31.stop();
      }
    }, _callee31, null, [[2, 9]]);
  }));
  return function (_x51, _x52) {
    return _ref32.apply(this, arguments);
  };
}());
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}
app.put('/projects/:projectId/columns', /*#__PURE__*/function () {
  var _ref33 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee32(req, res) {
    var projectId, name, project, newColumnId;
    return _regeneratorRuntime().wrap(function _callee32$(_context32) {
      while (1) switch (_context32.prev = _context32.next) {
        case 0:
          projectId = req.params.projectId;
          name = req.body.name;
          _context32.prev = 2;
          _context32.next = 5;
          return Project.findById(projectId);
        case 5:
          project = _context32.sent;
          if (project) {
            _context32.next = 8;
            break;
          }
          return _context32.abrupt("return", res.status(404).json({
            message: 'Project not found'
          }));
        case 8:
          newColumnId = generateUniqueId();
          project.columns.set(newColumnId, {
            name: name,
            color: '#4CAF50' // Default color for new columns
          });
          _context32.next = 12;
          return project.save();
        case 12:
          res.status(200).json({
            id: newColumnId,
            name: name,
            color: '#4CAF50'
          });
          _context32.next = 18;
          break;
        case 15:
          _context32.prev = 15;
          _context32.t0 = _context32["catch"](2);
          res.status(500).json({
            message: 'Error updating project columns',
            error: _context32.t0.message
          });
        case 18:
        case "end":
          return _context32.stop();
      }
    }, _callee32, null, [[2, 15]]);
  }));
  return function (_x53, _x54) {
    return _ref33.apply(this, arguments);
  };
}());
app["delete"]('/projects/:projectId/columns/:columnId', /*#__PURE__*/function () {
  var _ref34 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee33(req, res) {
    var _req$params2, projectId, columnId, project;
    return _regeneratorRuntime().wrap(function _callee33$(_context33) {
      while (1) switch (_context33.prev = _context33.next) {
        case 0:
          _req$params2 = req.params, projectId = _req$params2.projectId, columnId = _req$params2.columnId;
          _context33.prev = 1;
          _context33.next = 4;
          return Project.findById(projectId);
        case 4:
          project = _context33.sent;
          if (project) {
            _context33.next = 7;
            break;
          }
          return _context33.abrupt("return", res.status(404).json({
            message: 'Project not found'
          }));
        case 7:
          if (project.columns.has(columnId)) {
            _context33.next = 9;
            break;
          }
          return _context33.abrupt("return", res.status(404).json({
            message: 'Column not found'
          }));
        case 9:
          project.columns["delete"](columnId);
          _context33.next = 12;
          return project.save();
        case 12:
          _context33.next = 14;
          return Task.deleteMany({
            projectId: projectId,
            status: columnId
          });
        case 14:
          res.status(200).json({
            message: 'Column deleted successfully'
          });
          _context33.next = 20;
          break;
        case 17:
          _context33.prev = 17;
          _context33.t0 = _context33["catch"](1);
          res.status(500).json({
            message: 'Error deleting column',
            error: _context33.t0.message
          });
        case 20:
        case "end":
          return _context33.stop();
      }
    }, _callee33, null, [[1, 17]]);
  }));
  return function (_x55, _x56) {
    return _ref34.apply(this, arguments);
  };
}());
app.patch('/projects/:id', /*#__PURE__*/function () {
  var _ref35 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee34(req, res) {
    var id, project, updatedProject;
    return _regeneratorRuntime().wrap(function _callee34$(_context34) {
      while (1) switch (_context34.prev = _context34.next) {
        case 0:
          id = req.params.id;
          _context34.prev = 1;
          _context34.next = 4;
          return Project.findById(id);
        case 4:
          project = _context34.sent;
          if (project) {
            _context34.next = 7;
            break;
          }
          return _context34.abrupt("return", res.status(404).json({
            message: 'Project not found'
          }));
        case 7:
          _context34.next = 9;
          return Project.findByIdAndUpdate(id, req.body, {
            "new": true
          });
        case 9:
          updatedProject = _context34.sent;
          // Renvoyer le projet mis à jour
          res.json(updatedProject);
          _context34.next = 17;
          break;
        case 13:
          _context34.prev = 13;
          _context34.t0 = _context34["catch"](1);
          console.error('Error updating project:', _context34.t0);
          res.status(500).json({
            error: 'An error occurred'
          });
        case 17:
        case "end":
          return _context34.stop();
      }
    }, _callee34, null, [[1, 13]]);
  }));
  return function (_x57, _x58) {
    return _ref35.apply(this, arguments);
  };
}());
app.patch('/projects/:projectId/rating', /*#__PURE__*/function () {
  var _ref36 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee35(req, res) {
    var _projectId4, newRating, project;
    return _regeneratorRuntime().wrap(function _callee35$(_context35) {
      while (1) switch (_context35.prev = _context35.next) {
        case 0:
          _context35.prev = 0;
          _projectId4 = req.params.projectId;
          newRating = req.body.rating;
          _context35.next = 5;
          return Project.findById(_projectId4);
        case 5:
          project = _context35.sent;
          if (project) {
            _context35.next = 8;
            break;
          }
          return _context35.abrupt("return", res.status(404).json({
            message: 'Project not found'
          }));
        case 8:
          project.rating = newRating;
          _context35.next = 11;
          return project.save();
        case 11:
          res.status(200).json({
            message: 'Rating updated successfully',
            project: project
          });
          _context35.next = 17;
          break;
        case 14:
          _context35.prev = 14;
          _context35.t0 = _context35["catch"](0);
          res.status(500).json({
            error: _context35.t0.message
          });
        case 17:
        case "end":
          return _context35.stop();
      }
    }, _callee35, null, [[0, 14]]);
  }));
  return function (_x59, _x60) {
    return _ref36.apply(this, arguments);
  };
}());
app.get('/tasks', /*#__PURE__*/function () {
  var _ref37 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee36(req, res) {
    var tasks;
    return _regeneratorRuntime().wrap(function _callee36$(_context36) {
      while (1) switch (_context36.prev = _context36.next) {
        case 0:
          _context36.prev = 0;
          _context36.next = 3;
          return Task.find();
        case 3:
          tasks = _context36.sent;
          res.json(tasks);
          _context36.next = 10;
          break;
        case 7:
          _context36.prev = 7;
          _context36.t0 = _context36["catch"](0);
          res.status(500).json({
            error: 'An error occurred'
          });
        case 10:
        case "end":
          return _context36.stop();
      }
    }, _callee36, null, [[0, 7]]);
  }));
  return function (_x61, _x62) {
    return _ref37.apply(this, arguments);
  };
}());
app.get('/user/email/:email', /*#__PURE__*/function () {
  var _ref38 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee37(req, res) {
    var emailUser, user;
    return _regeneratorRuntime().wrap(function _callee37$(_context37) {
      while (1) switch (_context37.prev = _context37.next) {
        case 0:
          emailUser = req.params.email;
          _context37.prev = 1;
          _context37.next = 4;
          return User.findOne({
            email: emailUser
          });
        case 4:
          user = _context37.sent;
          res.json(user);
          _context37.next = 11;
          break;
        case 8:
          _context37.prev = 8;
          _context37.t0 = _context37["catch"](1);
          res.status(500).json({
            error: 'An error occurred'
          });
        case 11:
        case "end":
          return _context37.stop();
      }
    }, _callee37, null, [[1, 8]]);
  }));
  return function (_x63, _x64) {
    return _ref38.apply(this, arguments);
  };
}());
app.get('/user/:id', /*#__PURE__*/function () {
  var _ref39 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee38(req, res) {
    var userId, user;
    return _regeneratorRuntime().wrap(function _callee38$(_context38) {
      while (1) switch (_context38.prev = _context38.next) {
        case 0:
          _context38.prev = 0;
          userId = req.params.id;
          _context38.next = 4;
          return User.findById(userId);
        case 4:
          user = _context38.sent;
          if (user) {
            _context38.next = 7;
            break;
          }
          return _context38.abrupt("return", res.status(404).json({
            message: 'User not found'
          }));
        case 7:
          res.json(user);
          _context38.next = 13;
          break;
        case 10:
          _context38.prev = 10;
          _context38.t0 = _context38["catch"](0);
          res.status(500).json({
            error: 'An error occurred'
          });
        case 13:
        case "end":
          return _context38.stop();
      }
    }, _callee38, null, [[0, 10]]);
  }));
  return function (_x65, _x66) {
    return _ref39.apply(this, arguments);
  };
}());
app.get('/users', /*#__PURE__*/function () {
  var _ref40 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee39(req, res) {
    var users;
    return _regeneratorRuntime().wrap(function _callee39$(_context39) {
      while (1) switch (_context39.prev = _context39.next) {
        case 0:
          _context39.prev = 0;
          _context39.next = 3;
          return User.find();
        case 3:
          users = _context39.sent;
          res.json(users); // Retourne simplement une liste vide si aucune tâche n'est trouvée
          _context39.next = 10;
          break;
        case 7:
          _context39.prev = 7;
          _context39.t0 = _context39["catch"](0);
          res.status(500).json({
            error: 'An error occurred'
          });
        case 10:
        case "end":
          return _context39.stop();
      }
    }, _callee39, null, [[0, 7]]);
  }));
  return function (_x67, _x68) {
    return _ref40.apply(this, arguments);
  };
}());
app.get('/projectUsers', /*#__PURE__*/function () {
  var _ref41 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee40(req, res) {
    var users;
    return _regeneratorRuntime().wrap(function _callee40$(_context40) {
      while (1) switch (_context40.prev = _context40.next) {
        case 0:
          _context40.prev = 0;
          _context40.next = 3;
          return ProjectUsers.find();
        case 3:
          users = _context40.sent;
          res.json(users); // Retourne simplement une liste vide si aucune tâche n'est trouvée
          _context40.next = 10;
          break;
        case 7:
          _context40.prev = 7;
          _context40.t0 = _context40["catch"](0);
          res.status(500).json({
            error: 'An error occurred'
          });
        case 10:
        case "end":
          return _context40.stop();
      }
    }, _callee40, null, [[0, 7]]);
  }));
  return function (_x69, _x70) {
    return _ref41.apply(this, arguments);
  };
}());
app.put('/task/reorder', /*#__PURE__*/function () {
  var _ref42 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee41(req, res) {
    var updatedTasks, _iterator, _step, updatedTask, _id, order, status;
    return _regeneratorRuntime().wrap(function _callee41$(_context41) {
      while (1) switch (_context41.prev = _context41.next) {
        case 0:
          updatedTasks = req.body;
          _context41.prev = 1;
          _iterator = _createForOfIteratorHelper(updatedTasks);
          _context41.prev = 3;
          _iterator.s();
        case 5:
          if ((_step = _iterator.n()).done) {
            _context41.next = 12;
            break;
          }
          updatedTask = _step.value;
          _id = updatedTask._id, order = updatedTask.order, status = updatedTask.status;
          _context41.next = 10;
          return Task.findByIdAndUpdate(_id, {
            order: order,
            status: status
          });
        case 10:
          _context41.next = 5;
          break;
        case 12:
          _context41.next = 17;
          break;
        case 14:
          _context41.prev = 14;
          _context41.t0 = _context41["catch"](3);
          _iterator.e(_context41.t0);
        case 17:
          _context41.prev = 17;
          _iterator.f();
          return _context41.finish(17);
        case 20:
          res.json({
            message: 'Task order updated successfully'
          });
          _context41.next = 27;
          break;
        case 23:
          _context41.prev = 23;
          _context41.t1 = _context41["catch"](1);
          console.error('Error updating task order:', _context41.t1);
          res.status(500).json({
            error: 'An error occurred'
          });
        case 27:
        case "end":
          return _context41.stop();
      }
    }, _callee41, null, [[1, 23], [3, 14, 17, 20]]);
  }));
  return function (_x71, _x72) {
    return _ref42.apply(this, arguments);
  };
}());
app["delete"]('/tasks/:id', /*#__PURE__*/function () {
  var _ref43 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee42(req, res) {
    var id;
    return _regeneratorRuntime().wrap(function _callee42$(_context42) {
      while (1) switch (_context42.prev = _context42.next) {
        case 0:
          id = req.params.id;
          _context42.prev = 1;
          _context42.next = 4;
          return Task.findByIdAndDelete(id);
        case 4:
          // Envoyez une réponse pour indiquer que la tâche a été supprimée avec succès
          res.json({
            message: 'Task deleted successfully'
          });
          // Diffusez la suppression à tous les clients connectés si nécessaire
          io.emit('taskDeleted', {
            taskId: id
          });
          _context42.next = 12;
          break;
        case 8:
          _context42.prev = 8;
          _context42.t0 = _context42["catch"](1);
          console.error('Error deleting task:', _context42.t0);
          res.status(500).json({
            error: 'An error occurred'
          });
        case 12:
        case "end":
          return _context42.stop();
      }
    }, _callee42, null, [[1, 8]]);
  }));
  return function (_x73, _x74) {
    return _ref43.apply(this, arguments);
  };
}());
app.post('/tasks', /*#__PURE__*/function () {
  var _ref44 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee43(req, res) {
    var _req$body4, title, status, order, color, description, priority, begindate, enddate, projectId, users, gauge, workingDay, dependencies, tasksToUpdate, updatePromises, task;
    return _regeneratorRuntime().wrap(function _callee43$(_context43) {
      while (1) switch (_context43.prev = _context43.next) {
        case 0:
          _req$body4 = req.body, title = _req$body4.title, status = _req$body4.status, order = _req$body4.order, color = _req$body4.color, description = _req$body4.description, priority = _req$body4.priority, begindate = _req$body4.begindate, enddate = _req$body4.enddate, projectId = _req$body4.projectId, users = _req$body4.users, gauge = _req$body4.gauge, workingDay = _req$body4.workingDay, dependencies = _req$body4.dependencies;
          _context43.prev = 1;
          _context43.next = 4;
          return Task.find({
            projectId: projectId,
            status: status,
            description: description,
            priority: priority,
            begindate: begindate,
            enddate: enddate
          });
        case 4:
          tasksToUpdate = _context43.sent;
          updatePromises = tasksToUpdate.map(function (task) {
            return Task.findByIdAndUpdate(task._id, {
              order: task.order + 1
            });
          });
          _context43.next = 8;
          return Promise.all(updatePromises);
        case 8:
          task = new Task({
            title: title,
            status: status,
            order: 0,
            color: color,
            projectId: projectId,
            description: description,
            priority: priority,
            begindate: begindate,
            enddate: enddate,
            gauge: gauge,
            workingDay: workingDay,
            dependencies: dependencies,
            users: users // Add this line to include users array
          });
          _context43.next = 11;
          return task.save();
        case 11:
          io.emit('taskCreated', task);
          res.json(task);
          _context43.next = 18;
          break;
        case 15:
          _context43.prev = 15;
          _context43.t0 = _context43["catch"](1);
          res.status(500).json({
            error: 'An error occurred'
          });
        case 18:
        case "end":
          return _context43.stop();
      }
    }, _callee43, null, [[1, 15]]);
  }));
  return function (_x75, _x76) {
    return _ref44.apply(this, arguments);
  };
}());
app.put('/tasks/:id', /*#__PURE__*/function () {
  var _ref45 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee44(req, res) {
    var id, _req$body5, status, order, updatedTask;
    return _regeneratorRuntime().wrap(function _callee44$(_context44) {
      while (1) switch (_context44.prev = _context44.next) {
        case 0:
          id = req.params.id;
          _req$body5 = req.body, status = _req$body5.status, order = _req$body5.order;
          _context44.prev = 2;
          _context44.next = 5;
          return Task.findByIdAndUpdate(id, {
            status: status,
            order: order
          }, {
            "new": true
          });
        case 5:
          updatedTask = _context44.sent;
          // Diffuser la mise à jour à tous les clients connectés
          io.emit('taskUpdated', {
            taskId: id,
            status: status,
            order: order
          });
          res.json({
            message: 'Task updated successfully',
            task: updatedTask
          });
          _context44.next = 14;
          break;
        case 10:
          _context44.prev = 10;
          _context44.t0 = _context44["catch"](2);
          console.error('Error updating task:', _context44.t0);
          res.status(500).json({
            error: 'An error occurred'
          });
        case 14:
        case "end":
          return _context44.stop();
      }
    }, _callee44, null, [[2, 10]]);
  }));
  return function (_x77, _x78) {
    return _ref45.apply(this, arguments);
  };
}());
app.post('/projects', /*#__PURE__*/function () {
  var _ref46 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee45(req, res) {
    var _req$body6, title, description, enddate, tempImage, project;
    return _regeneratorRuntime().wrap(function _callee45$(_context45) {
      while (1) switch (_context45.prev = _context45.next) {
        case 0:
          _req$body6 = req.body, title = _req$body6.title, description = _req$body6.description, enddate = _req$body6.enddate, tempImage = _req$body6.tempImage;
          _context45.prev = 1;
          project = new Project({
            title: title,
            description: description,
            enddate: enddate,
            image: namefile,
            // This will contain the latest uploaded image path
            columns: new Map([['todo', {
              name: 'Todo',
              color: '#4CAF50'
            }], ['inProgress', {
              name: 'In Progress',
              color: '#4CAF50'
            }], ['done', {
              name: 'Done',
              color: '#4CAF50'
            }]])
          });
          _context45.next = 5;
          return project.save();
        case 5:
          io.emit('projectAdded', project);
          res.status(201).json(project);
          _context45.next = 13;
          break;
        case 9:
          _context45.prev = 9;
          _context45.t0 = _context45["catch"](1);
          console.error('Error adding project:', _context45.t0);
          res.status(500).json({
            error: 'An error occurred while adding the project.'
          });
        case 13:
        case "end":
          return _context45.stop();
      }
    }, _callee45, null, [[1, 9]]);
  }));
  return function (_x79, _x80) {
    return _ref46.apply(this, arguments);
  };
}());
app.get('/projects', /*#__PURE__*/function () {
  var _ref47 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee46(req, res) {
    var projects;
    return _regeneratorRuntime().wrap(function _callee46$(_context46) {
      while (1) switch (_context46.prev = _context46.next) {
        case 0:
          _context46.prev = 0;
          _context46.next = 3;
          return Project.find();
        case 3:
          projects = _context46.sent;
          res.json(projects);
          _context46.next = 10;
          break;
        case 7:
          _context46.prev = 7;
          _context46.t0 = _context46["catch"](0);
          res.status(500).json({
            error: 'An error occurred'
          });
        case 10:
        case "end":
          return _context46.stop();
      }
    }, _callee46, null, [[0, 7]]);
  }));
  return function (_x81, _x82) {
    return _ref47.apply(this, arguments);
  };
}());
app.get('/projects/:id', /*#__PURE__*/function () {
  var _ref48 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee47(req, res) {
    var projectNum, projects;
    return _regeneratorRuntime().wrap(function _callee47$(_context47) {
      while (1) switch (_context47.prev = _context47.next) {
        case 0:
          projectNum = req.params.id;
          _context47.prev = 1;
          _context47.next = 4;
          return Project.findById(projectNum);
        case 4:
          projects = _context47.sent;
          res.json(projects);
          _context47.next = 11;
          break;
        case 8:
          _context47.prev = 8;
          _context47.t0 = _context47["catch"](1);
          res.status(500).json({
            error: 'An error occurred'
          });
        case 11:
        case "end":
          return _context47.stop();
      }
    }, _callee47, null, [[1, 8]]);
  }));
  return function (_x83, _x84) {
    return _ref48.apply(this, arguments);
  };
}());
app.get('/tasks/:projectId', /*#__PURE__*/function () {
  var _ref49 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee48(req, res) {
    var projectId, tasks;
    return _regeneratorRuntime().wrap(function _callee48$(_context48) {
      while (1) switch (_context48.prev = _context48.next) {
        case 0:
          projectId = req.params.projectId;
          _context48.prev = 1;
          _context48.next = 4;
          return Task.find({
            projectId: projectId
          });
        case 4:
          tasks = _context48.sent;
          res.json(tasks);
          _context48.next = 11;
          break;
        case 8:
          _context48.prev = 8;
          _context48.t0 = _context48["catch"](1);
          res.status(500).json({
            error: 'An error occurred'
          });
        case 11:
        case "end":
          return _context48.stop();
      }
    }, _callee48, null, [[1, 8]]);
  }));
  return function (_x85, _x86) {
    return _ref49.apply(this, arguments);
  };
}());
app.get('/projects/:projectId/tasks', /*#__PURE__*/function () {
  var _ref50 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee49(req, res) {
    var projectId, tasks;
    return _regeneratorRuntime().wrap(function _callee49$(_context49) {
      while (1) switch (_context49.prev = _context49.next) {
        case 0:
          projectId = req.params.projectId;
          _context49.prev = 1;
          _context49.next = 4;
          return Task.find({
            projectId: projectId
          });
        case 4:
          tasks = _context49.sent;
          res.json(tasks); // Retourne simplement une liste vide si aucune tâche n'est trouvée
          _context49.next = 11;
          break;
        case 8:
          _context49.prev = 8;
          _context49.t0 = _context49["catch"](1);
          res.status(500).json({
            error: 'An error occurred'
          });
        case 11:
        case "end":
          return _context49.stop();
      }
    }, _callee49, null, [[1, 8]]);
  }));
  return function (_x87, _x88) {
    return _ref50.apply(this, arguments);
  };
}());

//jointure entre users et projectusers
app.get('/projectusers', /*#__PURE__*/function () {
  var _ref51 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee50(req, res) {
    var projectUsers;
    return _regeneratorRuntime().wrap(function _callee50$(_context50) {
      while (1) switch (_context50.prev = _context50.next) {
        case 0:
          _context50.prev = 0;
          _context50.next = 3;
          return ProjectUsers.find().populate({
            path: 'userId',
            select: 'avatar firstName lastName',
            model: 'User' // Assurez-vous d'utiliser le nom du modèle 'User' correct
          }).select('projectId userId');
        case 3:
          projectUsers = _context50.sent;
          res.json(projectUsers);
          _context50.next = 11;
          break;
        case 7:
          _context50.prev = 7;
          _context50.t0 = _context50["catch"](0);
          console.error('Error fetching data:', _context50.t0);
          res.status(500).json({
            error: 'Internal server error'
          });
        case 11:
        case "end":
          return _context50.stop();
      }
    }, _callee50, null, [[0, 7]]);
  }));
  return function (_x89, _x90) {
    return _ref51.apply(this, arguments);
  };
}());
app.get('/projects/:projectId/users', /*#__PURE__*/function () {
  var _ref52 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee51(req, res) {
    var projectId, projectUsers;
    return _regeneratorRuntime().wrap(function _callee51$(_context51) {
      while (1) switch (_context51.prev = _context51.next) {
        case 0:
          projectId = req.params.projectId;
          _context51.prev = 1;
          _context51.next = 4;
          return ProjectUsers.find({
            projectId: projectId
          });
        case 4:
          projectUsers = _context51.sent;
          res.json({
            users: projectUsers
          });
          _context51.next = 11;
          break;
        case 8:
          _context51.prev = 8;
          _context51.t0 = _context51["catch"](1);
          res.status(500).json({
            error: 'An error occurred'
          });
        case 11:
        case "end":
          return _context51.stop();
      }
    }, _callee51, null, [[1, 8]]);
  }));
  return function (_x91, _x92) {
    return _ref52.apply(this, arguments);
  };
}());
app.get('/projects/:projectId/users/:personId', /*#__PURE__*/function () {
  var _ref53 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee52(req, res) {
    var _req$params3, projectId, personId, isSelected;
    return _regeneratorRuntime().wrap(function _callee52$(_context52) {
      while (1) switch (_context52.prev = _context52.next) {
        case 0:
          _req$params3 = req.params, projectId = _req$params3.projectId, personId = _req$params3.personId;
          _context52.prev = 1;
          _context52.next = 4;
          return ProjectUsers.exists({
            projectId: projectId,
            userId: personId
          });
        case 4:
          isSelected = _context52.sent;
          res.json({
            userId: personId,
            projectId: projectId,
            isSelected: isSelected
          });
          _context52.next = 11;
          break;
        case 8:
          _context52.prev = 8;
          _context52.t0 = _context52["catch"](1);
          res.status(500).json({
            error: 'An error occurred'
          });
        case 11:
        case "end":
          return _context52.stop();
      }
    }, _callee52, null, [[1, 8]]);
  }));
  return function (_x93, _x94) {
    return _ref53.apply(this, arguments);
  };
}());
app.post('/projects/:projectId/users/:personId', /*#__PURE__*/function () {
  var _ref54 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee53(req, res) {
    var _req$params4, projectId, personId, projectUsers, newProjectUser;
    return _regeneratorRuntime().wrap(function _callee53$(_context53) {
      while (1) switch (_context53.prev = _context53.next) {
        case 0:
          _req$params4 = req.params, projectId = _req$params4.projectId, personId = _req$params4.personId;
          _context53.prev = 1;
          _context53.next = 4;
          return ProjectUsers.findOne({
            projectId: projectId,
            userId: personId
          });
        case 4:
          projectUsers = _context53.sent;
          if (projectUsers) {
            _context53.next = 12;
            break;
          }
          newProjectUser = new ProjectUsers({
            projectId: projectId,
            userId: personId
          });
          _context53.next = 9;
          return newProjectUser.save();
        case 9:
          res.json({
            success: true,
            message: 'User created successfully'
          });
          _context53.next = 13;
          break;
        case 12:
          res.json({
            success: false,
            message: 'User already exists for the project'
          });
        case 13:
          _context53.next = 18;
          break;
        case 15:
          _context53.prev = 15;
          _context53.t0 = _context53["catch"](1);
          res.status(500).json({
            error: 'An error occurred'
          });
        case 18:
        case "end":
          return _context53.stop();
      }
    }, _callee53, null, [[1, 15]]);
  }));
  return function (_x95, _x96) {
    return _ref54.apply(this, arguments);
  };
}());
app["delete"]('/projects/:projectId/users/:personId', /*#__PURE__*/function () {
  var _ref55 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee54(req, res) {
    var _req$params5, projectId, personId, deletedUser;
    return _regeneratorRuntime().wrap(function _callee54$(_context54) {
      while (1) switch (_context54.prev = _context54.next) {
        case 0:
          _req$params5 = req.params, projectId = _req$params5.projectId, personId = _req$params5.personId;
          _context54.prev = 1;
          _context54.next = 4;
          return ProjectUsers.findOneAndDelete({
            userId: personId,
            projectId: projectId
          });
        case 4:
          deletedUser = _context54.sent;
          if (deletedUser) {
            res.json({
              success: true,
              message: 'User deleted successfully'
            });
          } else {
            res.json({
              success: false,
              message: 'User not found'
            });
          }
          _context54.next = 11;
          break;
        case 8:
          _context54.prev = 8;
          _context54.t0 = _context54["catch"](1);
          res.status(500).json({
            error: 'An error occurred'
          });
        case 11:
        case "end":
          return _context54.stop();
      }
    }, _callee54, null, [[1, 8]]);
  }));
  return function (_x97, _x98) {
    return _ref55.apply(this, arguments);
  };
}());
app["delete"]('/projects/:id', /*#__PURE__*/function () {
  var _ref56 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee55(req, res) {
    var id, existingUsers, deleteResult, projectUploadPath;
    return _regeneratorRuntime().wrap(function _callee55$(_context55) {
      while (1) switch (_context55.prev = _context55.next) {
        case 0:
          id = req.params.id;
          _context55.prev = 1;
          _context55.next = 4;
          return ProjectUsers.find({
            projectId: id
          });
        case 4:
          existingUsers = _context55.sent;
          _context55.next = 7;
          return ProjectUsers.deleteMany({
            $or: [{
              projectId: id
            }, {
              projectId: validProjectId
            }]
          });
        case 7:
          deleteResult = _context55.sent;
          _context55.next = 10;
          return Task.deleteMany({
            projectId: id
          });
        case 10:
          _context55.next = 12;
          return Project.findByIdAndDelete(validProjectId);
        case 12:
          io.emit('projectDeleted', projectId);

          // Delete the project's upload directory
          projectUploadPath = path.join(__dirname, 'upload', 'projects', id);
          if (fs.existsSync(projectUploadPath)) {
            fs.rmSync(projectUploadPath, {
              recursive: true,
              force: true
            });
          }
          res.status(200).json({
            message: 'Project deleted successfully'
          });
          _context55.next = 22;
          break;
        case 18:
          _context55.prev = 18;
          _context55.t0 = _context55["catch"](1);
          console.error('Error in deletion process:', _context55.t0);
          res.status(500).json({
            error: 'An error occurred'
          });
        case 22:
        case "end":
          return _context55.stop();
      }
    }, _callee55, null, [[1, 18]]);
  }));
  return function (_x99, _x100) {
    return _ref56.apply(this, arguments);
  };
}());
app["delete"]('/users/:id', /*#__PURE__*/function () {
  var _ref57 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee56(req, res) {
    var id, user;
    return _regeneratorRuntime().wrap(function _callee56$(_context56) {
      while (1) switch (_context56.prev = _context56.next) {
        case 0:
          id = req.params.id;
          _context56.prev = 1;
          _context56.next = 4;
          return User.findById(id);
        case 4:
          user = _context56.sent;
          if (user) {
            _context56.next = 7;
            break;
          }
          return _context56.abrupt("return", res.status(404).json({
            message: 'User not found'
          }));
        case 7:
          _context56.next = 9;
          return User.findByIdAndDelete(id);
        case 9:
          // Envoyer une notification que l'utilisateur a été supprimé
          io.emit('userDeleted', {
            userId: id
          });

          // Renvoyer une réponse indiquant que la suppression a réussi
          res.json({
            message: 'User deleted successfully'
          });
          _context56.next = 17;
          break;
        case 13:
          _context56.prev = 13;
          _context56.t0 = _context56["catch"](1);
          console.error('Error deleting user:', _context56.t0);
          res.status(500).json({
            error: 'An error occurred'
          });
        case 17:
        case "end":
          return _context56.stop();
      }
    }, _callee56, null, [[1, 13]]);
  }));
  return function (_x101, _x102) {
    return _ref57.apply(this, arguments);
  };
}());
app.get('/user/:emailGroup/collaborators', /*#__PURE__*/function () {
  var _ref58 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee57(req, res) {
    var emailGroup, collaborators;
    return _regeneratorRuntime().wrap(function _callee57$(_context57) {
      while (1) switch (_context57.prev = _context57.next) {
        case 0:
          emailGroup = req.params.emailGroup;
          _context57.prev = 1;
          _context57.next = 4;
          return Collaborator.find({
            emailGroup: emailGroup
          });
        case 4:
          collaborators = _context57.sent;
          res.json(collaborators); // Retourne simplement une liste vide si aucune tâche n'est trouvée
          _context57.next = 11;
          break;
        case 8:
          _context57.prev = 8;
          _context57.t0 = _context57["catch"](1);
          res.status(500).json({
            error: 'An error occurred'
          });
        case 11:
        case "end":
          return _context57.stop();
      }
    }, _callee57, null, [[1, 8]]);
  }));
  return function (_x103, _x104) {
    return _ref58.apply(this, arguments);
  };
}());

// Configuration de stockage de Multer

var storage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    var uploadPath;
    if (file.fieldname === 'file') {
      // For project files
      uploadPath = path.join(__dirname, '..', 'frontend', 'public', 'uploads', 'projects', req.params.projectId);
    } else {
      if (file.fieldname === 'projectImage') {
        // For project images
        uploadPath = path.join(__dirname, '..', 'frontend', 'public', 'uploads', 'projects', req.params.projectId || 'temp');
      } else {
        // For avatar uploads
        uploadPath = path.join(__dirname, '..', 'frontend', 'public', 'uploads', 'avatars');
      }
    }
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, {
        recursive: true
      });
    }
    cb(null, uploadPath);
  },
  filename: function filename(req, file, cb) {
    namefile = "".concat(Date.now(), "-").concat(file.originalname);
    cb(null, namefile);
  }
});
var upload = multer({
  storage: storage
});
app.get('/download/:fileId', /*#__PURE__*/function () {
  var _ref59 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee58(req, res) {
    var file, filePath;
    return _regeneratorRuntime().wrap(function _callee58$(_context58) {
      while (1) switch (_context58.prev = _context58.next) {
        case 0:
          _context58.prev = 0;
          _context58.next = 3;
          return File.findById(req.params.fileId);
        case 3:
          file = _context58.sent;
          if (file) {
            _context58.next = 6;
            break;
          }
          return _context58.abrupt("return", res.status(404).json({
            error: 'File not found'
          }));
        case 6:
          filePath = path.join(__dirname, '..', 'frontend', 'public', file.path);
          if (fs.existsSync(filePath)) {
            _context58.next = 9;
            break;
          }
          return _context58.abrupt("return", res.status(404).json({
            error: 'File not found on disk'
          }));
        case 9:
          // Log download attempt
          res.download(filePath, file.name);
          _context58.next = 16;
          break;
        case 12:
          _context58.prev = 12;
          _context58.t0 = _context58["catch"](0);
          console.error('Download error:', _context58.t0);
          res.status(500).json({
            error: 'Error downloading file'
          });
        case 16:
        case "end":
          return _context58.stop();
      }
    }, _callee58, null, [[0, 12]]);
  }));
  return function (_x105, _x106) {
    return _ref59.apply(this, arguments);
  };
}());
app["delete"]('/files/:fileId', /*#__PURE__*/function () {
  var _ref60 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee59(req, res) {
    var file, filePath;
    return _regeneratorRuntime().wrap(function _callee59$(_context59) {
      while (1) switch (_context59.prev = _context59.next) {
        case 0:
          _context59.prev = 0;
          _context59.next = 3;
          return File.findById(req.params.fileId);
        case 3:
          file = _context59.sent;
          if (file) {
            _context59.next = 6;
            break;
          }
          return _context59.abrupt("return", res.status(404).json({
            error: 'File not found'
          }));
        case 6:
          // Delete physical file
          filePath = path.join(__dirname, '..', 'frontend', 'public', file.path);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }

          // Delete database record
          _context59.next = 10;
          return File.findByIdAndDelete(req.params.fileId);
        case 10:
          res.json({
            message: 'File deleted successfully'
          });
          _context59.next = 17;
          break;
        case 13:
          _context59.prev = 13;
          _context59.t0 = _context59["catch"](0);
          console.error('Delete error:', _context59.t0);
          res.status(500).json({
            error: 'Error deleting file'
          });
        case 17:
        case "end":
          return _context59.stop();
      }
    }, _callee59, null, [[0, 13]]);
  }));
  return function (_x107, _x108) {
    return _ref60.apply(this, arguments);
  };
}());
app.post('/upload/projects/:projectId', upload.single('projectImage'), function (req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded.'
      });
    }
    var filePath = "/uploads/projects/".concat(req.params.projectId, "/").concat(namefile);
    return res.status(200).json({
      message: 'File uploaded successfully.',
      path: filePath
    });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      error: 'Internal server error.'
    });
  }
});
app.post('/upload/projects', upload.single('projectImage'), function (req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded.'
      });
    }
    var filePath = "/uploads/projects/".concat(namefile);
    return res.status(200).json({
      message: 'File uploaded successfully.',
      path: filePath
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({
      error: 'Internal server error.'
    });
  }
});
app.post('/upload/avatar', upload.single('avatar'), function (req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded.'
      });
    }
    var filePath = "/uploads/avatars/".concat(namefile);
    return res.status(200).json({
      message: 'Avatar uploaded successfully.',
      path: filePath
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return res.status(500).json({
      error: 'Internal server error.'
    });
  }
});
app.post('/upload/:projectId', upload.single('file'), /*#__PURE__*/function () {
  var _ref61 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee60(req, res) {
    var file;
    return _regeneratorRuntime().wrap(function _callee60$(_context60) {
      while (1) switch (_context60.prev = _context60.next) {
        case 0:
          _context60.prev = 0;
          if (req.file) {
            _context60.next = 3;
            break;
          }
          return _context60.abrupt("return", res.status(404).json({
            error: 'No file uploaded.'
          }));
        case 3:
          file = new File({
            projectId: req.params.projectId,
            name: req.file.originalname,
            path: "/uploads/projects/".concat(req.params.projectId, "/").concat(req.file.filename),
            type: req.file.mimetype,
            size: req.file.size
          });
          _context60.next = 6;
          return file.save();
        case 6:
          return _context60.abrupt("return", res.status(200).json(file));
        case 9:
          _context60.prev = 9;
          _context60.t0 = _context60["catch"](0);
          console.error('Error uploading file:', _context60.t0);
          return _context60.abrupt("return", res.status(500).json({
            error: 'Internal server error.'
          }));
        case 13:
        case "end":
          return _context60.stop();
      }
    }, _callee60, null, [[0, 9]]);
  }));
  return function (_x109, _x110) {
    return _ref61.apply(this, arguments);
  };
}());

// Route pour récupérer les fichiers d'un projet
app.get('/files/:projectId', /*#__PURE__*/function () {
  var _ref62 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee61(req, res) {
    var files;
    return _regeneratorRuntime().wrap(function _callee61$(_context61) {
      while (1) switch (_context61.prev = _context61.next) {
        case 0:
          _context61.prev = 0;
          _context61.next = 3;
          return File.find({
            projectId: req.params.projectId
          });
        case 3:
          files = _context61.sent;
          res.json(files);
          _context61.next = 10;
          break;
        case 7:
          _context61.prev = 7;
          _context61.t0 = _context61["catch"](0);
          res.status(500).json({
            error: 'Error fetching files'
          });
        case 10:
        case "end":
          return _context61.stop();
      }
    }, _callee61, null, [[0, 7]]);
  }));
  return function (_x111, _x112) {
    return _ref62.apply(this, arguments);
  };
}());

// Gestionnaire d'erreur pour multer
app.use(function (err, req, res, next) {
  if (err instanceof multer.MulterError) {
    return res.status(400).send('Multer Error: ' + err.message);
  }
  if (err) {
    return res.status(500).send('Unknown Server Error');
  }
  next();
});

// Serveur
server.listen(3001, function () {
  console.log('Server is running on port 3001');
});

// Application created by Valery-Jerome Michaux
// Copyrights can be viewed on Github:
// https://github.com/Michaux-Technology/Geco-Kanban