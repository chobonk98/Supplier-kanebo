function toggleMenu() {
    const navbar = document.getElementById("navbar");

    if (navbar) {
        navbar.classList.toggle("active");
    }
}

document.querySelectorAll("#navbar a").forEach(function(link) {
    link.addEventListener("click", function() {
        const navbar = document.getElementById("navbar");

        if (navbar) {
            navbar.classList.remove("active");
        }
    });
});

function searchProduct() {
    const inputElement = document.getElementById("searchProduct");
    const noProduct = document.getElementById("noProduct");

    if (!inputElement) return;

    const input = inputElement.value.toLowerCase().trim();
    const products = document.querySelectorAll(".catalog-card");

    let found = 0;

    products.forEach(function(product) {
        const text = product.textContent.toLowerCase();

        if (text.includes(input)) {
            product.style.display = "";
            found++;
        } else {
            product.style.display = "none";
        }
    });

    if (noProduct) {
        noProduct.style.display = found === 0 ? "block" : "none";
    }
}
