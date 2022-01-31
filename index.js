window.onload = main;

function main() {

    const reducer = (state = [], action) => {
        console.log('reducer', state, action);
        if (action.type === 'ADD_USER') {
            return [...state, { id: action.id, nom: action.nom, curs: action.curs, nota: action.nota }];
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
                if (action.nota != "") {
                    state[objectPos].nota = action.nota;
                }
            } else {
                alert(`Error, no existeix cap alumne amb el identificador ${idInput.value}.`);
            }
        };
        if (action.type === 'DELETE_USER') {
            let objectPos = state.map((x) => { return x.id; }).indexOf(action.id);
            if (objectPos !== -1) state.splice(action.id, 1);
        } else {
            alert(`Error, no existeix cap alumne amb el identificador ${idInput.value}.`);
        }
        return state;
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
    const removeUserBtn = document.getElementById('removeUser');


    // FUNCIONS
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
        })
    }


    store.subscribe(() => {
        generaTaula();
    });


    addUserBtn.addEventListener('click', () => {
        if (idInput.value !== "" || userInput.value !== "" || cursInput.value !== "" || notaInput.value !== "") {
            let objectPos = store.getState().map((x) => { return x.id; }).indexOf(idInput.value);
            if (objectPos === -1) {
                store.dispatch({
                    type: "ADD_USER", id: idInput.value, nom: userInput.value, curs: cursInput.value, nota: notaInput.value
                });
            } else {
                alert(`Error, ja existeix un alumne amb el identificador ${idInput.value}.`);
                netejaCamps()
            };
        } else {
            alert("Error, falten camps per omplir.");
        };
    });
    editUserBtn.addEventListener('click', () => {
        store.dispatch({
            type: "MODIFY_USER", id: idInput.value, nom: userInput.value, curs: cursInput.value, nota: notaInput.value
        });
        netejaCamps();
    })
    removeUserBtn.addEventListener('click', () => {
        store.dispatch({
            type: "DELETE_USER", id: idInput.value
        });
        netejaCamps();
    })
}