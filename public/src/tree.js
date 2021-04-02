console.log('welcome on tree')
const dataFromLast = document.currentScript.getAttribute("treeData"); //on les datas de la derniere utilisation de l'arbre
const inputNameProject = document.querySelector('header input')
let url = window.location.pathname; //on recup l'url

let idTree = url.substring(url.lastIndexOf('/') + 1); //on recupere alors l'id de l'arbre

let treeData = [{
    "name": "0",
    "ancestor": "null",
}];
try {
    treeData = JSON.parse(dataFromLast);
    console.log(dataFromLast)
} catch (e) {
    console.log("error at parsing : " + e);
}
const margin = 55;
let i = 0,
    duration = 750,
    root;

let height = document.querySelector('svg').clientHeight;
let width = document.querySelector('svg').clientWidth;
let tree = d3.layout.tree().size([height - margin, width - margin])
let diagonal = d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; });

const svg = d3.select("svg").attr("width", width + margin)
    .attr("height", height + margin)
    .append("g")
    .attr("transform", "translate(" + margin + "," + margin + ")");


root = treeData[0];
root.x0 = height / 2;
root.y0 = height / 2;

update(root);
d3.select(self.frameElement).style("height", "500px");
var selected = null;


function update(source) {

    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse(),
        links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function(d) { d.y = d.depth * 180; });

    // Update the nodes…
    var node = svg.selectAll("g.node")
        .data(nodes, function(d) { return d.id || (d.id = ++i); })

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
        .on("dblclick", doubleclick)
        .on("click", addremove);

    nodeEnter.append("circle")
        .attr("r", 1e-6)
        .style("fill", function(d) {
            { if (selected == d) { return "black" } else { if (d._children) { return "lightsteelblue" } else { return "#fff" } } }
        });

    nodeEnter.append("text")
        //.attr("x", function(d) { return d.children || d._children ? -13 : 13; })
        //.attr("x", function(d) { return d.children || d._children ? -13 : -13; })
        //.attr("y", function(d) { return d.children || d._children ? -13 : -13; })
        .attr("dy", ".35em")
        //.attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
        //.attr("text-anchor", function(d) { return d.children || d._children ? "end" : "end"; })
        .attr("text-anchor", "middle")
        .text(function(d) { return d.name; })
        .style("fill-opacity", 1e-6);

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

    nodeUpdate.select("circle")
        .attr("r", 10)
        .style("fill", function(d) {
            { if (selected == d) { return "black" } else { if (d._children) { return "lightsteelblue" } else { return "#fff" } } }
        });

    nodeUpdate.select("text")
        .text(function(d) { return d.name; })
        .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
        .remove();

    nodeExit.select("circle")
        .attr("r", 1e-6);

    nodeExit.select("text")
        .style("fill-opacity", 1e-6);

    // Update the links…
    var link = svg.selectAll("path.link")
        .data(links, function(d) { return d.target.id; });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function(d) {
            var o = { x: source.x0, y: source.y0 };
            return diagonal({ source: o, target: o });
        });

    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr("d", function(d) {
            var o = { x: source.x, y: source.y };
            return diagonal({ source: o, target: o });
        })
        .remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });
}

// Toggle children on double click.
function doubleclick(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else {
        d.children = d._children;
        d._children = null;
    }
    update(d);
}

// Activate buttons on click.
function addremove(d) {
    selected = d;
    if (!d._children) {
        document.getElementById('add-child').disabled = false;
        document.getElementById('remove-node').disabled = false;
        document.getElementById('remove-child').disabled = false;
    }
    update(d);
}

document.getElementById('add-child').onclick = function() {
    insert(selected, {});
    update(selected);
}
document.getElementById('remove-node').onclick = function() {
    removenode(selected);
}
document.getElementById('remove-child').onclick = function() {
    removechild(selected);
}
document.getElementById('turn-bst').onclick = function() {
    binaryTreeToBNS();

}



var nbnode = 1;

function insert(par, data) {
    if (!par.children && !par._children) {
        par.children = [];
    }
    if (!par._children) {
        par.children.push({
            //"name": Date.now().toString(),
            "name": i.toString(),
            "children": []
        });
        nbnode += 1;
    }
};

function removenode(par) {
    if (par == root) {
        par.children = null;
        par._children = null;
        update(par);
    } else {
        function trouveParent(node, orphan) {
            if (node.children) {
                var count = node.children.length;
                var result = null;
                for (var i = 0; result == null && i < count; i++) {
                    if (node.children[i].name == orphan.name) {
                        result = node;
                    } else {
                        result = trouveParent(node.children[i], orphan);
                    }
                }
                return result;
            }

        }
        parentOfPar = trouveParent(root, par);

        function enleverchild(parentNode, childNode) {
            var count = parentNode.children.length;
            var newChildren = [];
            for (var i = 0; i < count; i++) {
                if (parentNode.children[i].name != childNode.name) {
                    newChildren.push(parentNode.children[i]);
                }
            }
            parentNode.children = newChildren;
        }
        enleverchild(parentOfPar, par);
        parentOfPar._children = null;
        document.getElementById('add-child').disabled = true;
        document.getElementById('remove-node').disabled = true;
        document.getElementById('remove-child').disabled = true;
        update(parentOfPar);

    }
};

function removechild(par) {
    par.children = null;
    par._children = null;
    update(par);
};

function expandTree(node) {

    function expandTreeRecur(node) {
        if (node._children) {
            node.children = node._children;
            node._children = null;
        }
        if (node.children) {
            for (var i = 0; i < node.children.length; i++) {
                expandTreeRecur(node.children[i]);
            }
        }
    }

    expandTreeRecur(node);
    update(node);
}

// A n'utiliser que si l'arbre est totalement étendu
function isBinaryTree(node) {
    var result = true;
    if (node.children) {
        if (node.children.length > 2) {
            result = false;
        } else {
            for (var i = 0; result && i < node.children.length; i++) {
                result = (result && isBinaryTree(node.children[i]));
            }
        }
    }
    return result;
};


// A n'utiliser que si l'arbre est totalement étendu
function parcoursBinaryTree() {
    var list = [];

    function parcoursInfixe(node, listeNoeud) {
        if (!node.children) {
            listeNoeud.push({ "name": node.name });
        } else if (node.children.length == 2) {
            parcoursInfixe(node.children[0], listeNoeud);
            listeNoeud.push({ "name": node.name });
            parcoursInfixe(node.children[1], listeNoeud);
        } else {
            if (Number(node.children[0].name) < Number(node.name)) {
                parcoursInfixe(node.children[0], listeNoeud);
                listeNoeud.push({ "name": node.name });
            } else {
                listeNoeud.push({ "name": node.name });
                parcoursInfixe(node.children[0], listeNoeud);
            }
        }
    }
    parcoursInfixe(root, list);

    return list;
}

// A n'utiliser que si l'arbre est totalement étendu
function newTreeData(nouvelOrdre) {

    function parcoursInfixe2(node, listeNoeud) {
        var tempNode;
        if (!node.children) {
            tempNode = listeNoeud.pop();
            node.name = tempNode.name;
        } else if (node.children.length == 2) {
            parcoursInfixe2(node.children[0], listeNoeud);
            tempNode = listeNoeud.pop();
            node.name = tempNode.name;
            parcoursInfixe2(node.children[1], listeNoeud);
        } else {
            if (Number(node.children[0].name) < Number(node.name)) {
                parcoursInfixe2(node.children[0], listeNoeud);
                tempNode = listeNoeud.pop();
                node.name = tempNode.name;
            } else {
                tempNode = listeNoeud.pop();
                node.name = tempNode.name;
                parcoursInfixe2(node.children[0], listeNoeud);
            }
        }
    }
    parcoursInfixe2(root, nouvelOrdre);
}

// A n'utiliser que si l'arbre est totalement étendu
function binaryTreeToBNS() {
    expandTree(root);
    if (!isBinaryTree(root)) {
        alert("L'arbre fourni n'est pas binaire.");
    } else {
        listeParcours = parcoursBinaryTree();
        listeParcours.sort((a, b) => { return Number(b.name) - Number(a.name); });
        newTreeData(listeParcours);
        update(treeData[0]);
    }

}



document.getElementById('buttonSave').addEventListener('click', async() => {
    console.log('saving asked');
    //console.log(JSON.stringify(treeData));
    /*const res = await JSON.stringify(treeData)
    let nameTree = inputNameProject.value;*/

})