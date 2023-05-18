const mongoose = require("mongoose")
require('dotenv').config()
mongoose.connect(process.env.MONGODB_IDPASS).then(() => {
  console.log("db c");
})
const express = require('express')
const app = express()
var path = require('path');
const hbs = require('express-handlebars')
const session = require('express-session')
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser") 
const Handlebars = require('handlebars')
const helpers = require('./middleware/helpers')

Handlebars.registerHelper('eq', function (arg1, arg2) {
  return arg1 == arg2
});

// methods print on console
app.use((req, res, next) => {
  console.log(req.method + req.originalUrl);
  next();
});

//------------- to connect public folder
app.use(express.static(path.join(__dirname + '/public')));
app.use('/admin', express.static(path.join(__dirname + '/public')));

// bodyparser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({
  extname: "hbs",
  defaultLayout: "layout",
  layoutsDir: __dirname + "/views/layout/",
  partialsDir: __dirname + "/views/partials/",
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  },
  helpers: helpers

}))

const userRouter = require('./routes/userRouter')
app.use('/', userRouter)

const adminRouter = require('./routes/adminRouter')
app.use('/admin', adminRouter)

app.listen(3000, () => {
  console.log("server running");
})
