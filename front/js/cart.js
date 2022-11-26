// values of inputs //
let firstname = "";
let lastname = "";
let address = "";
let city = "";

// Letters and accentued letters //
const regexName = new RegExp(/^[A-zÀ-ú-]*$/);
// Letters, accentued letters, numbers, "-", "&" and space
const regexAddress = new RegExp(/^[A-zÀ-ú0-9-&\s]*$/);
// Letters, accentued letters, "-", "&" and space
const regexCity = new RegExp(/^[A-zÀ-ú-&\s]*$/);
// 3 tokens split by specific char //
const regexMail = new RegExp(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/)


// validity of inputs //
let validFirstname = false;
let validLastname = false;
let validAddress = false;
let validCity = false;
let validEmail = false;

renderCart();
getValuesFromInputs();
