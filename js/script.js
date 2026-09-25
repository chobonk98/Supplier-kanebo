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

/* =================================
   BANNER SLIDER
================================= */

let currentBanner = 0;
let bannerTimer;

function showBanner(index) {
    const slides = document.querySelectorAll(".banner-slide");
    const dots = document.querySelectorAll(".banner-dot");

    if (!slides.length) return;

    if (index >= slides.length) {
        currentBanner = 0;
    } else if (index < 0) {
        currentBanner = slides.length - 1;
    } else {
        currentBanner = index;
    }

    slides.forEach(function (slide) {
        slide.classList.remove("active");
    });

    dots.forEach(function (dot) {
        dot.classList.remove("active");
    });

    slides[currentBanner].classList.add("active");

    if (dots[currentBanner]) {
        dots[currentBanner].classList.add("active");
    }
}

function nextBanner() {
    showBanner(currentBanner + 1);
    resetBannerTimer();
}

function prevBanner() {
    showBanner(currentBanner - 1);
    resetBannerTimer();
}

function resetBannerTimer() {
    clearInterval(bannerTimer);

    bannerTimer = setInterval(function () {
        showBanner(currentBanner + 1);
    }, 5000);
}

document.addEventListener("DOMContentLoaded", function () {
    showBanner(0);
    resetBannerTimer();
});

