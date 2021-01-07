
const routes = require('express').Router();
const dbService = require('./database');
const bcrypt = require('bcrypt');
const multer = require('multer');
const files = multer({ dest: 'files/' });
const fs = require('fs').promises;
const saltrounds = 10;

let sess;



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

routes.get('/loggedinuser', async (req, res) => {
    try {

        sess=req.session;
        if(sess.user){
            //We are loggged in and can return logged in user

            
            res.json(sess.user[0]);
        } else {
            res.send("You are not logged in, we need to fuck you")
        }


    } catch (error) {
        console.log(error);
        res.json("Gick ej att hämta användare")
    }

});

//GET USER BY ID
routes.get("/user/:id", async (req, res) => {
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
routes.post('/user', async (req, res) => {
    const data = req.body;
    try {
        const check = req.body;
        if (check.uEmail.length <= 100 && check.uPassword.length <= 100 && check.uFirstName.length <= 30 && check.uLastName.length <= 30 && check.uRank) {
            const hashpass = await genPass(req.body.uPassword);
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
        if (data.uEmail.length > 4 && data.uPassword.length > 0) {
            const data = req.body;
            const user = await dbService.logIn(data);
            
            
            if (user) {
                
                const valid = await comparePass(toString(data.uPassword), toString(user));
                
                if (!valid) {

                    //Set session variables
                    sess=req.session;

                    const userr = await dbService.getUserByEmail(data.uEmail);       
                    sess.user=userr;








                    res.json(valid);
                    
                } else {
                    res.send("Gick ej att logga in");
                }
            } else {
                res.send(true);
            }
        } else {
            res.send("Fel input");
        }
    } catch (error) {
        console.log(error);
        res.json("Gick ej att logga in")
    }
});

//GET ALL QUuserS
routes.get('/question', async (req, res) => {
    sess = req.session;
    if(sess.user) {
        console.log(sess.user)
    }
    
    try {
        //res.json(question)
        const prod = await dbService.getQuestions();
        res.json(prod);
    } catch (error) {
        console.log(error);
        res.json("Kunde ej hämta alla Frågor");
    }
});



//ADD A QUESTION
routes.post('/question', async (req, res) => {
    const data = req.body;
    const check = req.body;

    try {
       

        if (check.qsTitle.length <= 100 && !isNaN(check.uId) && !isNaN(check.cId)) {
            const resa = await dbService.addQuestion(req.body);
            res.json(resa);
        } else {
            console.log("Wrong input");
        }
    }
    catch (error) {
        console.log(error);
        res.json("Kunde inte lägga till frågan")
    }

});

//GET A QUESTION BY ID
routes.get('/question/:id', async (req, res) => {

    const testquestion = {
        qId: 1,
        uId: 1,
        qTitle: "TestTitle",
        qText: "En lång text som ingen kommer läsa",
    }
    const check = req.params.id;
    try {
        if (!isNaN(check)) {
            const question = await dbService.getQuestById(req.params.id);
            res.json(question);
        } else {
            res.send("Fel validering");

        }
    } catch (error) {
        console.log(error);
        res.json("Kunde inte hämta Frågan")
    }
});



//DELETE A QUESTION
routes.delete('/question', async (req, res) => {

    try {
        const check = req.body;

        if (!isNaN(check.qsId)) {
            const resa = await dbService.deleteQuestion(check.qsId);

            res.json(resa);
        } else {
            throw new error("Fel Validering");
        }
    } catch (error) {
        console.log(error);
        res.json("Gick ej att ta bort frågan");
    }

});

//Search question
routes.get('/search/:name', async (req, res) => {
    const err = { error_string: "No question was found with that name.", error_code: 0 };

    try {
        let found_question = [];
        if (req.params.name) {

            let prod = await dbService.getQuestions();
            prod.forEach(question => {
                if (question.qsTitle.toLowerCase().includes(req.params.name.toLowerCase())){
                    found_question.push(question);
                } else {
                    if (question.qsText.toLowerCase().includes(req.params.name.toLowerCase())){
                        found_question.push(question);
                    }
                }
            });

            if (found_question.length === 0) {
                res.json(err);
            } else {
                res.json(found_question);
            }
        }
    } catch (error) {
        console.log(error);
        res.json("Något gick fel");
    }




});




//UPDATE A QUESTION
routes.put('/question', async (req, res) => {
    const check = req.body;
    console.log(check)
    try {
        if (check.qsTitle.length <= 100 && !isNaN(check.qsId) && !isNaN(check.cId)) {
            const resa = await dbService.updateQuestion(check);
            res.json(resa);
        } else {
            throw new error("Fel Validering");
        }
    } catch (error) {
        console.log(error)
        res.json("Gick ej att uppdatera frågan");
    }

});
//VOTE UP QUESTION
routes.put('/question/upvote', async (req, res) => {
    const data = req.body.qsId;
    try {
        if (!isNaN(data)) {
            const resa = await dbService.voteUpQuestion(data);
            res.json(resa);
        } else {
            throw new error("Fel validering")
        }

    } catch {
        console.log(error)
        res.json("Gick ej att voteup");
    }
});
//VOTE DOWN QUESTION
routes.put('/question/downvote', async (req, res) => {
    const data = req.body.qsId;
    try {
        if (!isNaN(data)) {
            const resa = await dbService.voteDownQuestion(data);
            res.json(resa);
        } else {
            throw new error("Fel validering")
        }

    } catch {
        console.log(error)
        res.json("Gick ej att downvote");
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

//ADD ANSWER
routes.post('/answer', async (req, res) => {
    const data = req.body;
    const check = req.body;

    try {
        if (check.aText.length > 0 && !isNaN(check.qsId) && !isNaN(check.uId)) {
            const resa = await dbService.addAnswer(req.body);
            res.json(resa);
        } else {
            console.log("Wrong input");
        }
    }
    catch (error) {
        console.log(error);
        res.json("Kunde inte lägga till svaret")
    }

});
//UPDATE ANSWER
routes.put('/answer', async (req, res) => {
    const check = req.body;
    try {
        if (check.aText.length > 0 && !isNaN(check.aId)) {
            const resa = await dbService.updateAnswer(check);
            res.json(resa);
        } else {
            throw new error("Fel Validering");
        }
    } catch (error) {
        console.log(error)
        res.json("Gick ej att uppdatera svaret");
    }

});
//DELETE ANSWER
routes.delete('/answer', async (req, res) => {

    try {
        const check = req.body;

        if (!isNaN(check.aId)) {
            const resa = await dbService.deleteAnswer(check.aId);

            res.json(resa);
        } else {
            throw new error("Fel Validering");
        }
    } catch (error) {
        console.log(error);
        res.json("Gick ej att ta bort svaret");
    }

});
//GET ALL ANSWERS
routes.get('/answer', async (req, res) => {
   
    try {
        
        const answer = await dbService.getAnswers();
        res.json(answer);
    } catch (error) {
        console.log(error);
        res.json("Kunde ej hämta alla svar");
    }
});
//GET ANSWER BY QUESTION ID
routes.get('/answer/:id', async (req, res) => {

   
    const check = req.params.id;


    try {
        if (!isNaN(check)) {
            const answer = await dbService.getAnswerByQuestId(req.params.id);
            res.json(answer);
        } else {
            res.send("Fel validering");

        }
    } catch (error) {
        console.log(error);
        res.json("Kunde inte hämta Svaret")
    }
});






//VOTE UP ANSWER
routes.put('/answer/upvote', async (req, res) => {
    const data = req.body.aId;
    try {
        if (!isNaN(data)) {
            const resa = await dbService.voteUp(data);
            res.json(resa);
        } else {
            throw new error("Fel validering")
        }

    } catch {
        console.log(error)
        res.json("Gick ej att voteup");
    }
});
//VOTE DOWN ANSWER
routes.put('/answer/downvote', async (req, res) => {
    const data = req.body.aId;
    try {
        if (!isNaN(data)) {
            const resa = await dbService.voteDown(data);
            res.json(resa);
        } else {
            throw new error("Fel validering")
        }

    } catch {
        console.log(error)
        res.json("Gick ej att downvote");
    }
});

//LABEL AS DUPLICATE
routes.put('/home/blablal', async (req, res) => {

});
//BLOCK A USER
routes.put('/user/block', async (req, res) => {
    const data = req.body.uId;
    try {
        if (!isNaN(data)) {
            const resa = await dbService.blockUser(data);
            res.json(resa);
        } else {
            throw new error("Fel validering")
        }

    } catch {
        console.log(error)
        res.json("Gick ej att blockera användaren");
    }
});
//UNBLOCK A USER
routes.put('/user/unblock', async (req, res) => {
    const data = req.body.uId;
    try {
        if (!isNaN(data)) {
            const resa = await dbService.unBlockUser(data);
            res.json(resa);
        } else {
            throw new error("Fel validering")
        }

    } catch {
        console.log(error)
        res.json("Gick ej att unblockera användaren");
    }
});
//ADD CATEGORY
routes.post('/category', async (req, res) => {
    const data = req.body;
    const check = req.body;

    try {
        if (check.cTitle.length > 0 && check.cDescription.length > 0) {
            const resa = await dbService.addCategory(req.body);
            res.json(resa);
        } else {
            console.log("Wrong input");
        }
    }
    catch (error) {
        console.log(error);
        res.json("Kunde inte lägga till category")
    }

});
//UPDATE CATEGORY
routes.put('/category', async (req, res) => {
    const check = req.body;
    try {
        if (check.cTitle.length > 0 && check.cDescription.length > 0 && !isNaN(check.cId)) {
            const resa = await dbService.updateCategory(check);
            res.json(resa);
        } else {
            throw new error("Fel Validering");
        }
    } catch (error) {
        console.log(error)
        res.json("Gick ej att uppdatera kategorin");
    }

});
//DELETE CATEGORY
routes.delete('/category', async (req, res) => {

    try {
        const check = req.body;

        if (!isNaN(check.cId)) {
            const resa = await dbService.deleteCategory(check.cId);

            res.json(resa);
        } else {
            throw new error("Fel Validering");
        }
    } catch (error) {
        console.log(error);
        res.json("Gick ej att ta bort kategorin");
    }

});
//GET ALL CATEGORYS
routes.get('/category', async (req, res) => {
   
    try {
        
        const prod = await dbService.getCategorys();
        res.json(prod);
    } catch (error) {
        console.log(error);
        res.json("Kunde ej hämta alla kategorier");
    }
});




module.exports = routes;