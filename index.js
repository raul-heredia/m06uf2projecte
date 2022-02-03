window.onload = main;

function main() {
    const reducer = (state = [], action) => {
        console.log('reducer', state, action);
        if (action.type === 'ADD_USER') {
            return [...state, { id: action.id, nom: action.nom, curs: action.curs, nota: action.nota }].sort((a, b) => { return a.id - b.id });
        };
        if (action.type === 'MODIFY_USER') {
            let objectPos = state.map((x) => { return x.id; }).indexOf(action.id);
            if (objectPos !== -1) {
                if (action.nom != "") {
                    state[objectPos].nom = action.nom;
                }
                if (action.curs != "") {
                    state[objectPos].curs = action.curs;
                }
                if (!isNaN(action.nota)) {
                    state[objectPos].nota = action.nota;
                }
            } else {
                alert(`Error, no existeix cap alumne amb el identificador ${action.id}.`);
            }
        };
        if (action.type === 'DELETE_USER') {
            let objectPos = state.map((x) => { return x.id; }).indexOf(action.id);
            if (objectPos !== -1) {
                state.splice(objectPos, 1);
            } else {
                alert(`Error, no existeix cap alumne amb el identificador ${action.id}.`);
            }
        }
        if (action.type === 'FILTER_TEXT') {
            const filtre = state.filter(alumne => alumne.nom.startsWith(action.filtrar));
            return filtre;
        }
        if (action.type === 'FILTER_NOTA') {
            if (action.filter === 'aprovats') {
                let filterAprovats = state.filter(alumne => alumne.nota >= 5);
                return filterAprovats;
            } else if (action.filter === 'suspesos') {
                let filterSuspesos = state.filter(alumne => alumne.nota < 5);
                return filterSuspesos;
            } else if (action.filter === 'tots') {
                return state;
            };
        }
        return state.sort((a, b) => { return a.id - b.id });
    };
    const store = Redux.createStore(reducer);
    const taula = document.getElementById('taula');
    // INPUTS
    const idInput = document.getElementById('idInput');
    const userInput = document.getElementById('userInput');
    const cursInput = document.getElementById('cursInput');
    const notaInput = document.getElementById('notaInput');
    // Botons
    const addUserBtn = document.getElementById('addUser');
    const editUserBtn = document.getElementById('editUser');

    // FILTER:
    let resetFilter = document.getElementById('resetFilter')
    let selectMitjana = document.getElementById('selectMitjana');
    let inputFiltrar = document.getElementById('filtrar');
    let mitjana = "tots";
    const DB_VERSION = 19;
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {
        READ_WRITE: "readwrite"
    };
    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

    //la petició d'obertura no crea la DB, retorna de manera asíncrona un IDBOpenDBRequest, amb un objecte exit o error.
    var peticioObertura = window.indexedDB.open("DAW2", DB_VERSION);
    var db;

    class Emmagatzematge {
        static desar(id, nom, curs, nota) {
            let magatzemObjsAlumnes = db.transaction("alumnes", "readwrite").objectStore("alumnes");
            let alumne = {
                'id': parseInt(id), 'nom': nom, 'curs': curs, 'nota': parseInt(nota)
            };
            magatzemObjsAlumnes.add(alumne);
        }
        static esborrarAlumne(id) {
            let magatzemObjsAlumnes = db.transaction("alumnes", "readwrite").objectStore("alumnes");
            magatzemObjsAlumnes.delete(parseInt(id));
        }
    }
    peticioObertura.onerror = function (event) {
        alert("Problema!");
    };
    peticioObertura.onsuccess = function (event) {
        db = event.target.result;
        let magatzemObjsAlumnes = db.transaction("alumnes", "readwrite").objectStore("alumnes");
        magatzemObjsAlumnes.openCursor().onsuccess = (event) => {
            let cursor = event.target.result;
            if (cursor) {
                //console.log(cursor.key + " es " + cursor.value.nom);
                store.dispatch({
                    type: "ADD_USER", id: parseInt(cursor.key), nom: cursor.value.nom, curs: cursor.value.curs, nota: parseInt(cursor.value.nota)
                });
                cursor.continue();
            }
        };
    };

    peticioObertura.onupgradeneeded = function (event) {
        var db = event.target.result;
        try {
            db.deleteObjectStore("alumnes");
        }
        catch (e) {

        }

        //  magatzem amb autoIncrement com a key generator per a les notes dels alumnes
        var magatzemObjsAlumnes = db.createObjectStore("alumnes", {
            keyPath: "id"
        });
    };

    // FUNCIONS
    function afegirUsuari(id, nom, curs, nota) {
        let objectPos = store.getState().map((x) => { return x.id; }).indexOf(parseInt(id));
        if (objectPos === -1) {
            Emmagatzematge.desar(parseInt(id), nom, curs, parseInt(nota));
            store.dispatch({
                type: "ADD_USER", id: parseInt(id), nom: nom, curs: curs, nota: parseInt(nota)
            });
        } else {
            alert(`Error, ja existeix un alumne amb el identificador ${id}.`);
            netejaCamps()
        };
    }
    function netejaCamps() {
        idInput.value = '';
        userInput.value = '';
        cursInput.value = '';
        notaInput.value = '';
    }
    function esborraTaula() {
        while (taula.rows.length > 1) {
            taula.deleteRow(1);
        }
    }
    function generaTaula() {
        netejaCamps()
        esborraTaula()
        store.getState().forEach(user => {
            let fila = taula.insertRow(-1);
            fila.insertCell(0).innerHTML = user.id;
            fila.insertCell(1).innerHTML = user.nom;
            fila.insertCell(2).innerHTML = user.curs;
            let nota = fila.insertCell(3);
            if (user.nota < 5) {
                nota.className = 'suspes';
            } else if (user.nota == 5) {
                nota.className = 'suficient';
            } else if (user.nota > 5) {
                nota.className = 'aprovat';
            }
            nota.innerHTML = user.nota;
            let esborrar = fila.insertCell(4);
            esborrar.innerHTML = '<i class="bi bi-x-lg"></i>';
            esborrar.className = "esborrar";
            esborrar.setAttribute('id', user.id);
        })
    }

    function dropJSON(targetEl, callback) {
        // disable default drag & drop functionality
        targetEl.addEventListener('dragenter', function (e) { e.preventDefault(); });
        targetEl.addEventListener('dragover', function (e) { e.preventDefault(); });

        targetEl.addEventListener('drop', function (event) {

            var reader = new FileReader();
            reader.onloadend = function () {
                var data = JSON.parse(this.result);
                callback(data);
            };

            reader.readAsText(event.dataTransfer.files[0]);
            event.preventDefault();
        });
    }

    dropJSON(
        document.getElementById("dropTarget"),
        function (data) {
            // dropped - do something with data
            for (let i in data) {
                afegirUsuari(data[i].id, data[i].nom, data[i].curs, data[i].nota)
                //console.log("for", data[i].nom);
            }
        }
    );

    // STORE SUBSCRIBE DETECTA CANVIS EN EL ESTAT I EXECUTA EL CODI QUE HI HA DINS CADA COP QUE CANVIA

    store.subscribe(() => {
        generaTaula();
    });


    // LISTENERS

    addUserBtn.addEventListener('click', () => {
        if (idInput.value !== "" || userInput.value !== "" || cursInput.value !== "" || notaInput.value !== "") {
            afegirUsuari(idInput.value, userInput.value, cursInput.value, notaInput.value)
        } else {
            alert("Error, falten camps per omplir.");
        };
    });
    editUserBtn.addEventListener('click', () => {
        store.dispatch({
            type: "MODIFY_USER", id: parseInt(idInput.value), nom: userInput.value, curs: cursInput.value, nota: parseInt(notaInput.value)
        });
        netejaCamps();
    })
    taula.addEventListener('click', (event) => {
        if (event.target.className == "esborrar" || event.target.parentNode.className == "esborrar") {
            buttonClicked = event.target.id;
            if (event.target.tagName == 'I' && event.target.parentNode.tagName == 'TD') {
                buttonClicked = event.target.parentNode.id; // Nos aseguramos que clicando el icono no devuelva undefined diciendole que el value es el valor del parentNode (El valor de cada botón)
            }
            store.dispatch({
                type: "DELETE_USER", id: parseInt(buttonClicked)
            });
            Emmagatzematge.esborrarAlumne(buttonClicked)
        }
    });
    inputFiltrar.addEventListener('keydown', () => {
        store.dispatch({
            type: "FILTER_TEXT", filter: inputFiltrar.value,
        })
    })
    selectMitjana.addEventListener('change', (event) => {
        mitjana = event.target.value;

    });
    resetFilter.addEventListener('click', () => {
        selectMitjana.getElementsByTagName('option')[0].selected = 'selected'
    });
}