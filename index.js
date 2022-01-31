window.onload = main;

function main() {

    const reducer = (state = [], action) => {
        console.log("reducer", state, action);
        if (action.type === "ADD_USER") {
            return [...state, { id: action.id, nom: action.nom, curs: action.curs, nota: action.nota }];
        };
        return state;
    };
    const store = Redux.createStore(reducer);
    const taula = document.getElementById('taula');
    const idInput = document.getElementById('idInput');
    const userInput = document.getElementById('userInput');
    const addUserBtn = document.getElementById('addUser');


    // FUNCIONS
    function netejaCamps() {
        idInput.value = '';
        userInput.value = '';
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
        let elementPos = store.getState().map((x) => { return x.id; }).indexOf(idInput.value);
        if (elementPos === -1) {
            store.dispatch({
                type: "ADD_USER", id: idInput.value, nom: userInput.value, curs: "DAW2", nota: Math.floor(Math.random() * 11)
            });
        } else {
            netejaCamps()
            alert("Error, ja existeix un alumne amb aquest identificador");
        }

    })
}