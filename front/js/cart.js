let firstname = "";
let lastname = "";
let address = "";
let city = "";

// only letter and space //
const regexName = new RegExp(/^[A-zÀ-ú-]*$/);
const regexAddress = new RegExp(/^[A-zÀ-ú0-9-&\s]*$/);
const regexCity = new RegExp(/^[A-zÀ-ú-&\s]*$/);
const regexMail = new RegExp(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/)



let validFirstname = false;
let validLastname = false;
let validAddress = false;
let validCity = false;
let validEmail = false;

renderCart();
getValuesFromInputs();
