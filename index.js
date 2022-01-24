window.onload = main;

function main() {

    const reducer = (state = [], action) => {
        console.log("reducer", state, action);
        if (action.type === "ADD_USER") {
            return [...state, [action.nom, action.curs, action.modul, action.nota]];
        };
        return state;
    };
    const store = Redux.createStore(reducer);

    // modulo 1
    // store.subscribe(() => {
    //     console.log("Subscribe modulo 1: ", store.getState());
    // });

    // modulo 2
    // store.dispatch({ type: "ADD_USER", username: "jack" });
    // store.dispatch({ type: "ADD_USER", username: "john" });


    const taula = document.getElementById('taula');
    const addUserBtn = document.getElementById('addUser');
    const userInput = document.getElementById('userInput');

    store.subscribe(() => {
        taula.innerHTML = '<thead> <tr> <th scope="col">Nom</th> <th scope="col">Curs</th> <th scope="col">Modul</th> <th scope="col">Nota</th> </tr> </thead><tbody>';
        userInput.value = '';

        store.getState().forEach(user => {
            let fila = document.createElement('tr');
            for (let i in user) {
                let cela = document.createElement('td');
                cela.textContent = user[i];
                if (i == 3) {
                    if (user[i] < 5) {
                        cela.classList = 'suspes';
                    } else if (user[i] == 5) {
                        cela.classList = 'suficient';
                    } else if (user[i] > 5) {
                        cela.classList = 'aprovat';
                    }
                }
                fila.appendChild(cela);
            }
            //taula.innerHTML += `< td > ${ user[0] }</ ><td>${user[1]}</td><td>${user[2]}</td><td>${user[3]}</td>`;
            taula.appendChild(fila);
        });
        taula.innerHTML += '</tbody>'

    });


    addUserBtn.addEventListener('click', () => {
        store.dispatch({ type: "ADD_USER", nom: userInput.value, curs: "DAW2", modul: "M06", nota: Math.floor(Math.random() * 11) });
    })
}