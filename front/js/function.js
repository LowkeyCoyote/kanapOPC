let id = "";
let protocole = 'http';
let domain = 'localhost:3000';

let ApiUrl = `${protocole}://${domain}/api/products/${id}`;


/*
    get Products
    Launch an HTTP request and return a JSON
    @param : url (string) : URL for the request
    return response request (JSON)
 */

async function getProducts(url) {
    try {
        let res = await fetch(url);
        return await res.json();
    }

    catch(error){
        console.log(error);
    }
}


async function getProductInfo(){

    await getIdFromUrl();
    ApiUrl = `${protocole}://${domain}/api/products/${id}`;

    return await getProducts(ApiUrl);
}



/*
    renderProducts (void)
    used in index.js
    create one HTML section for each product
    each section has specific information
 */

async function renderProducts() {
    let products = await getProducts(ApiUrl);
    let html = '';


    products.forEach(product =>{
        let htmlProduct = `
        <a href="./product.html?id=${product._id}">
            <article>
              <img src="${product.imageUrl}" alt="${product.altTxt}">
              <h3 class="productName">${product.name}</h3>
              <p class="productDescription">${product.description}</p>
            </article>
          </a>`;

        html += htmlProduct;
    })

    let items = document.querySelector(".items");
    items.innerHTML = html;
}

async function getIdFromUrl(){
    const str = window.location.href;
    const urlProduct = new URL(str);
    id = urlProduct.searchParams.get("id");
}


/*
    renderProduct (void)
    used in product.js

    create multiple HTML element in product page
    informations are specifics for each page
    param
    return à remplir
 */

async function renderProduct() {

    await getIdFromUrl();
    ApiUrl = `${protocole}://${domain}/api/products/${id}`;

    let product = await getProducts(ApiUrl);
    console.log(ApiUrl);


    let titlePage = document.querySelector('title');
    titlePage.textContent = product.name;

    let titleProduct = document.querySelector('#title');
    titleProduct.textContent = product.name;

    let priceProduct = document.querySelector('#price');
    priceProduct.textContent = product.price;

    let img = document.querySelector('.item__img');
    img.innerHTML = `<img src="${product.imageUrl}" alt="${product.altTxt}">`;

    let textDescription = document.querySelector('#description');
    textDescription.textContent = product.description;


    let htmlColors = "";
    product.colors.forEach(color => {
        let htmlColor = `<option value="${color}">${color}</option>`
        htmlColors += htmlColor;
    })

    let colorChoice = document.querySelector('#colors');
    colorChoice.innerHTML = htmlColors;
}


/*
    saveCart (void)
    used in checkIfProductExistInCart()
    @param : cart (JSON), objets present in cart
    save cart in string format in localstorage
 */

function saveCart(cart){
    localStorage.setItem("cart", JSON.stringify(cart));
}

/*
    getCart : return an empty array if cart in localstorage is empty
              return an JSON of the cart 
*/

function getCart(){
    let cart  = localStorage.getItem("cart");
    if( cart == null){
        return [];
    }
    else{
        return JSON.parse(cart);
    }
}

/*
    addProductInCart : add product in cart
    get informations about the product selected
    than check if this product is already present in cart in localstorage (chcheckIfProductExistInCartek)
*/


async function addProductInCart(){

    let AddingButton = document.querySelector("#addToCart");
    let quantityProduct = document.getElementById('quantity');
    let colorProduct = document.querySelector("#colors");
    let productInfo =  await getProductInfo();


    AddingButton.addEventListener('click', e => {
        e.preventDefault()

        let product = {
            idProduct : id,
            colorProduct : colorProduct.value,
            quantity : parseInt(quantityProduct.value),
            priceProduct : productInfo.price,
            altTxtProduct : productInfo.altTxt,
            imgProduct : productInfo.imageUrl,
            nameProduct : productInfo.name
        }

        if(quantityProduct.value > 100){
            alert("Vous ne pouvez pas commander plus de 100 canapés à la fois")
        }
        else{
            checkIfProductExistInCart(product, parseInt(quantityProduct.value));
            window.location.replace('file:///Users/joska/Downloads/P5-Dev-Web-Kanap-master/front/html/cart.html')
        }

        
    })
}

/*
    checkIfProductExistInCart : get the cart in localstorage,
                                then check if the product that we are adding is already present in cart
                                if he is present, add quantity
                                if he is not present push product
                                save cart
    @param : product (object), containing all the informations about the product
*/


async function checkIfProductExistInCart(product){

    let cart = getCart();

    let foundProduct = cart.find(p => (p.idProduct === product.idProduct && p.colorProduct === product.colorProduct));

    if(foundProduct !== undefined){
        foundProduct.quantity += product.quantity;
    }else{
        cart.push(product);
    }
    saveCart(cart);
    await getProductInfo();
}

/*
    renderCart() : for each different product present in cart, create an HTML section 
                    with spécific informations about the product

*/

async function renderCart(){

    let cart = await getCart();
    let html = "";

    cart.forEach(p => {
        let htmlProduct = `      
        <article class="cart__item" data-id="${p.idProduct}" data-color="${p.colorProduct}">
                <div class="cart__item__img">
                  <img src="${p.imgProduct}" alt="${p.altTxtProduct}">
                </div>
                <div class="cart__item__content">
                  <div class="cart__item__content__description">
                    <h2>${p.nameProduct}</h2>
                    <p>${p.colorProduct}</p>
                    <p>${p.priceProduct} €</p>
                  </div>
                  <div class="cart__item__content__settings">
                    <div class="cart__item__content__settings__quantity">
                      <p>Qté : </p>
                      <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${p.quantity}">
                    </div>
                    <div class="cart__item__content__settings__delete">
                      <p class="deleteItem">Supprimer</p>
                    </div>
                  </div>
                </div>
              </article>`;

        html += htmlProduct;
    })

    let itemsInCart = document.querySelector("#cart__items");
    itemsInCart.innerHTML = html;

    modifyQuantityFromCart();
    supressItemFromCart();
    validateOrder();

    await getTotalPrice();
    
}

/*
    supressItemFromCart() : add event on all delete button present in cart page
                            on click check the closet itemId and itemColor (color and id of the selected product)
                            then call delete from cart 
                            and remove HTML section

*/

async function supressItemFromCart(){
    document.querySelectorAll(".cart__item__content__settings__delete").forEach((el) => {
        el.addEventListener('click', (e) => {
            console.log(el);
            e.preventDefault();
            let itemId =  el.closest("article").dataset.id;
            let itemColor = el.closest("article").dataset.color;

            deleteFromCart(itemId, itemColor);

            el.closest("article").remove();

            renderCart();
        })
    })
}

/*
    deleteFromCart() : change quantity of a product in cart 
    @param : 
    id = id of the product
    color = color of the product
*/

async function deleteFromCart(id, color){
    let cart = getCart();

    let itemToDelete = cart.findIndex((p) => (p.idProduct === id && p.colorProduct === color));


    cart.splice(itemToDelete, 1);

    saveCart(cart);

    await getTotalPrice();
}


/*
    modifyQuantityFromCart() : add event on change of quantity input
                                check the closet itemId and itemColor (color and id of the selected product)
                                then call modifyQuantityCart

*/

async function modifyQuantityFromCart(){
    document.querySelectorAll(".itemQuantity").forEach((el) => {
        el.addEventListener('input', (e) => {

            e.preventDefault();

            let itemId =  el.closest("article").dataset.id;
            let itemColor = el.closest("article").dataset.color;
            let itemQuantity = el.value;

            modifyQuantityCart(itemId, itemColor, itemQuantity);

        })
    })
}


/*
    modifyQuantityCart() : change quantity of a product in cart 
    @param : 
    id = id of the product
    color = color of the product
    quantity = new quantity of the product
*/

async function modifyQuantityCart(id, color, quantity){
    let cart = getCart();

    let itemToModify = cart.findIndex((p) => (p.idProduct === id && p.colorProduct === color));

    cart[itemToModify].quantity = parseInt(quantity);

    saveCart(cart);
    await getTotalPrice();


}



/*
    getTotalPrice() : change quantity of a product in cart 
    @param : get cart, then loop and add priceUnit * quantity
    change dynamically price
*/

async function getTotalPrice(){
    let cart = getCart();
    let totalPrice = 0;
    let totalQuantity = 0;

    cart.forEach(e => {
        totalPrice += e.quantity * e.priceProduct;
        totalQuantity += e.quantity;
    })

    document.querySelector('#totalQuantity').innerHTML = totalQuantity;
    document.querySelector('#totalPrice').innerHTML = totalPrice;
}




/*
    getValuesFromInputs() (void) : get values from inputs

    add an event (on keyup) for each input in cart page
    then retrieve value in the input and use checkInputs()
    
*/

async function getValuesFromInputs(){

    let firstnameInput = document.querySelector("#firstName")

    firstnameInput.addEventListener('keyup', e => {
        checkInputs(firstnameInput.value, 'firstname');
    })

    let lastnameInput = document.querySelector("#lastName")

    lastnameInput.addEventListener('keyup', e => {
        checkInputs(lastnameInput.value, 'lastname');
    })

    let addressInput = document.querySelector("#address")

    addressInput.addEventListener('keyup', e => {
        checkInputs(addressInput.value, 'address');
    })

    let cityInput = document.querySelector("#city")

    cityInput.addEventListener('keyup', e => {
        checkInputs(cityInput.value, 'city');
    })

    let emailInput = document.querySelector("#email")

    emailInput.addEventListener('keyup', e => {
        checkInputs(emailInput.value, 'email');
    })
}



/*
    checkInputs(input, type) : check validity of the inputs
    @param input : {string} value of the input
    @param type : {string} type of the input (name, city, ...)

    test each value with specific regex present in cart.js

    
*/


// une fonction par type switch 

async function checkInputs(input, type){

    switch(type){
        case 'firstname' :

            let firstnameMessage = document.querySelector("#firstNameErrorMsg");

            if(regexName.test(input)){
                validFirstname = true;
                firstnameMessage.innerHTML = "";
            }
            else{
                validFirstname = false;
                firstnameMessage.innerHTML = "Votre prénom est incorrect";
            }
            break;

        case 'lastname' : 

            let lastnameMessage = document.querySelector("#lastNameErrorMsg");

            if(regexName.test(input)){
                validLastname = true;
                lastnameMessage.innerHTML = "";
            }
            else{
                validLastname = false;
                lastnameMessage.innerHTML = "Votre nom est incorrect";
            }
            break;

        case 'address' : 

            let addressMessage = document.querySelector("#addressErrorMsg");

            if(regexAddress.test(input)){
                validAddress = true;
                addressMessage.innerHTML = ""
            }
            else{
                validAddress = false;
                addressMessage.innerHTML = "Votre adresse est incorrecte";
            }
            break;

        case 'city' : 

            let cityMessage = document.querySelector("#cityErrorMsg");

            if(regexCity.test(input)){
                validCity = true;
                cityMessage.innerHTML = "";
            }
            else{
                validCity = false;
                cityMessage.innerHTML = "Votre ville est incorrecte";
            }
            break;

        case 'email' : 
            let emailMessage = document.querySelector('#emailErrorMsg');

            if(regexMail.test(input)){
                validEmail = true;
                emailMessage.innerHTML = "";
            }
            else{
                validEmail = false;
                emailMessage.innerHTML = "Votre email est incorrect";
            }
            break;
    }

    
}
/*
    validateOrder() : (void) valid order
    if all the inputs are valids
    send a request (orderRequest())
*/

async function validateOrder(){

    let buttonValidate = document.querySelector('#order');

    
    buttonValidate.addEventListener('click', e => {
        e.preventDefault();

        if(validFirstname && validLastname && validAddress && validCity && validEmail){

            orderRequest();
        }
        else{
            alert('Les champs n\'ont pas été correctement remplis')
        }
    
    })
}
/*
    getContactInfo() : 
    @return contact object with informations about the client

*/

async function getContactInfo(){

    let contact = {
        firstName : document.querySelector("#firstName").value,
        lastName : document.querySelector("#lastName").value,
        address : document.querySelector("#address").value,
        city : document.querySelector("#city").value,
        email : document.querySelector("#email").value,
    }

    return contact;
}

/*
    getArrayProduct() : 
    return an array of productId
    present in localstorage
*/

async function getArrayProduct(){
    let cart = getCart();
    
    let arrayProductId = [];

    cart.forEach(p => { 
        arrayProductId.push(p.idProduct);
    })

    return arrayProductId;
}

    /*
        orderRequest() : 
        Send a POST request
        BodyRequest object with array of productId and contact object
    */

async function orderRequest(){


    let contact = await getContactInfo();
    let products = await getArrayProduct();

    let ApiUrl = `${protocole}://${domain}/api/products/order`;

    let bodyRequest = JSON.stringify({contact, products});


    fetch(ApiUrl, {
        method : "POST",
        headers: {
            "Content-Type": "application/json",
          },
          body : bodyRequest,
    })

    .then((res) => res.json())
    .then((data) =>  {
        let confirmationUrl = "./confirmation.html?id=" + data.orderId;
        window.location.href = confirmationUrl;
        console.log(data);
    })
    .catch(() => {
        alert("Une erreur est survenue, merci de revenir plus tard.");
      }); 
}


async function showOrder(){
    const str = window.location.href;
    const urlOrder = new URL(str);


    id = urlOrder.searchParams.get("id");
    let orderNumber = document.querySelector("#orderId");
    orderNumber.innerHTML = id;
}












