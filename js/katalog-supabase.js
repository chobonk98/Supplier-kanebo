(function () {
    const grid = document.getElementById("catalogGrid");
    if (!grid || typeof SUPABASE_URL === "undefined" || typeof SUPABASE_ANON_KEY === "undefined") return;
    if (!SUPABASE_URL || SUPABASE_URL.includes("ISI_") || !SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes("ISI_")) return;
    if (!window.supabase) return;

    const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    async function loadProducts() {
        const { data, error } = await sb
            .from("produk")
            .select("id,gambar,deskripsi,created_at")
            .order("created_at", { ascending: false });

        if (error || !Array.isArray(data) || data.length === 0) return;

        data.forEach(function (item) {
            const card = document.createElement("article");
            card.className = "catalog-card dynamic-product";
            card.dataset.search = (item.deskripsi || "").toLowerCase();
            card.innerHTML = `
                <div class="catalog-image">
                    <img src="${escapeHtml(item.gambar)}"
     alt="Produk Kanebo"
     loading="lazy"
     onclick="openImage(this.src, this.alt)">
                    <span class="product-label">Produk</span>
                </div>
                <div class="catalog-info">
                    <h3>Produk Kanebo</h3>
                    <p>${escapeHtml(item.deskripsi)}</p>
                    <div class="product-meta"><span>✓ Berkualitas</span><span>✓ Grosir</span></div>
                    <a href="kontak.html" class="product-btn">Tanya Produk</a>
                </div>`;
            grid.insertBefore(card, grid.firstChild);
        });
    }

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>'"]/g, function (char) {
            return {"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[char];
        });
    }

    loadProducts();
})();
