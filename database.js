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
        const users = await dbCon.all('SELECT Email,Firstname,Lastname,Password,Id from users order by Firstname ASC');
        return users;
    } catch (error) {
        throw new Error('Något gick fel i databasen');
    }
}

//GET A USER BY ID
const getUserById = async (data) => {
    try {
        const dbcon = await dbPromise;
        const user = await dbcon.all("SELECT Email,Firstname,Lastname,Password,Id FROM users WHERE id=?", [data]);
        return user;
    } catch (error) {
        throw new Error('Något gick fel i databasen')
    }
}

//ADD USER
const addUser = async (data, hashpass) => {
    try {
        const dbcon = await dbPromise;
        await dbcon.run("INSERT INTO users (Email,Firstname,Lastname,Password) VALUES(?,?,?,?)", [data.Email, data.Firstname, data.Lastname, hashpass]);
        return { status: "ok" };
    } catch (error) {
        throw new Error("Gick ej att lägga till en user");
    }
}

//LOG IN, GET A USER BY EMAIL
const logIn = async (data) => {
    try {
        const dbcon = await dbPromise;
        const user = await dbcon.get("SELECT Password FROM users WHERE Email= ?", [data.Email]);
        return user;
    } catch (error) {
        throw error;

    }
}

//GET ALL PRODUCTS
const getProd = async () => {
    try {
        const dbcon = await dbPromise;
        const prod = await dbcon.all('Select Name,Description,Price,Picture,Id from products order by name ASC')
        
        return prod;
    } catch (error) {
        throw new Error("Något gick fel i databasen")
    }
}

//GET A PRODUCT BY ID
const getProdById = async (data) => {
    try {
        const dbcon = await dbPromise;
        const prod = await dbcon.all("SELECT Name,Description,Price,picture,id FROM products WHERE id=?", [data]);
        return prod;
    } catch (error) {
        throw new Error("Fel i databasen")
    }
}

//ADD A PRODUCT
const addProd = async (data) => {
    try {
        const dbcon = await dbPromise;
        await dbcon.run("INSERT INTO products (Name,Description,Price,picture) VALUES(?,?,?,?)", [data.Name, data.Description, data.Price,data.picture]);
        return { status: "Produkten blev tillagd" };
    } catch (error) {
        throw new Error("Gick ej att lägga till produkt");
    }
}

//DELETE A PRODUCT
const deleteProd = async (data) => {
    try {
        const dbcon = await dbPromise;
        await dbcon.run("DELETE FROM products WHERE id=?", [data]);
        return { status: "Produkten blev borttagen" };
    } catch (error) {
        throw new error("Gick ej att ta bort en produkt")
    }
}

//UPDATE A PRODUCT
const updateProd = async (data) => {
    try {
        const dbcon = await dbPromise;
        await dbcon.run("UPDATE products SET Name=?,Description=?,Price=?,picture=? WHERE id = ?", [data.Name, data.Description, data.Price, data.picture, data.id]);
        return { status: "Produkten blev uppdaterad" };
    } catch (error) {
        throw new Error("Gick inte att uppdatera produkten")
    }
}
//ADD A PRODUCT TO SHOPPINGCART
const addShopCart = async (data) => {
    try {
        a=toString(data.Name);
        b=toString(data.Description);
        c=parseInt(data.Price);
        d=toString(data.picture);
        e=parseInt(data.id)
        quantity = 1
        const dbcon = await dbPromise;
       
        await dbcon.run("INSERT INTO shoppingcart (Name,Description,Price,picture,id,quantity) VALUES(?,?,?,?,?,?)", [data.Name, data.Description, c,data.picture,e,quantity]);
        return { status: "Produkten blev tillagd" };
    } catch (error) {
        
        throw new Error("Gick ej att lägga till produkt");
        
    }
}
//GET ALL PRODUCTS FROM SHOPPINGCART
const getShopCart = async () => {
    try {
        const dbcon = await dbPromise;
        const prod = await dbcon.all('Select Name,Description,Price,picture,id,quantity from shoppingcart order by name ASC')
        
        return prod;
    } catch (error) {
        throw new Error("Något gick fel i databasen")
    }
}
//DELETE A PRODUCT FROM SHOPPINGCART
const deleteShopCart = async (data) => {
    try {
        const dbcon = await dbPromise;
        await dbcon.run("DELETE FROM shoppingcart WHERE id=?", [data]);
        return { status: "Produkten blev borttagen" };
    } catch (error) {
        throw new error("Gick ej att ta bort en produkt")
    }
}
//GET A PRODUCT BY ID FROM SHOPPINGCART
const getCartById = async (data) => {
    try {
        const dbcon = await dbPromise;
        const prod = await dbcon.all("SELECT Name,Description,Price,picture,id,quantity FROM shoppingcart WHERE id=?", [data]);
        return prod;
    } catch (error) {
        throw new Error("Fel i databasen")
    }
}
//UPDATE A PRODUCT
const updateCartProd = async (quantity,id) => {
    //console.log(quantity);
    //sconsole.log(id);
    try {
        const dbcon = await dbPromise;
        await dbcon.run("UPDATE shoppingcart SET quantity=? WHERE id = ?", [quantity, id]);
        return { status: "Produkten blev uppdaterad" };
    } catch (error) {
        throw new Error("Gick inte att uppdatera produkten")
    }
}


module.exports = {
    getUsers: getUsers,
    getProd: getProd,
    getProdById: getProdById,
    addProd: addProd,
    deleteProd: deleteProd,
    updateProd: updateProd,
    getUserById: getUserById,
    addUser: addUser,
    logIn: logIn,
    addShopCart : addShopCart,
    getShopCart : getShopCart,
    deleteShopCart : deleteShopCart,
    getCartById : getCartById,
    updateCartProd : updateCartProd

};
