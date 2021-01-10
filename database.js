const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

//OPEN CONNECTION TO DATABASE
const dbPromise = (async () => {
    try {
        return open({
            filename: './database.sqlite',
            driver: sqlite3.Database
        });
    } catch (error) {
        throw new Error('Kan inte öppna connection');
    }
})();

//GET ALL USERS
const getUsers = async () => {
    try {
        const dbCon = await dbPromise;
        const users = await dbCon.all('SELECT uId,uEmail,uFirstName,uLastName,uRank,url,uBlocked from user order by uFirstName ASC');
        return users;
    } catch (error) {
        throw new Error('Något gick fel i databasen');
    }
}

//GET A USER BY ID
const getUserById = async (data) => {
    try {
        const dbcon = await dbPromise;
        const user = await dbcon.all("SELECT uId,uEmail,uFirstName,uLastName,uRank,url,uBlocked FROM user WHERE uId=?", [data]);
        return user;
    } catch (error) {
        throw new Error('Något gick fel i databasen')
    }
}

//GET A USER BY ID
const getUserByEmail = async (data) => {
    try {
        const dbcon = await dbPromise;
        const user = await dbcon.all("SELECT uId,uEmail,uFirstName,uLastName,uRank,url,uBlocked FROM user WHERE uEmail=?", [data]);
        return user;
    } catch (error) {
        throw new Error('Något gick fel i databasen')
    }
}



//ADD USER
const addUser = async (data, hashpass) => {
    try {
        const dbcon = await dbPromise;

        if(data.url){
            await dbcon.run("INSERT INTO user (uEmail,uPassword,uFirstName,uLastName,uRank,url) VALUES(?,?,?,?,?,?)", [data.uEmail, hashpass, data.uFirstName, data.uLastName, data.uRank,data.url]);
        } else {
            await dbcon.run("INSERT INTO user (uEmail,uPassword,uFirstName,uLastName,uRank) VALUES(?,?,?,?,?)", [data.uEmail, hashpass, data.uFirstName, data.uLastName, data.uRank]);
        }

        return { status: "ok" };
    } catch (error) {
        throw new Error("Gick ej att lägga till en user");
    }
}
//DELETE A USER
const deleteUser = async (data) => {
    try {
        const dbcon = await dbPromise;
        await dbcon.run("DELETE FROM user WHERE uId=?", [data]);
        return { status: "Användaren blev borttagen" };
    } catch (error) {
        throw new error("Gick ej att ta bort användaren")
    }
}
//UPDATE A USER
const updateUser = async (data) => {
    try {
        const dbcon = await dbPromise;
        await dbcon.run("UPDATE user SET uEmail=?,uFirstName=?, uLastName=?,uRank=?,url=? WHERE uId = ?", [data.uEmail, data.uFirstName, data.uLastName, data.uRank,data.url,data.uId]);
        return { status: "Användaren blev uppdaterad" };
    } catch (error) {
        throw new Error("Gick inte att uppdatera användaren")
    }
}

//LOG IN, GET A USER BY EMAIL
const logIn = async (data) => {
    try {
        const dbcon = await dbPromise;
        const user = await dbcon.get("SELECT uPassword FROM user WHERE uEmail= ?", [data.uEmail]);
        return user;
    } catch (error) {
        throw error;

    }
}

//GET ALL QUESTIONS
const getQuestions = async () => {
    try {
        const dbcon = await dbPromise;
        const prod = await dbcon.all('Select qsId,qsTitle,qsText,uId,cId,qsDate,qUpVotes,qDownVotes,isDuplicate from questions order by qsId Desc')

        return prod;
    } catch (error) {
        throw new Error("Något gick fel i databasen")
    }
}

//GET A QUESTION BY ID
const getQuestById = async (data) => {
    try {
        const dbcon = await dbPromise;
        const prod = await dbcon.all("SELECT qsId,qsTitle,qsText,uId,cId,qsDate,qUpVotes,qDownVotes FROM questions WHERE qsId=?", [data]);
        return prod;
    } catch (error) {
        throw new Error("Fel i databasen")
    }
}

//ADD A QUESTION
const addQuestion = async (data) => {
    try {

        const dbcon = await dbPromise;
        await dbcon.run("INSERT INTO questions (qsTitle,qsText,uId,cId) VALUES(?,?,?,?)", [data.qsTitle, data.qsText, data.uId, data.cId]);
        return { status: "Frågan blev tillagd" };
    } catch (error) {
        throw new Error("Gick ej att lägga till Frågan");
    }
}

//DELETE A QUESTION
const deleteQuestion = async (data) => {
    try {
        
        const dbcon = await dbPromise;
        
        await dbcon.run("DELETE FROM questions WHERE qsId=?", [data]);
        
        return { status: "Frågan blev borttagen" };
    } catch (error) {
        throw new error("Gick ej att ta bort frågan")
    }
}

//UPDATE A QUESTION
const updateQuestion = async (data) => {
    try {
        const dbcon = await dbPromise;
        await dbcon.run("UPDATE questions SET qsTitle=?,qsText=?,cId=? WHERE qsId = ?", [data.qsTitle, data.qsText, data.cId, data.qsId]);
        return { status: "frågan blev uppdaterad" };
    } catch (error) {
        throw new Error("Gick inte att uppdatera frågan")
    }
}
//VOTE UP QUESTION
const voteUpQuestion = async (qsId) => {
    try {
        const dbcon = await dbPromise;
        await dbcon.run("UPDATE questions SET qUpVotes = qUpVotes + 1 WHERE qsId = ?", [qsId])
        return { status: "Frågan blev up votat :)" }

    } catch (error) {
        throw new Error("Fel i databasen")
    }
}
//VOTE DOWN QUESTION
const voteDownQuestion = async (qsId) => {
    try {
        const dbcon = await dbPromise;
        await dbcon.run("UPDATE questions SET qDownVotes = qDownVotes + 1 WHERE qsId = ?", [qsId])
        return { status: "Frågan blev up downvotat :)" }

    } catch (error) {
        throw new Error("Fel i databasen")
    }

}
//ADD ANSWER
const addAnswer = async (data) => {
    try {

        const dbcon = await dbPromise;
        await dbcon.run("INSERT INTO answer (qsId,uId,aText) VALUES(?,?,?)", [data.qsId, data.uId, data.aText]);
        return { status: "Svaret blev tillagd" };
    } catch (error) {
        throw new Error("Gick ej att lägga till svaret");
    }
}
//UPDATE ANSWER
const updateAnswer = async (data) => {
    try {
        const dbcon = await dbPromise;
        await dbcon.run("UPDATE answer SET aText = ? WHERE aId = ?", [data.aText,data.aId]);
        return { status: "Svaret blev uppdaterat" };
    } catch (error) {
        throw new Error("Gick inte att uppdatera svaret")
    }
}
//DELETE A ANSWER
const deleteAnswer = async (data) => {
    try {
        
        const dbcon = await dbPromise;
        await dbcon.run("DELETE FROM answer WHERE aId=?", [data]);
        return { status: "Svaret blev borttaget" };
    } catch (error) {
        throw new error("Gick ej att ta bort svaret")
    }
}
//GET ALL ANSWERS
const getAnswers = async () => {
    try {
        const dbcon = await dbPromise;
        let answers = await dbcon.all('Select aId,qsId,uId,aText,aDate,aUpVotes,aDownVotes from answer order by aDate Desc')

        for (const id in answers) {
            let answer = answers[id]

            let user = await getUserById(answer.uId);
            answers[id]["user"] = user[0]
        }

        return answers;
    } catch (error) {
        throw new Error("Något gick fel i databasen")
    }
}


//GET ANSWER BY QUESTION ID
const getAnswerById = async (data) => {
    try {
        const dbcon = await dbPromise;
        const answers = await dbcon.all("SELECT aId,uId,qsId,aText,aDate,aUpVotes,aDownVotes FROM answer WHERE aId=? order by aDate Desc", [data]);
        
        for (const id in answers) {
            let answer = answers[id]

            let user = await getUserById(answer.uId);
            answers[id]["user"] = user[0]
        }

        return answers;
    } catch (error) {
        throw new Error('Något gick fel i databasen')
    }
}

//GET ANSWER BY QUESTION ID
const getAnswerByQuestId = async (data) => {
    try {
        const dbcon = await dbPromise;
        const answers = await dbcon.all("SELECT aId,uId,qsId,aText,aDate,aUpVotes,aDownVotes FROM answer WHERE qsId=? order by aDate Desc", [data]);
        
        for (const id in answers) {
            let answer = answers[id]

            let user = await getUserById(answer.uId);
            answers[id]["user"] = user[0]
        }

        return answers;
    } catch (error) {
        throw new Error('Något gick fel i databasen')
    }
}



const updateUrl = async (uId, url) => {
    try {
        const dbcon = await dbPromise;
        await dbcon.run("UPDATE user SET url = ? WHERE uId = ?", [url, uId])
        return { status: "updateUrl" }

    } catch (error) {
        throw new Error("Fel i databasen")
    }

}


//VOTE UP
const voteUp = async (aId) => {
    try {
        const dbcon = await dbPromise;
        await dbcon.run("UPDATE answer SET aUpVotes = aUpVotes + 1 WHERE aId = ?", [aId])
        return { status: "Svaret blev up votat :)" }

    } catch (error) {
        throw new Error("Fel i databasen")
    }

}
//VOTE DOWN
const voteDown = async (aId) => {
    try {
        const dbcon = await dbPromise;
        await dbcon.run("UPDATE answer SET aDownVotes = aDownVotes + 1 WHERE aId = ?", [aId])
        return { status: "Svaret blev up downvotat :)" }

    } catch (error) {
        throw new Error("Fel i databasen")
    }

}

//LABEL AS DUPLICATE
const labelDuplicate = async (data) => {
    try {
        const dbcon = await dbPromise;
        await dbcon.run("UPDATE questions SET isDuplicate = 1 WHERE qsId = ?", [data]);
        return { status: "Frågan blev uppdaterad" };
    } catch (error) {
        throw new Error("Gick inte att uppdatera frågan")
    }
}
//LABEL AS DUPLICATE
const labelNotDuplicate = async (data) => {
    try {
        const dbcon = await dbPromise;
        await dbcon.run("UPDATE questions SET isDuplicate = 0 WHERE qsId = ?", [data]);
        return { status: "Frågan blev uppdaterad" };
    } catch (error) {
        throw new Error("Gick inte att uppdatera frågan")
    }
}
//BLOCK A USER
const blockUser = async (uId) => {
    try {
        const dbcon = await dbPromise;
        await dbcon.run("UPDATE user SET uBlocked = 1 WHERE uId = ?", [uId])
        return { status: "Användare blockerad" }

    } catch (error) {
        throw new Error("Fel i databasen")
    }

}
//UNBLOCK A USER
const unBlockUser = async (uId) => {
    try {
        const dbcon = await dbPromise;
        await dbcon.run("UPDATE user SET uBlocked = 0 WHERE uId = ?", [uId])
        return { status: "Användare ej blockerad" }

    } catch (error) {
        throw new Error("Fel i databasen")
    }

}
//ADD CATEGORY
const addCategory = async (data) => {
    try {

        const dbcon = await dbPromise;
        await dbcon.run("INSERT INTO category (cTitle,cDescription) VALUES(?,?)", [data.cTitle, data.cDescription]);
        return { status: "Category blev tillagd" };
    } catch (error) {
        throw new Error("Gick ej att lägga till category");
    }
}
//UPDATE CATEGORY
const updateCategory = async (data) => {
    try {
        const dbcon = await dbPromise;
        await dbcon.run("UPDATE category SET cTitle = ?,cDescription = ? WHERE cId = ?", [data.cTitle,data.cDescription,data.cId]);
        return { status: "Kategorin blev uppdaterat" };
    } catch (error) {
        throw new Error("Gick inte att uppdatera Kategorin")
    }
}
//DELETE CATEGORY
const deleteCategory = async (data) => {
    try {
        
        const dbcon = await dbPromise;
        await dbcon.run("DELETE FROM category WHERE cId=?", [data]);
        return { status: "Kategori blev borttaget" };
    } catch (error) {
        throw new error("Gick ej att ta bort Kategorin")
    }
}
//GET ALL CATEGORYS
const getCategorys = async () => {
    try {
        const dbcon = await dbPromise;
        const prod = await dbcon.all('Select cId,cTitle,cDescription from category order by cTitle Desc')

        return prod;
    } catch (error) {
        throw new Error("Något gick fel i databasen")
    }
}
//GET ANSWER BY QUESTION ID
const getCategoryById = async (data) => {
    try {
        const dbcon = await dbPromise;
        const category = await dbcon.all("SELECT cId,cTitle,cDescription FROM category WHERE cId=?", [data]);
        
        

        return category;
    } catch (error) {
        throw new Error('Något gick fel i databasen')
    }
}

module.exports = {
    getUsers: getUsers,//Klar 
    getQuestions: getQuestions,//Klar 
    getQuestById: getQuestById,//Klar 
    addQuestion: addQuestion,//Klar 
    deleteQuestion: deleteQuestion,//Klar 
    updateQuestion: updateQuestion,//Klar 
    voteDownQuestion : voteDownQuestion, //KLAR
    voteUpQuestion : voteUpQuestion, //KLAR
    getUserById: getUserById,//Klar
    getUserByEmail: getUserByEmail, //Klar
    addUser: addUser,//Klar 
    deleteUser : deleteUser,//KLar
    updateUser : updateUser,//KLar
    logIn: logIn, //------
    updateUrl: updateUrl, //klar
    addAnswer : addAnswer,//Klar 
    updateAnswer : updateAnswer,//Klar 
    deleteAnswer : deleteAnswer,//Klar
    getAnswers : getAnswers, //KLAR
    getAnswerByQuestId : getAnswerByQuestId,//KLAR
    getAnswerById : getAnswerById, //Klar
    voteUp: voteUp, // Klar
    voteDown : voteDown, //Klar 
    labelDuplicate: labelDuplicate,//-----
    blockUser: blockUser, //Klar
    unBlockUser : unBlockUser, //Klar
    addCategory : addCategory, // Klar
    updateCategory : updateCategory, //KLAR
    deleteCategory : deleteCategory, //KLAR
    getCategorys : getCategorys,
    getCategoryById : getCategoryById,
    labelNotDuplicate : labelNotDuplicate

};
