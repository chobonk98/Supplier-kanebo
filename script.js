```javascript
function toggleMenu() {
    const navbar = document.getElementById("navbar");

    navbar.classList.toggle("active");
}


document.querySelectorAll("#navbar a").forEach(function(link) {

    link.addEventListener("click", function() {

        document
            .getElementById("navbar")
            .classList.remove("active");

    });

});
```
```javascript
function searchProduct() {

    const input = document
        .getElementById("searchProduct")
        .value
        .toLowerCase()
        .trim();

    const products = document
        .querySelectorAll(".catalog-card");

    let found = 0;


    products.forEach(function(product) {

        const text = product
            .textContent
            .toLowerCase();

        if (text.includes(input)) {

            product.style.display = "";

            found++;

        } else {

            product.style.display = "none";

        }

    });


    const noProduct =
        document.getElementById("noProduct");


    if (found === 0) {

        noProduct.style.display = "block";

    } else {

        noProduct.style.display = "none";

    }

}
```
