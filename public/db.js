
let db;
const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB ;
const request = indexedDB.open('budget', 1);


// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', () => {
//       navigator.serviceWorker.register('/service-worker.js')
//         .then((reg) => {
//           console.log('Service worker registered.', reg);
//         });
//     });
//   }
request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function (event) {
    db = event.target.result;

    // checking connection status (on or offline)
    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function (event) {
    console.log("Woops!... you encounter this error:" + event.target.errorCode + "!!!");
};


// Create and submit a transaction on the pending db with function saving,read and write
function saveRecord(record) {

    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    //add a transaction using add method
    store.add(record);
};


function checkDatabase() {
    // looking and access your transaction databases
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(response => {return response.json()})
                .then(() => {
                    //if sucess, will "write" a transaction onto your pending db 
                    const transactions = db.transaction(["pending"], "readwrite");
                    const store = transactions.objectStore("pending");
                    store.clear();
                });
        }
    };
};

// checking for app to come online or not
window.addEventListener("online", checkDatabase);