const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const User = require('./models/User');
const Product = require('./models/Product');
const Message = require('./models/Message');
const bcrypt = require('bcryptjs');
const app = express(); 
const jwt = require('jsonwebtoken'); 
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/'});
const fs = require('fs');

const salt = bcrypt.genSaltSync(10);
const secret = 'jdakjdshfqkjf';


app.use(cors({credentials:true, origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

// mongoose.connect('mongodb://localhost:27017/blogDB')
// .then(() => {
//     console.log('DB Connected');
// }) .catch((err) => console.log('DB connection Error', err));


// Environment Variables
const PORT = 4000;
const DB_URL= "mongodb+srv://blog:mern-blog@cluster0.zuuhrac.mongodb.net/?retryWrites=true&w=majority" || "mongodb://mongo:27017/blogDB"


// Connect to MongoDB
mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('DB Connected');
})
.catch((err) => console.log('DB connection Error', err));

// Start the server
app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
});


app.post('/register', async (req,res) => {
    const {username, password, comformpassword} = req.body;
    try{
        if(password == comformpassword)
        {
            const userDoc = await User.create({username, password:bcrypt.hashSync(password,salt), comformpassword:bcrypt.hashSync(password,salt)});
            res.json(userDoc);
        }    
        else{
            alert('Passwords are not matching');
        }
    } catch(e){
        res.status(400).json(e);
    }
    
});

app.post('/login', async (req,res) => {
    const {username, password} = req.body;
    const userDoc = await User.findOne({username});
    const passok = userDoc && bcrypt.compareSync(password, userDoc.password);
    if(passok){
        jwt.sign({username, id: userDoc._id}, secret, {}, (err,token) => {
            if(err) throw err;
            res.cookie('token', token).json({
                id:userDoc._id,
                username,
            });
        });
    } else{
        res.status(400).json('wrong credentials');
    }
});

app.get('/profile',(req,res) =>{
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, (err,info) => {
        if(err) throw err;
        res.json(info);
    });
}); 

app.post('/logout', (req,res) => {
    res.cookie('token' , '').json('ok');
});

app.post('/product', uploadMiddleware.single('file') , async (req,res)=> {
    const {originalname,path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path+'.'+ext;
    fs.renameSync(path, newPath);
    
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async (err,info) => {
        if(err) throw err;
        const {product_name,price,product_description} = req.body;
        const productDoc = await Product.create({ 
            product_name,
            price,
            product_description,
            cover : newPath,
            author : info.id,
        });
        res.json(productDoc);
    });
});


// app.post('/message', async (req, res) => {
//     // const { token } = req.cookies;

//     // jwt.verify(token, secret, {}, async (err, info) => {
//     //     if (err) {
//     //         return res.status(401).json({ error: 'Unauthorized' });
//     //     }

//     //     const { name, email, subject, message } = req.body;

//     //     try {
//     //         const messageDoc = await Message.create({
//     //             name,
//     //             email,
//     //             subject,
//     //             message,
//     //             author: info.id,
//     //         });
//     //         res.json(messageDoc);
//     //     } catch (error) {
//     //         res.status(500).json({ error: 'Internal Server Error' });
//     //     }
//     // });

    
    
// });

app.post('/message', async(req,res) => {
    const {name, email, subject, message} = req.body;
    try{
        const messageDoc = await Message.create({name, email, subject, message});
        // res.status(200).json(message);
        res.json(messageDoc);
    } catch(e){
        res.status(400).json(e);
    }
});

app.put('/product', uploadMiddleware.single('file'), async (req,res) => {
    let newPath = null;
    if(req.file){
        const {originalname,path} = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        newPath = path+'.'+ext;
        fs.renameSync(path, newPath);
    }

    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async (err,info) => {
        if(err) throw err;
        const {id, product_name,price,product_description} = req.body;
        const postDoc = await Product.findById(id);
        const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
        if (!isAuthor) {
            return res.status(400).json('You are not the author');
        }
        await postDoc.updateOne({
            product_name, 
            price, 
            product_description,
            cover: newPath ? newPath : postDoc.cover,
        });
        res.json(postDoc)
    });
})

app.get('/product', async (req,res) => {
    res.json(await Product.find().populate('author' , ['username']).sort({createdAt : -1}).limit(20));
});

app.get('/product/:id' , async (req,res) => {
    const {id} = req.params;
    const postDoc = await Product.findById(id).populate('author', ['username']);
    res.json(postDoc);
});

    

app.delete('/product/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const deletedProduct = await Product.findByIdAndDelete(id);
      if (!deletedProduct) {
        return res.status(404).json('Product not found');
      }
      res.status(200).json('Product deleted successfully');
    } catch (error) {
      res.status(500).json('Error deleting product');
    }
    

  });



//mern-blog
//blog
//mongodb+srv://blog:mern-blog@cluster0.zuuhrac.mongodb.net/?retryWrites=true&w=majority 