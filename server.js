const express = require('express')
const app = express()

const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require ('jsonwebtoken')
const cookieParser = require('cookie-parser')
const multer = require('multer')
const uploadMiddleware = multer({dest: './src/uploads'})
const fs = require('fs')
//Model
const UserModel = require('./src/models/User')
const PostModel = require('./src/models/Post')

//PASSOS: 

//1 - Criptografar a senha
//2 - Comparar as senhas
//3 -

const salt = bcrypt.genSaltSync(10)
const secret = 'sd432654gtdsfw4343242adwtg34sda'

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
  res.setHeader('Access-Control-Allow-Methods', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token')
  res.setHeader('Access-Control-Max-Age', '10')
  res.setHeader('Access-Control-Allow-Credentials', 'true')

  next()
})

app.use(express.json())
app.use(cookieParser())

mongoose.connect('mongodb+srv://vittor:300321@blog.wbbvdgw.mongodb.net/?retryWrites=true&w=majority')
.then(() => console.log('Conectou ao db'))
.catch(() => console.log('não conseguiu conectar ao db'))

app.post('/register', async (req, res) => {
    const {username, password} = req.body
    
      try {
          const user = await UserModel.create({
            username, 
            password: bcrypt.hashSync(password, salt)
          })
          
        res.status(201).json(user)

      } catch (error) {
        return res.status(400).json({messageError: error})
      }
})

app.post('/login', async (req, res) => {
  const {username, password} = req.body
    try {
        const user = await UserModel.findOne({username})

        const passOk =  bcrypt.compareSync(password, user.password)

        if (passOk) {
          jwt.sign({username,id:user._id}, secret, {}, (err,token) => {
            if (err) throw err;
            res.cookie('token', token).json({
              id:user._id,
              username,
            });
          });
        } else {
          res.status(400).json('wrong credentials');
        }
    } catch (error) {
      return res.status(400).json({messageError: error})
    }
})

app.get('/profile', (req, res) => {
  const { token } = req.cookies

   if(token != '') {
    jwt.verify(token, secret, {}, (err, info) => {
      if (err) throw err;
      res.json(info)
    })
   } 
})

app.post('/logout', (req, res) => {
  res.cookie('token', '', { sameSite: 'none', secure: true}).json('Saiu!')

})

app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
  const {originalname, path} = req.file

  const parts =  originalname.split('.')
  const ext = parts[parts.length - 1]
  const newPath = path+'.'+ext
  console.log(newPath)
  fs.renameSync(path, newPath)

  const {title, summary, content} = req.body
  const post = await PostModel.create({
    title, summary, content, cover: newPath
 })

  res.json({post})
})

app.listen(3333, () =>  {
  console.log('Server is running 🚀')
})


//mongodb+srv://vittor:300321@blog.wbbvdgw.mongodb.net/?retryWrites=true&w=majority