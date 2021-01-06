
const routes = require('express').Router();
const dbService = require('./database');
const bcrypt = require('bcrypt');
const multer = require('multer');
const files = multer({ dest: 'files/' });
const fs = require('fs').promises;
const saltrounds = 10;

//GENERATE HASHED PASSWORD
const genPass = async (pwd) => {
    const salt = await bcrypt.genSalt(saltrounds);
    const hash = await bcrypt.hash(pwd, salt);

    return hash;
};

//COMPARE PASSWORD WITH HASHED PASSWORD
const comparePass = async (pwd, hash) => {
    const match = await bcrypt.compare(pwd, hash);

    return match;
};

//GET ALL USERS
routes.get('/users', async (req, res) => {
    try {
        const users = await dbService.getUsers();
        res.json(users);
    } catch (error) {
        console.log(error);
        res.json("Gick ej att hämta användare")
    }

});

//GET USER BY ID
routes.get("/users/:id", async (req, res) => {
    try {
        const check = parseInt(req.params.id, 10);

        if (!isNaN(check)) {
            const user = await dbService.getUserById(req.params.id);
            res.json(user);
        } else {
            res.send("Fel validering");

        }
    } catch (error) {
        console.log(error);
        res.json("Gick ej att hämta användare");
    }
});

//ADD A USER
routes.post('/users', async (req, res) => {
    const data = req.body;
    try {
        const check = req.body;
        if (check.Email.length <= 50 && check.Firstname.length <= 20 && check.Lastname.length <= 20 && check.Password) {
            const hashpass = await genPass(req.body.Password);
            const res = await dbService.addUser(req.body, hashpass);
        } else {
            console.log("Fel input");
        }
    }
    catch (error) {
        console.log(error);
        res.json("Gick ej att lägga till användare")
    }
    res.json({ status: "ok" });
});

//LOG IN USER
routes.post('/user/login', async (req, res) => {

    const data = req.body;

    try {
        if (data.Email.length > 4 && data.Password.length > 0) {
            const data = req.body;
            const user = await dbService.logIn(data);

            if (user) {
                const valid = await comparePass(data.Password, user.Password);
                if (valid) {
                    res.json(data.Email);
                } else {
                    res.send("Gick ej att logga in");
                }
            } else {
                res.send("Gick ej att logga in");
            }
        } else {
            res.send("Fel input");
        }
    } catch (error) {
        console.log(error);
        res.json("Gick ej att logga in")
    }
});

//GET ALL QUESTIONS
routes.get('/index', async (req, res) => {
    const question = {
        id : 1,
        title : "Teest",
        text : "JAHWDAJWDJAWDJAWD",
        date : "2020-01-06",
        userId : "1",
        category : 1,
        isDuplicate : "0",
        duplicateId : "0",
        
    }
    try {
        res.json(question)
        //const prod = await dbService.getProd();
        //res.json(prod);
    } catch (error) {
        console.log(error);
        res.json("Kunde ej hämta alla Frågor");
    }
});

//ADD A PRODUCT
routes.post('/products', async (req, res) => {
    const data = req.body;
    const check = req.body;
    try {

        console.log(req.body.Name);
        // console.log(check.Description);
        // console.log(check.picture);
        //console.log(check.Price);
        if (check.Name.length <= 50 && check.Description.length <= 200 && !isNaN(check.Price)) {
            const resa = await dbService.addProd(req.body);
            res.json(resa);
        } else {
            console.log("Wrong input");
        }
    }
    catch (error) {
        console.log(error);
        res.json("Kunde inte lägga till produkt")
    }

});

//GET A PRODUCT BY ID
routes.get('/products/:id', async (req, res) => {

    const testquestion = {
        qId: 1,
        uId: 1,
        qTitle: "TestTitle",
        qText: "En lång text som ingen kommer läsa",
    }



    try {
        res.json(testquestion)
    } catch (error) {
        console.log(error);
        res.json("Kunde inte hämta produkt")
    }
});

//DELETE A PRODUCT
routes.delete('/products', async (req, res) => {
    console.log(req.body.id)
    try {
        const check = parseInt(req.body.id, 10);

        if (!isNaN(check)) {
            const resa = await dbService.deleteProd(req.body.id);
            res.json(resa);
        } else {
            throw new error("Fel Validering");
        }
    } catch (error) {
        console.log(error);
        res.json("Gick ej att ta bort produkten");
    }

});



//UPDATE A PRODUCT
routes.put('/products/update', async (req, res) => {
    const data = req.body;
    console.log(req.body);
    try {
        if (data.Name.length <= 50 && data.Description.length <= 200 && !isNaN(data.Price) && !isNaN(data.id)) {
            const resa = await dbService.updateProd(data);
            res.json(resa);
        } else {
            throw new error("Fel Validering");
        }
    } catch (error) {
        console.log(error)
        res.json("Gick ej att uppdatera produkten");
    }

});


//ADD A FILE
routes.post('/file', files.single('file'), async (req, res) => {
    const newFile = req.file;
    const Id = req.body;
    const ext = req.file.originalname.split('.');
    const fileEnd = ext[ext.length - 1];
    const fileName = './files/' + Date.now() + '.' + fileEnd;
    try {
        const filewrite = await fs.rename(newFile.path, fileName);
        if (!filewrite) {
            let prod = await dbService.getProdById(Id.Id);
            if (prod.length > 0) {
                prod[0].picture = fileName;
                let prod2 = await dbService.updateProd(prod[0]);
                res.json(prod2);
            } else {
                throw new error("Kunde inte hitta en produkt");
            }
        }
        else {
            await fs.unlink(newFile.path);
            throw new error("Gick inte att skriva över filen");
        }
    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }

});
//ADD A PRODUCT TO SHOPPINGCART
routes.post('/products/cart', async (req, res) => {
    const data = req.body;
    const check = req.body;
    
    try {
        
            const prod = await dbService.getCartById(req.body.id);
          
            if (prod[0]){
                const prod1 = await dbService.updateCartProd((prod[0].quantity+1),prod[0].id);
            }else{
                const resa = await dbService.addShopCart(req.body);
                res.json(resa);
            }
            
       
    }
    catch (error) {
        console.log(error);
        res.json("Kunde inte lägga till produkt")
    }

});
//GET ALL PRODUCTS FROM SHOPPINGCART
routes.get('/allcart', async (req, res) => {
    try {
        const prod = await dbService.getShopCart();
        
        res.json(prod);
    } catch (error) {
        console.log(error);
        res.json("Kunde ej hämta alla produkter");
    }
});
//DELETE A PRODUCT FROM SHOPPINGCART
routes.delete('/allcart/delete/:id', async (req, res) => {
    
    try {
        const check = parseInt(req.params.id, 10);
        
        if (!isNaN(check)) {
            const resa = await dbService.deleteShopCart(req.params.id);
            res.json(resa);
        } else {
            throw new error("Fel Validering");
        }
    } catch (error) {
        console.log(error);
        res.json("Gick ej att ta bort produkten");
    }

});
//GET A PRODUCT BY ID FROM SHOPPINGCART
routes.get('/allcart/:id', async (req, res) => {
    try {
        const check = parseInt(req.params.id, 10);

        if (!isNaN(check)) {
            const prod = await dbService.getCartById(req.params.id);
            res.json(prod);
        } else {
            res.send("Fel validering");

        }
    } catch (error) {
        console.log(error);
        res.json("Kunde inte hämta produkt")
    }
});
//UPDATE A PRODUCT FROM SHOPPINGCART
routes.put('/allcart/update', async (req, res) => {
    const data = req.body;
   
    try {
        if (!isNaN(data.quantity) && !isNaN(data.id)) {
            const resa = await dbService.updateCartProd(data.quantity,data.id);
            res.json(resa);
        } else {
            throw new error("Fel Validering");
        }
    } catch (error) {
        console.log(error)
        res.json("Gick ej att uppdatera produkten");
    }

});
//VOTE UP OR VOTE DOWN
routes.put('/home/blablal',async (req,res)=>{

});

//LABEL AS DUPLICATE
routes.put('/home/blablal',async (req,res)=>{

});
//BLOCK A USER
routes.put('/home/blablal',async (req,res)=>{

});





module.exports = routes;