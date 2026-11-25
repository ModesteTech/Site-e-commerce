// GERER LES CATEGORIE ET LES RECHERCHES
const carts=document.querySelectorAll(".product-card");
const products=[];
const noResults=document.querySelector("#no-results");

carts.forEach(function(card){
    const product={
        id:card.dataset.id,
        category:card.dataset.category,
        name:card.querySelector(".product-card__title").textContent.trim(), //textcont lie le text a l'interieur
        price:card.querySelector(".product-card__price").textContent.trim(),// trim() supprimes les espaces en debut et en fin
    };
    products.push(product); // ajoute a la fin du tableau
    // console.log("Le nom de l'article est : ",product.name);
})

console.log(products);
// console.log("Le nom de l'article est : ",product[0].name);
const categorySelect=document.querySelector("#category-select");
const cards=document.querySelectorAll(".product-card");
const searchInput=document.querySelector("#search-input");

function filterProducts(){
    let visiblecount=0;
    const selectedCategory=categorySelect.value;
    const searchText=searchInput.value.toLowerCase().trim();

    cards.forEach(function(card){
        const productCategory=card.dataset.category;
        const productName=card.querySelector(".product-card__title").textContent.toLowerCase();
        const matchesCategory=selectedCategory==="all" || productCategory===selectedCategory;
        const matchesSearch=productName.includes(searchText);
        if (matchesCategory && matchesSearch){
            card.classList.remove("hidden");
            visiblecount++;
        }else{
            card.classList.add("hidden");
        }
    });

    if(visiblecount===0){
        noResults.classList.remove('hidden');
    }
}
categorySelect.addEventListener('change', filterProducts);
searchInput.addEventListener('input',filterProducts);

// GERER LE PANIER

const addToCartButtons=document.querySelectorAll(".add-to-cart");
const cartCount=document.querySelector("#cart-count");
let cart=0;
addToCartButtons.forEach(function(button){
    button.addEventListener("click",function(){
        cart++;
        cartCount.textContent=cart;
    });
});