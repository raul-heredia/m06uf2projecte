window.onload = main;

function main() {
    const reducer = (state = [], action) => {
        console.log('reducer', state, action);
        // Segons el tipus d'acció el reducer farà una cosa o una altra
        if (action.type === 'ADD_USER') { // Si l'acció es un ADD_USER afegirem l'usuari nou a l'estat actual, ordenant tot el array d'estat per ID ascenent
            return [...state, { id: action.id, nom: action.nom, curs: action.curs, nota: action.nota }].sort((a, b) => { return a.id - b.id }); // Retornem l'estat amb el nou usuari
        };
        if (action.type === 'MODIFY_USER') { // Si el tipus es MODIFY_USER
            let objectPos = state.map((x) => { return x.id; }).indexOf(action.id); // Comprovem si existeix l'usuari
            if (objectPos !== -1) { // Si existeix l'usuari
                if (action.nom != "") { // Si el camp nom no està buit el canviem, si està buit no canviarà.
                    state[objectPos].nom = action.nom; // canviem el nom que està guardat en la posició ObjectPos de l'estat
                }
                if (action.curs != "") { // Si el camp curs no està buit el canviem, si està buit no canviarà.
                    state[objectPos].curs = action.curs; // canviem el curs que està guardat en la posició ObjectPos de l'estat
                }
                if (!isNaN(action.nota)) { // Si el camp nota es un número el canviem, si no es un número no canviarà.
                    state[objectPos].nota = action.nota; // canviem la nota que està guardada en la posició ObjectPos de l'estat
                }
                Emmagatzematge.modificarAlumne(parseInt(state[objectPos].id), state[objectPos].nom, state[objectPos].curs, state[objectPos].nota); // Per modificar agafem tots els camps després de modificar-los per a poder actualitzar tots els registres independentment de si s'han modificat o no. 
                WebStorageEmmagatzematge.desar(parseInt(state[objectPos].id), state[objectPos].nom); // En web storage no fa falta un metode especial per modificar, simplement el tornem a afegir;
            } else { // Si l'objecte no existeix enviem un alert
                alert(`Error, no existeix cap alumne amb el identificador ${action.id}.`);
            }
        };
        if (action.type === 'DELETE_USER') { // Si la acció es DELETE_USER
            let objectPos = state.map((x) => { return x.id; }).indexOf(action.id); // Busquem l'usuari a l'array d'estat
            if (objectPos !== -1) { // si existeix
                state.splice(objectPos, 1); // fem un splice per a esborrar-lo i que no deixi una posició buida a l'array
            } else { // Si no existeix donem un error
                alert(`Error, no existeix cap alumne amb el identificador ${action.id}.`);
            }
        }
        if (action.type === 'RESET_FILTER') { // Si arriba un RESET_FILTER 
            return state.sort((a, b) => { return a.id - b.id }); // retornem el array normal , no faria falta tenir-lo ja que en cas de que no existís quan arribés el RESET_FiLTER seria retornat al return de la linia 37
        }
        return state.sort((a, b) => { return a.id - b.id }); // Si no cumpleix cap tipus d'acció retorna l'estat ordenat per id
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
        static modificarAlumne(id, nom, curs, nota) {

            let magatzemObjsAlumnes = db.transaction("alumnes", "readwrite").objectStore("alumnes");
            let alumne = {
                'id': parseInt(id), 'nom': nom, 'curs': curs, 'nota': parseInt(nota)
            };
            magatzemObjsAlumnes.put(alumne);
        }
    }

    class WebStorageEmmagatzematge extends Emmagatzematge {
        static desar(id, nom) {
            localStorage.setItem(parseInt(id), nom);
        }
        static esborrarAlumne(id) {
            localStorage.removeItem(parseInt(id));
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
                store.dispatch({ // Afegim els usuaris de indexeddb enviant un dispatch de ADD_USER
                    type: "ADD_USER", id: parseInt(cursor.key), nom: cursor.value.nom, curs: cursor.value.curs, nota: parseInt(cursor.value.nota)
                });
                WebStorageEmmagatzematge.desar(parseInt(cursor.key), cursor.value.nom) // Guardem el key i el nom a local storage
                cursor.continue();
            }
        };
        let valor = 1, b;
        if (valor == 1) {
            b = 'return x + y + z ';
        } else {
            b = 'return x*y*z';
        }
        let funcDinamica = new Function('x', 'y', 'z', b)
        for (let key = 0; key < localStorage.length; key++) {
            console.log("Dades Local Storage, ID:", funcDinamica(localStorage.key(key), ", nom: ", localStorage.getItem(localStorage.key(key))))
        }
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
        let objectPos = store.getState().map((x) => { return x.id; }).indexOf(parseInt(id)); // Busquem si l'usuari ja existeix
        if (objectPos === -1) { // Si noe existeix l'afegim
            Emmagatzematge.desar(parseInt(id), nom, curs, parseInt(nota));
            WebStorageEmmagatzematge.desar(parseInt(id), nom);
            store.dispatch({ // Fem un dispatch per enviar l'acció de tipus ADD_USER al store de redux que després passarà al reducer
                type: "ADD_USER", id: parseInt(id), nom: nom, curs: curs, nota: parseInt(nota)
            });
        } else { // Si existeix no l'afegim i enviem una alerta
            alert(`Error, ja existeix un alumne amb el identificador ${id}.`);
            netejaCamps()
        };
    }
    function netejaCamps() { // Netejem els camps de input
        idInput.value = '';
        userInput.value = '';
        cursInput.value = '';
        notaInput.value = '';
    }
    function esborraTaula() { // Esborrem les row de la taula a partir de la número 1, per a no esborrar el header
        while (taula.rows.length > 1) {
            taula.deleteRow(1);
        }
    }
    function generaTaula() {
        netejaCamps() // Netejem els camps
        esborraTaula() // Esborrem la taula
        store.getState().forEach(user => { // Obtenim el estat amb store.getState i iterem per cada objecte que conté
            let fila = taula.insertRow(-1); // amb insertRow(-1) afegim cada linia al final
            fila.insertCell(0).innerHTML = user.id; // A la cel·la 0 afegim el id
            fila.insertCell(1).innerHTML = user.nom; // A la cel·la 1 afegim el nom
            fila.insertCell(2).innerHTML = user.curs; // A la cel·la 2 afegim el curs
            let nota = fila.insertCell(3); // Fem una variable per a la cel·la 3
            if (user.nota < 5) {
                nota.className = 'suspes'; // Si la nota es menor a 5 afegim la classe suspes a la cel·la
            } else if (user.nota == 5) {
                nota.className = 'suficient'; // Si la nota es igual a 5 afegim la classe suficient a la cel·la
            } else if (user.nota > 5) {
                nota.className = 'aprovat'; // Si la nota es major a 5 afegim la classe aprovat a la cel·la
            }
            nota.innerHTML = user.nota; // Afegim la nota a la cel·la
            let esborrar = fila.insertCell(4); // Creem una variable per a la cel·la d'esborrar
            esborrar.innerHTML = '<i class="bi bi-x-lg"></i>'; // Afegim el html per a la icona d'esborrar
            esborrar.className = "esborrar"; // Afegim la classe esborrar a la cel·la
            esborrar.setAttribute('id', user.id); // Afegim l'id de usuari a la cel·la
        })
    }
    function generaTaulaFiltre(arrfilter) { // Fa el mateix que generaTaula pero li passem un array ja filtrat
        netejaCamps()
        esborraTaula()
        arrfilter.forEach(user => {
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
            // Si els camps no estàn buits truquem a la funció afegirUsuari
            afegirUsuari(idInput.value, userInput.value, cursInput.value, notaInput.value)
        } else { // Si falta algun camp fem un alert
            alert("Error, falten camps per omplir.");
        };
    });
    editUserBtn.addEventListener('click', () => {
        // Quan fem clic al boto d'editar fem un dispatch de tipus MODIFY_USER
        store.dispatch({
            type: "MODIFY_USER", id: parseInt(idInput.value), nom: userInput.value, curs: cursInput.value, nota: parseInt(notaInput.value)
        });
        // cridem a la funció netejaCamps
        netejaCamps();
    })
    taula.addEventListener('click', (event) => {
        if (event.target.className == "esborrar" || event.target.parentNode.className == "esborrar") { // si el class del que hem clicat o el parent node del que hem clicat es esborrar entra al if
            let buttonClicked = event.target.id; // afegim el id a la variable buttonClicked
            if (event.target.tagName == 'I' && event.target.parentNode.tagName == 'TD') {
                buttonClicked = event.target.parentNode.id; // En cas de que cliquem just la icona, ens asegurem de que no retorni un undefined donant-li el valor del parent node, la classe del TD.
            }
            store.dispatch({
                type: "DELETE_USER", id: parseInt(buttonClicked) // Enviem una accio amb dispatch de tipus DELETE_USER
            });
        }
    });
    inputFiltrar.addEventListener('keyup', () => { // cada vegada que aixequem una tecla
        let filterText = store.getState().filter((a) => a.nom.toLowerCase().startsWith(inputFiltrar.value.toLowerCase()) || a.curs.toLowerCase().startsWith(inputFiltrar.value.toLowerCase())) // Generem un array en el qual el nom o el curs començi per el value de inputFiltrar
        generaTaulaFiltre(filterText); // generem la taula i le passem el array filtrat
    })
    selectMitjana.addEventListener('change', (event) => {
        mitjana = event.target.value;
        let filtre;
        switch (mitjana) { // fem un array segons si està aprovat o no
            case "aprovats":
                filtre = store.getState().filter((a) => a.nota >= 5)
                break;
            case "suspesos":
                filtre = store.getState().filter((a) => a.nota < 5)
                break;
        }
        generaTaulaFiltre(filtre); // generem la taula passant el array filtrat
    });
    resetFilter.addEventListener('click', () => {
        selectMitjana.getElementsByTagName('option')[0].selected = 'selected'; // resetejem la opció seleccionada de selectMitjana
        inputFiltrar.value = ""; // Resetejem el value de inputFiltrar
        store.dispatch({ // Enviem un canvi d'estat al reducer de tipus RESET_FILTER per a que recarregui l'estat i ens retorni la taula original sense filtres
            type: "RESET_FILTER"
        });
    });
}