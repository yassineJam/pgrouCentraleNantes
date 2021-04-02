//DEFINITIONS DES CONSTANTES
const saveButton = document.getElementById("buttonSave");
const addNodeButton = document.getElementById("buttonAddNode");
const addNodeButtonForm = document.getElementById("plusButtonForm");
const dataList = document.querySelector("#dataList ul");
const addEdgeButton = document.getElementById("buttonAddEdge");
const deleteEdgeButton = document.getElementById("buttonDeleteEdge");
const showFormButton = document.getElementById("showForm");
const randomizeButton = document.getElementById("buttonReload");
const fitButton = document.getElementById("buttonFit");
const settingButton = document.getElementById('buttonSetting');
const findPathButton = document.getElementById("buttonFindPath")
const deleteNodeButton = document.getElementById('buttonDeleteNode');
const inputNameProject = document.querySelector('header input');
const validateDataBtn = document.getElementById("validateDataBtn")
const addDataBtn = document.getElementById('addDataBtn');
const buttonEditEdge = document.getElementById('buttonEditEdge')
const inputForEdgeData = document.getElementById('inputForEdgeData')
const dataFromLast = document.currentScript.getAttribute("graphData"); //on recupere l'id de l'utilisateur passer en param
let url = window.location.pathname; //on recup l'url
let idGraph = url.substring(url.lastIndexOf('/') + 1); //on recupere alors l'id du graph
const container = document.querySelector(".containerOfData")

var cy = cytoscape({
    container: document.getElementById('cy'),
    // ELEMENTS : NODES AND EDGES
    elements: {
        //NODE ELEMENTS
        nodes: [],
        //EDGE ELEMENTSs
        edges: []
    },
    // STYLES
    style: [{
            selector: 'node',
            style: {
                'background-color': '#A5A4A4',
                'label': 'data(value.defaut)'
            }
        },
        {
            selector: 'edge',
            style: {
                'width': 3,
                'color': '',
                'line-color': '#A5A4A4',
                'curve-style': 'bezier',
                'label': 'value[0]',
                'line-opacity': '0.5',
                'control-point-step-size': '150',
            }
        },
        {
            selector: ':selected',
            style: {
                'line-color': '#7182AD',
                'background-color': '#7182AD'
            }
        }
    ],
    //LAYOUT/*
    layout: {
        name: 'circle',
        rows: 1
    },
    boxSelectionEnabled: true
});

addEdgeButton.style.display = "block";

//ADD EDGE FUNCTION ============================================
function newEdge() {
    //GET ALL SELECTED NODE
    const nodes = cy.$('node:selected');
    //GET NUMBER
    const nbrNodes = nodes.length;
    if (nbrNodes == 2) {
        const node1 = cy.$('node:selected')[0];
        const node2 = cy.$('node:selected')[1];
        const valueId = '_' + Math.random().toString(36).substr(2, 9); // GENERATE UNIQUE ID
        cy.add({
            group: 'edges',
            data: { id: valueId, source: node1.data().id, target: node2.data().id, value: "0" }
        });
    } else {
        console.log("il faut selectionner deux noeuds seulement")
    }
}
//LISTEN FOR THE USER CLICK
addEdgeButton.addEventListener('click', () => {
    newEdge();
})

//BUTTON DELETE EDGE SETTING ============================================
cy.on('select', 'edge', function(evt) { //IF AN EDGE IS SELCTED
    deleteEdgeButton.style.display = 'block'; //WE DISPLAY THE DELETE EDGE BUTTON
});

cy.on('unselect', 'edge', function(evt) { //IF WE UNSLELECT AN EDGE
    if (cy.$('edge:selected').length == 0) deleteEdgeButton.style.display = 'none'; //AND IF THERE IS NO MORE EDGE SELECTED WE HIDE THE BUTTON
});

//DELETE EDGE FUNCTION
function deleteEdge() {
    cy.$('edge:selected').forEach(edge => { //FOR EACH EDGE SELECTED 
        edge.remove(); //WE DELETE IT
    });
}

deleteEdgeButton.addEventListener('click', () => { //WHEN THE USER CLICK
    deleteEdge(); //WE CALL THE DELETE EDGE FUNCTION
    deleteEdgeButton.style.display = 'none'; //WE HIDE THE BUTTON DELETE EDGE
    cy.$(':selected').forEach(selected => { //AND WE UNSELECT EVERY ELEMENTS
        selected.unselect();
    });
    inputForEdgeData.value = ""

})


//ADD NODE FUNCTION ============================================


function addNode(dataValue = "default") {
    //GENERATION ID TODO
    //valueId = String(Math.random())
    const valueId = '_' + Math.random().toString(36).substr(2, 9); // GENERATE UNIQUE ID
    const dataToNode = ["default"]

    //CREATE THE NODE
    let xPos = Math.round(Math.random() * 300); //CREATE X AND Y BETWEEN 0 AND 20
    let yPos = Math.round(Math.random() * 300);
    const newNode = cy.add([{ group: 'nodes', data: { id: valueId, value: dataToNode }, position: { x: xPos, y: yPos } }, ]);
    //IF NO NODES SELECTED WE CREATE A NODE WITHOUT ANY EDGES
    if (cy.$('node:selected').length == 0) {
        cy.add(newNode);
    } else { //ELSE WE CREATE THE NODE AND EDGE(S)
        const nodesSelected = cy.$('node:selected');
        cy.add(newNode);
        nodesSelected.forEach(node => { //FOR ALL SELECTED NODES WE ADD EDGE TO THE NEW ONE
            if (node.isNode()) { //IF THE SELECTION IS A NODE (not an edge)
                cy.add({
                    group: 'edges',
                    data: { id: `${newNode.data().id}${node.data().id}`, source: node.data().id, target: valueId, value: "0" }
                });
            }
        });
    }
    //HTML DISPLAY
    //CREATE NEW LI
    let newDataLi = document.createElement("li");
    newDataLi.textContent = dataValue;
    newDataLi.classList.add("datas");
    newDataLi.id = valueId; // WE SET THE HTML ID SAME AS THE CYTOSCAPE NODE ID
    //TODO ADD TO JSON FILE
    // newDataLi.addEventListener('dblclick', (e) => {
    //     modify(valueId)
    // })
    // dataList.append(newDataLi);
    //FIT THE VIEW
    cy.animate({ fit: {} }, { duration: 500 });
};
//LISTEN FOR THE USER CLICK
addNodeButton.addEventListener('click', () => {
    addNode();
});

////DELETE NODE FUNCTION ============================================
function deleteNode() {
    cy.$('node:selected').forEach(node => { //FOR EACH NODE SELECTED 
        node.remove(); //WE DELETE IT
    });


}

deleteNodeButton.addEventListener('click', () => { //WHEN THE USER CLICK
    console.log("delete call")
    deleteNode(); //WE CALL THE DELETE NODE FUNCTION
    cy.$(':selected').forEach(selected => { //AND WE UNSELECT EVERY ELEMENTS
        selected.unselect();
    });
    infosTab.style.transform = "translate(320px,0)";
    const divPair = document.querySelectorAll('.blockData');
    divPair.forEach(e => e.remove());
    inputForEdgeData.value = ""

})

//LAYOUT RANDOMIZE
function randomize() {
    let layout = cy.layout({ name: 'random' });
    layout.run();
}
randomizeButton.addEventListener('click', () => {
    randomize();
})

//LAYOUT FIT
fitButton.addEventListener('click', () => {
    cy.animate({ fit: {} }, { duration: 500 });
})


//GESTION DATA PAR NODE
const infosTab = document.getElementsByClassName('infos')[0]

cy.on('select', 'node', function(evt) {
    infosTab.style.transform = "translate(0,0)";
    if (cy.$('node:selected').length == 1) {
        const node = evt.target;
        let nodeId = node.data().id;
        const dataArray = node.data().value;
        for (data of dataArray) {
            let containerDataBlock = document.createElement("div")
            containerDataBlock.setAttribute('class', 'blockData')
            let newInput = document.createElement("input");
            newInput.setAttribute('value', data)
            let deleteDiv = document.createElement("div")
            deleteDiv.setAttribute('class', 'deletedatabtn')
            deleteDiv.innerHTML = "X";
            deleteDiv.addEventListener('click', (e) => {
                deleteDataBlock(e);
            })
            containerDataBlock.appendChild(newInput)
            containerDataBlock.appendChild(deleteDiv)
            container.appendChild(containerDataBlock)
        }
        document.querySelector(".infos h2 .idOfNode").innerHTML = nodeId;
    } else {
        infosTab.style.transform = "translate(320px,0)";
    }
});

cy.on('unselect', 'node', function(evt) {
    infosTab.style.transform = "translate(320px,0)";
    const divPair = document.querySelectorAll('.blockData');
    divPair.forEach(e => e.remove());
});

const deleteDataBlock = (e) => {
    const nodeId = document.querySelector('.idOfNode').innerHTML;
    const blockDiv = e.target.parentNode;
    blockDiv.remove();
    const input = e.target.parentNode.firstChild;
}

validateDataBtn.addEventListener('click', () => {
    console.log("data validation");
    const divPair = document.querySelectorAll('.blockData input');
    const nodeId = document.querySelector('.idOfNode').innerHTML;
    const nodeToUpdate = cy.$('#' + nodeId);
    nodeToUpdate.data().value = [];
    for (let i = 0; i < divPair.length; i++) {
        nodeToUpdate.data().value[i] = divPair[i].value
    }
    nodeToUpdate.unselect()
})

addDataBtn.addEventListener('click', () => {
    let containerDataBlock = document.createElement("div")
    containerDataBlock.setAttribute('class', 'blockData')
    let newInput = document.createElement("input");
    newInput.setAttribute('value', "add your data")
    let deleteDiv = document.createElement("div")
    deleteDiv.setAttribute('class', 'deletedatabtn')
    deleteDiv.innerHTML = "X";
    let newValue = document.createElement("input")
    containerDataBlock.appendChild(newInput)
    containerDataBlock.appendChild(deleteDiv)
    container.appendChild(containerDataBlock)
})

//EDGE EDIT VALUE
cy.on('select', 'edge', function(evt) { //IF AN EDGE IS SELCTED
    const selectedNode = cy.$('edge:selected');
    if (selectedNode.length == 1) {
        const edge = cy.$('edge:selected');
        const edgeData = edge.data().value;
        inputForEdgeData.value = edgeData
    }
});

cy.on('unselect', () => {
    inputForEdgeData.value = ""
})

buttonEditEdge.addEventListener('click', () => {
    console.log("add edit clcik")
    const selectedNode = cy.$('edge:selected');
    if (selectedNode.length == 1) {
        const edge = cy.$('edge:selected');
        edge.data().value = inputForEdgeData.value
        cy.$().unselect()
    }
})

//SAUVEGARDE
saveButton.addEventListener('click', async() => {
    let namegraph = inputNameProject.value; //on recupere le nom du graph
    let dataGraph = JSON.stringify(cy.json()); //on recupere le graph
    let data = {
        "newName": namegraph,
        "newData": dataGraph,
        "id": idGraph
    }
    try {
        request = await fetch('/modifyGraph', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(data) //on envoie dans le body la valeur de l'id de l'utilsateur à rajouter un graph
        });
        if (request.ok) {
            console.log("ok")
                //reload
        } else {
            throw new Error('Request failed.');
        }

    } catch (error) {
        console.log("error: " + error)
    }
})

console.log("hello app");

cy.center()

let dataimported = JSON.parse(dataFromLast)
cy.json(dataimported);

function findPath() {
    const node1 = cy.$(':selected')[0];
    const node2 = cy.$(':selected')[1];

    var p = cy.elements().aStar({ root: node1, goal: node2 }).path;

    if (p) {
        p.select();
    }
};

findPathButton.addEventListener('click', () => {
    findPath();
});