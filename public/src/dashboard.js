console.log("client side")

//INITIALISATION DES CONSTANTES
const userId = document.currentScript.getAttribute("userId");
const btnNewGraph = document.getElementById("_graph");
const btnNewTree = document.getElementById("_tree");
const btnNewList = document.getElementById("_list");
const btnDelete = document.querySelectorAll(".deleteBtn"); //on selectionne tout les bouttons delete

//Gestion des nouveaux elements
const addFct = async(route) => {
    const data = {
        id: userId
    }
    try {
        request = await fetch('/add' + route, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(data)
        });
        if (request.ok) {
            document.location.reload();
        } else {
            throw new Error('Request failed.');
        }
    } catch (error) {
        console.log("error: " + error)
    }
}
btnNewGraph.addEventListener('click', async() => {
    addFct('Graph');
})
btnNewTree.addEventListener('click', async() => {
    addFct('Tree');
})
btnNewList.addEventListener('click', async() => {
    addFct('List');
})

btnDelete.forEach(el => el.addEventListener('click', async(e) => {
    e.preventDefault()
    let id = e.target.getAttribute("prop");
    let typeToDelete = e.target.getAttribute("type");
    const data = {
        id: id
    }
    console.log("on veut supprimer un(e) " + e.target.getAttribute("type") + " d'id " + id)
    try {
        request = await fetch('/delete' + typeToDelete, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(data) //on envoie dans le body la valeur de l'id 
        });
        if (request.ok) {
            document.location.reload()
        } else {
            throw new Error('Request failed.');
        }
    } catch (error) {
        console.log("error: " + error)
    }
}))