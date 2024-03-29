window.onload = main;

function main() {

    const reducer = (state = [], action) => {
        console.log("reducer", state, action);
        if (action.type === "ADD_USER") {
            return [...state, action.username];
        };
        return state
    };
    const store = Redux.createStore(reducer);
    const list = document.getElementById('list');
    const addUserBtn = document.getElementById('addUser');
    const userInput = document.getElementById('userInput');

    store.subscribe(() => {
        list.innerHTML = '';
        userInput.value = '';
        store.getState().forEach(user => {
            const li = document.createElement('li');
            li.className = 'list-group-item'
            li.textContent = user;
            list.appendChild(li);
        });
    });


    addUserBtn.addEventListener('click', () => {
        store.dispatch(
            { type: "ADD_USER", username: userInput.value }
        );
    })
} 