
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

        sess = req.session;
        if (sess.user) {
            //We are loggged in and can return logged in user

            let obj = {
                "loggedIn": true,
                "user": sess.user[0]
            }


            res.json(obj);
        } else {
            let obj = {
                "loggedIn": false
            }

            res.json(obj);
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
        
        sess = req.session;
        if (sess.user) {
            //Only logged in admins can unblock a user
            if (sess.user[0].uRank == 2) {
                //Logged in as super admin
                if (check.uEmail.length <= 100 && check.uPassword.length <= 100 && check.uFirstName.length <= 30 && check.uLastName.length <= 30 && check.uRank) {
                    const hashpass = await genPass(req.body.uPassword);
                    const result = await dbService.addUser(req.body, hashpass);
                } else {
                    throw new Error("Fel validering")
                }

            } else {
                throw new Error("Du måste  vara superadmin")
            }

        } else {
            throw new Error("Du måste vara inloggad")
        }

        res.json({ status: "ok" });
    }
    catch (error) {
        console.log(error);
        res.json("Gick ej att lägga till användare")
    }

});
//DELETE A USER
routes.delete('/user', async (req, res) => {

    try {
        const check = req.body;

        sess = req.session;
        if (sess.user) {
            //Only logged in admins can unblock a user
            if (sess.user[0].uRank == 2) {
                //Logged in as super admin
                if (!isNaN(check.uId)) {
                    const resa = await dbService.deleteUser(check.uId);
                    res.json(resa);
                } else {
                    throw new Error("Fel validering")
                }

            } else {
                throw new Error("Du måste  vara superadmin")
            }

        } else {
            throw new Error("Du måste vara inloggad")
        }
    } catch (error) {
        console.log(error);
        res.json("Gick ej att ta bort användaren");
    }

});
//UPDATE A USER
routes.put('/user', async (req, res) => {
    const check = req.body;
    try {

        
        sess = req.session;
        if (sess.user) {
            //Only logged in admins can unblock a user
            if (sess.user[0].uRank == 2) {
                //Logged in as super admin
                if (check.uEmail.length <= 100 && check.uFirstName.length <= 30 && check.uLastName.length <= 30 && check.uRank && check.url.length > 0) {
                    const resa = await dbService.updateUser(check);
                    res.json(resa);
                } else {
                    throw new Error("Fel validering")
                }

            } else {
                throw new Error("Du måste  vara superadmin")
            }

        } else {
            throw new Error("Du måste vara inloggad")
        }

    } catch (error) {
        console.log(error)
        res.json("Gick ej att uppdatera användaren");
    }

});

//LOG IN USER
routes.post('/user/login', async (req, res) => {

    const data = req.body;

    try {
        if (data.uEmail.length > 4 && data.uPassword.length > 0) {
            const data = req.body;
            const user = await dbService.logIn(data);

            if (user) {

                let valid = await comparePass(data.uPassword, user["uPassword"]);
                if (valid) {

                    //Set session variables

                    sess = req.session;

                    let userr = await dbService.getUserByEmail(data.uEmail);
                    sess.user = userr;


                    //Blocked
                    if (userr[0].uBlocked == 1) {
                        req.session.destroy((err) => {
                            if (err) {
                                return console.log(err);
                            }
                            //res.redirect('/');

                        });
                        valid = false;

                    }

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
    try {
        //res.json(question)
        const prod = await dbService.getQuestions();

        for (const id in prod) {
            let question = prod[id]
            //Let's add user to all questions
            const user = await dbService.getUserById(question.uId);
            question["user"] = user[0];
            //Get all answers
            const answers = await dbService.getAnswerByQuestId(question.qsId);
            question["answers"] = answers;

        }
        //const user = await dbService.getUserById(req.params.id);


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
        //All can add question?

        sess = req.session;
        if (sess.user) {
            //Only logged in users can post

            if (check.qsTitle.length <= 100 && !isNaN(check.uId) && !isNaN(check.cId)) {
                const resa = await dbService.addQuestion(req.body);
                res.json(resa);
            } else {
                throw new Error("Fel validering")
            }

        } else {
            throw new Error("Du måste vara inloggad")
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
            const questions = await dbService.getQuestById(req.params.id);
            for (const id in questions) {
                let question = questions[id]
                //Let's add user to all questions
                const user = await dbService.getUserById(question.uId);
                question["user"] = user[0];
                //Get all answers
                const answers = await dbService.getAnswerByQuestId(question.qsId);
                question["answers"] = answers;
            }
            res.json(questions[0]);
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

        //Superadmins and the user who posted can delete question.

        sess = req.session;
        if (sess.user) {
            
            const question = await dbService.getQuestById(check.qsId);

            if (sess.user[0].uRank == 2 || question[0].uId == sess.user[0].uId) {
                //Logged in as super admin
                if (!isNaN(check.qsId)) {
                    const resa = await dbService.deleteQuestion(check.qsId);
                    res.json(resa);
                } else {
                    throw new Error("Fel validering")
                }

            } else {
                throw new Error("Du måste vara superadmin eller äga posten för att ta bort")
            }

        } else {
            throw new Error("Du måste vara inloggad för att unblockera users")
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

            for (const id in prod) {
                let question = prod[id]

                if (question.qsTitle.toLowerCase().includes(req.params.name.toLowerCase())) {


                    const user = await dbService.getUserById(question.uId);
                    question["user"] = user[0];
                    const answers = await dbService.getAnswerByQuestId(question.qsId);
                    question["answers"] = answers;

                    found_question.push(question);
                } else {
                    if (question.qsText.toLowerCase().includes(req.params.name.toLowerCase())) {
                        const user = await dbService.getUserById(question.uId);
                        question["user"] = user[0];
                        const answers = await dbService.getAnswerByQuestId(question.qsId);
                        question["answers"] = answers;
                        found_question.push(question);
                    }
                }
            }

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

    //Super admins and owner user can edit post
    try {

        sess = req.session;
        if (sess.user) {
            
            const question = await dbService.getQuestById(check.qsId);

            if (sess.user[0].uRank == 2 || question[0].uId == sess.user[0].uId) {
                if (check.qsTitle.length <= 100 && !isNaN(check.qsId) && !isNaN(check.cId)) {
                    const resa = await dbService.updateQuestion(check);
                    res.json(resa);
                } else {
                    throw new Error("Fel validering")
                }

            } else {
                throw new Error("Du måste vara superadmin eller äga posten för att ta bort")
            }

        } else {
            throw new Error("Du måste vara inloggad för att unblockera users")
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

    } catch (error) {
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

    } catch (error) {
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

    //You have to be logged in to post answer


    try {



        sess = req.session;
        if (sess.user) {
            //Only logged in admins can block a user
            if (check.aText.length > 0 && !isNaN(check.qsId) && !isNaN(check.uId)) {
                const resa = await dbService.addAnswer(req.body);
                res.json(resa);
            } else {
                throw new Error("Fel validering")
            }

        } else {
            throw new Error("Du måste vara inloggad för att lägga till users")
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


        //only super admins or owner of post can edit answer

        sess = req.session;
        if (sess.user) {
            
            const answer = await dbService.getAnswerById(check.aId);

            if (sess.user[0].uRank == 2 || answer[0].uId == sess.user[0].uId) {
                if (check.aText.length > 0 && !isNaN(check.aId)) {
                    const resa = await dbService.updateAnswer(check);
                    res.json(resa);
                } else {
                    throw new Error("Fel validering")
                }

            } else {
                throw new Error("Du måste vara superadmin eller äga posten för att ta bort")
            }

        } else {
            throw new Error("Du måste vara inloggad för att unblockera users")
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

        //only super admins or owner of post can delete answer

        sess = req.session;
        if (sess.user) {
            
            const answer = await dbService.getAnswerById(check.aId);

            if (sess.user[0].uRank == 2 || answer[0].uId == sess.user[0].uId) {
                if (!isNaN(check.aId)) {
                    const resa = await dbService.deleteAnswer(check.aId);
                    res.json(resa);
                } else {
                    throw new Error("Fel validering")
                }

            } else {
                throw new Error("Du måste vara superadmin eller äga posten för att ta bort")
            }

        } else {
            throw new Error("Du måste vara inloggad för att unblockera users")
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

//GET ANSWER BY ID
routes.get('/answers/:id', async (req, res) => {


    const check = req.params.id;


    try {
        if (!isNaN(check)) {
            const answer = await dbService.getAnswerById(req.params.id);
            res.json(answer);
        } else {
            res.send("Fel validering");

        }
    } catch (error) {
        console.log(error);
        res.json("Kunde inte hämta Svaret")
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
            throw new Error("Fel validering")
        }

    } catch (error) {
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
            throw new Error("Fel validering")
        }

    } catch (error) {
        console.log(error)
        res.json("Gick ej att downvote");
    }
});

routes.put('/updateurl', async (req, res) => {
    const data = req.body
    try {
        if (!isNaN(data.uId) && data.url) {
            const resa = await dbService.updateUrl(data.uId, data.url);
            res.json(resa);
        } else {
            throw new Error("Fel validering")
        }

    } catch (error) {
        console.log(error)
        res.json("Gick ej att downvote");
    }
});

//LABEL AS DUPLICATE
routes.put('/duplicate', async (req, res) => {
    const data = req.body
    try {
        if(sess.user){
            if (sess.user[0].uRank >= 1 && !isNaN(data.qsId)) {
                const resa = await dbService.labelDuplicate(data.qsId);
                res.json(resa);
            } else {
                throw new Error("Fel validering")
            }
        } else {
            throw new Error("Ej inloggad")
        }

    } catch (error) {
        console.log(error)
        res.json("Gick ej att uppdatera");
    }


});
//LABEL AS  NOT DUPLICATE
routes.put('/duplicate/not', async (req, res) => {
    const data = req.body
    try {
        if(sess.user){
            if (sess.user[0].uRank >= 1 && !isNaN(data.qsId)) {
                const resa = await dbService.labelNotDuplicate(data.qsId);
                res.json(resa);
            } else {
                throw new Error("Fel validering")
            }
        } else {
            throw new Error("Ej inloggad")
        }

    } catch (error) {
        console.log(error)
        res.json("Gick ej att uppdatera");
    }


});
//BLOCK A USER
routes.put('/user/block/:id', async (req, res) => {
    const data = req.params.id;



    try {

        //Make sure Session user is super admin
        sess = req.session;
        if (sess.user) {
            //Only logged in admins can block a user
            if (sess.user[0].uRank == 2) {
                //Logged in as super admin
                if (!isNaN(data)) {

                    const resa = await dbService.blockUser(data);
                    res.json(resa);
                } else {
                    throw new Error("Fel validering")
                }

            } else {
                throw new Error("Du måste  vara superadmin för att blockera users")
            }

        } else {
            throw new Error("Du måste vara inloggad för att lägga till users")
        }


    } catch (error) {
        console.log(error)
        res.json("Gick ej att blockera användaren");
    }
});
//UNBLOCK A USER
routes.put('/user/unblock/:id', async (req, res) => {
    const data = req.params.id;
    try {

        sess = req.session;
        if (sess.user) {
            //Only logged in admins can unblock a user
            if (sess.user[0].uRank == 2) {
                //Logged in as super admin
                if (!isNaN(data)) {
                    const resa = await dbService.unBlockUser(data);
                    res.json(resa);
                } else {
                    throw new Error("Fel validering")
                }

            } else {
                throw new Error("Du måste  vara superadmin för att unblockera users")
            }

        } else {
            throw new Error("Du måste vara inloggad för att unblockera users")
        }

    } catch (error) {
        console.log(error)
        res.json("Gick ej att unblockera användaren");
    }
});
//ADD CATEGORY
routes.post('/category', async (req, res) => {
    const data = req.body;
    const check = req.body;
    try {
        sess = req.session;
        if (sess.user) {
            //Only logged in admins can unblock a user
            if (sess.user[0].uRank == 2) {
                //Logged in as super admin
                if (check.cTitle.length > 0 && check.cDescription.length > 0) {
                    const resa = await dbService.addCategory(req.body);
                    res.json(resa);
                } else {
                    throw new Error("Fel validering")
                }

            } else {
                throw new Error("Du måste  vara superadmin")
            }

        } else {
            throw new Error("Du måste vara inloggad")
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


        sess = req.session;
        if (sess.user) {
            //Only logged in admins can unblock a user
            if (sess.user[0].uRank == 2) {
                //Logged in as super admin
                if (check.cTitle.length > 0 && check.cDescription.length > 0 && !isNaN(check.cId)) {
                    const resa = await dbService.updateCategory(check);
                    res.json(resa);
                } else {
                    throw new Error("Fel validering")
                }

            } else {
                throw new Error("Du måste  vara superadmin")
            }

        } else {
            throw new Error("Du måste vara inloggad")
        }
    } catch (error) {
        console.log(error)
        res.json("Gick ej att uppdatera kategorin");
    }

});
//DELETE CATEGORY
routes.delete('/category', async (req, res) => {
    //Unused
    try {
        const check = req.body;

        if (!isNaN(check.cId)) {
            const resa = await dbService.deleteCategory(check.cId);

            res.json(resa);
        } else {
            throw new Error("Fel Validering");
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
routes.get('/logout', (req, res) => {

    req.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
        res.redirect('/');
    });

});
//GET CATEGORY BY ID
routes.get('/category/:id', async (req, res) => {


    const check = req.params.id;


    try {
        if (!isNaN(check)) {
            const answer = await dbService.getCategoryById(req.params.id);
            res.json(answer);
        } else {
            res.send("Fel validering");

        }
    } catch (error) {
        console.log(error);
        res.json("Kunde inte hämta Kategorin")
    }
});




module.exports = routes;