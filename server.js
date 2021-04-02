const express = require('express');
const cors = require('cors');
const app = express();
let bodyParser = require('body-parser')
var fs = require('fs');
const { Pool, Client } = require('pg');
const { env } = require('process');
let data = fs.readFileSync('env.json')
let envVar = JSON.parse(data);

//settting express
app.set('view engine', 'ejs'); //ON UTILISE EJS POUR RENDRE NOS PAGES
app.use(cors());
app.use(express.json())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

const defaultDataGraph = '{"elements":{},"style":[{"selector":"node","style":{"background-color":"rgb(165,164,164)","label":"data(value)"}},{"selector":"edge","style":{"width":"3px","line-color":"rgb(165,164,164)","curve-style":"bezier","label":"data(value)","line-opacity":"0.5","control-point-step-size":"150px"}},{"selector":":selected","style":{"line-color":"rgb(113,130,173)","background-color":"rgb(113,130,173)"}}],"data":{},"zoomingEnabled":true,"userZoomingEnabled":true,"zoom":1,"minZoom":1e-50,"maxZoom":1e+50,"panningEnabled":true,"userPanningEnabled":true,"pan":{"x":0,"y":0},"boxSelectionEnabled":true,"renderer":{"name":"canvas"}}'
const defaultDataList = "";
const defaultDataTree = '[{"name":"Nicolas (1654-1705)","ancestor":"null","children":[{"name":"Jacques (1654-1705)","ancestor":"Nicolas (1654-1705)"},{"name":"Nicolas (1662-1716)","ancestor":"Nicolas (1654-1705)","children":[{"name":"Nicolas I (1687-1726)","ancestor":"Nicolas (1662-1716)"}]},{"name":"Jean I (1667-1748)","ancestor":"Nicolas (1654-1705)","children":[{"name":"Nicolas II (1695-1726)","ancestor":"Jean I (1667-1748)"},{"name":"Daniel I (1700-1782)","ancestor":"Jean I (1667-1748)"},{"name":"Jean II (1710-1790)","ancestor":"Jean I (1667-1748)","children":[{"name":"Jean III (1744-1807)","ancestor":"Jean II (1710-1790)"},{"name":"Jacques II (1759-1789)","ancestor":"Jean II (1710-1790)"}]}]}]}]';
const pool = new Pool({
    user: envVar.userDb,
    host: envVar.host,
    database: envVar.dbName,
    password: envVar.pwdDb,
    port: envVar.portDb,
})

const getData = (req, res, query, values) => {
    let client = new pg.Client(conString);
    client.connect(err => {
        if (err) {
            console.log('error could not connect', err)
            res.status(500).end('Db connection error');
        } else {
            client.query(query, values, (err, result) => {
                if (err) {
                    console.log('bad request', err);
                    res.status(500).end('bad request error');
                } else {
                    let datas = [];
                    for (id in result.rows) {
                        datas.push(result.rows[id]);
                    }
                    jsonData = JSON.stringify(datas)
                    res.setHeader('Content-Type', 'application/json');
                    res.send(jsonData);
                }
            })
        }
    })
}

const getGraph = async(idUser) => {
    try {
        const result = await pool.query('SELECT * FROM graph WHERE user_id =$1', [idUser]);
        let graphs = result.rows
        return graphs
    } catch (err) {
        console.log(err)
    }
}

const getList = async(idUser) => {
    try {
        const result = await pool.query('SELECT * FROM list WHERE user_id =$1', [idUser]);
        let lists = result.rows
        return lists
    } catch (err) {
        console.log(err)
    }
}

const getTree = async(idUser) => {
    try {
        const result = await pool.query('SELECT * FROM tree WHERE user_id =$1', [idUser]);
        let trees = result.rows
        return trees
    } catch (err) {
        console.log(err)
    }
}

//GESTION LOGGIN
app.get('/', async(req, res) => {
    res.render('login');
})

app.post('/', async(req, res) => {
    //on recupere les datas
    let userName = req.body.userName;
    let pwd = req.body.userPassword;
    try {
        const result = await pool.query('SELECT name FROM userTab WHERE name =$1', [userName]);
        if (result.rows.length > 1) {
            console.log("more than 1 user with this username")
            res.status(500).end('Db connection error');
        } else if (result.rows.length == 0) {
            console.log("no user found")
            res.redirect('/');
        } else {
            const result = await pool.query("SELECT pwd,id FROM userTab WHERE name =$1", [userName])
            pwdDb = result.rows[0].pwd;
            if (pwdDb == pwd) {
                let user = {
                    "name": userName,
                    "id": result.rows[0].id
                }
                let graphs = await getGraph(result.rows[0].id);
                let lists = await getList(result.rows[0].id);
                let trees = await getTree(result.rows[0].id);
                res.render('home', { user, graphs, lists, trees, viewSet: 'dashboard' })
            } else {
                console.log("bad mdp")
                res.redirect('/');
            }
        }
    } catch (err) {
        console.log(err)
        res.status(500).end(err);
    }
});

//HOME PAGE
app.get('/home/:id', async(req, res) => {
    idUser = req.params.id;
    const result = await pool.query("SELECT name FROM userTab WHERE id = $1", [idUser])
    userName = result.rows[0].name
    let user = {
        "name": userName,
        "id": idUser
    }
    let graphs = await getGraph(idUser);
    let lists = await getList(idUser);
    let trees = await getTree(idUser);
    res.render('home', { user, graphs, lists, trees, viewSet: "dashboard" })
})


//GESTION GRAPH
app.post('/addGraph', async(req, res, next) => {
    id = req.body.id;
    try {
        let today = new Date(); //GERER DATE INSERT
        const result = await pool.query('INSERT INTO graph(name,lasteditdate,data,user_id) VALUES($1,$2,$3,$4)', ["nouveau graph", '2021-03-30', defaultDataGraph, id]);
        res.send({ state: "good" })
    } catch (error) {
        console.log(error)
        res.status(500).end(error);
    }
})

app.post('/deleteGraph', async(req, res) => {
    id = req.body.id;
    if (id != null) {
        const result = await pool.query('DELETE FROM graph WHERE id=$1', [id]);
        res.send({ state: "good" })
    }
})

app.get('/graph/:id', async(req, res) => {
    let graphId = req.params.id;
    const resultgraph = await pool.query('SELECT * FROM graph WHERE graph.id=$1', [graphId])
    let graphs = resultgraph.rows[0]; //on renvoie seulement un graph
    let lists = []; //pas besoin des listes et arbres
    let trees = [];
    const result = await pool.query('SELECT userTab.name,userTab.id FROM userTab INNER JOIN graph ON userTab.id = graph.user_id WHERE graph.id=$1', [graphId])
    const user = {
        "name": result.rows[0].name,
        "id": result.rows[0].id
    }
    let viewSet = "graph"
    res.render('home', { user, graphs, lists, trees, viewSet })
})

app.post('/modifyGraph', async(req, res) => {
    console.log("asked for saving")
    let newNameGraph = req.body.newName;
    let newData = req.body.newData
    let idGraph = req.body.id;
    //update date TODO
    const request = pool.query('UPDATE graph SET name=$1,data=$2 WHERE id=$3', [newNameGraph, newData, idGraph]);
    console.log('done')
})

//GESTION ARBRES
app.post('/addTree', async(req, res, next) => {
    id = req.body.id;
    try {
        let today = new Date(); //GERER DATE INSERT
        const result = await pool.query('INSERT INTO tree(name,lasteditdate,data,user_id) VALUES($1,$2,$3,$4)', ["nouvel arbre", '2021-03-30', defaultDataTree, id]);
        res.send({ state: "good" })
    } catch (error) {
        console.log(error)
        res.status(500).end(error);
    }
})

app.post('/deleteTree', async(req, res) => {
    id = req.body.id; //on recupere l'id de l'arbre à supprimer
    if (id != null) {
        const result = await pool.query('DELETE FROM tree WHERE id=$1', [id]);
        res.send({ state: "good" })
    }
})

app.get('/tree/:id', async(req, res) => {
    let treeId = req.params.id;
    const resultTree = await pool.query('SELECT * FROM tree WHERE tree.id=$1', [treeId])
    let trees = resultTree.rows[0]; //on renvoie seulement l'arbre
    let graphs = []; //pas besoin des listes et graphs
    let lists = [];
    const result = await pool.query('SELECT userTab.name,userTab.id FROM userTab INNER JOIN tree ON userTab.id = tree.user_id WHERE tree.id=$1', [treeId])
    const user = {
        "name": result.rows[0].name,
        "id": result.rows[0].id
    }
    let viewSet = "tree"
    res.render('home', { user, graphs, lists, trees, viewSet })
})

app.post('/modifyTree', async(req, res) => {
    console.log("asked for saving")
    let newTreeName = req.body.newName;
    let newData = req.body.newData
    let idTree = req.body.id;
    //update date TODO
    const request = pool.query('UPDATE tree SET name=$1,data=$2 WHERE id=$3', [newTreeName, newData, idTree]);
    console.log('done')
})

//GESTION LISTE
app.post('/addList', async(req, res, next) => {
    id = req.body.id;
    try {
        let today = new Date(); //GERER DATE INSERT
        const result = await pool.query('INSERT INTO list(name,lasteditdate,data,user_id) VALUES($1,$2,$3,$4)', ["nouvelle liste", '2021-03-30', defaultDataList, id]);
        res.send({ state: "good" })
    } catch (error) {
        console.log(error)
        res.status(500).end(error);
    }
})

app.post('/deleteList', async(req, res) => {
    id = req.body.id;
    if (id != null) {
        const result = await pool.query('DELETE FROM list WHERE id=$1', [id]);
        res.send({ state: "good" })
    }
})

app.get('/list/:id', async(req, res) => {
    let listId = req.params.id;
    const resultList = await pool.query('SELECT * FROM list WHERE list.id=$1', [listId])
    let lists = resultList.rows[0]; //on renvoie seulement un graph
    let graphs = []; //pas besoin des graphs et arbres
    let trees = [];
    const result = await pool.query('SELECT userTab.name,userTab.id FROM userTab INNER JOIN list ON userTab.id = list.user_id WHERE list.id=$1', [listId])
    const user = {
        "name": result.rows[0].name,
        "id": result.rows[0].id
    }
    let viewSet = "list"
    res.render('home', { user, graphs, lists, trees, viewSet })
})

app.post('/modifyList', async(req, res) => {
    console.log("asked for saving")
    let newNameList = req.body.newName;
    let newData = req.body.newData
    let idList = req.body.id;
    //update date TODO
    const request = pool.query('UPDATE list SET name=$1,data=$2 WHERE id=$3', [newNameList, newData, idList]);
    console.log('done')
})


//GESTION ERREUR ROUTES

app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500).send({
        error: {
            status: error.status || 500,
            message: error.message || 'Internal Server Error',
        },
    });
});

app.listen(envVar.port, () => {
    console.log("server started on port" + envVar.port)
});