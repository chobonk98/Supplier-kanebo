const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const rupiah = n => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n || 0);
async function currentUser(){ const {data:{user}}=await supabaseClient.auth.getUser(); return user; }
async function requireUser(){ const u=await currentUser(); if(!u){ location.href='login.html?next='+encodeURIComponent(location.pathname); return null;} return u; }
async function signOut(){ await supabaseClient.auth.signOut(); location.href='login.html'; }
async function addToCart(productId, quantity=1){
  const u=await requireUser(); if(!u)return;
  const {data:old}=await supabaseClient.from('cart_items').select('id,quantity').eq('user_id',u.id).eq('product_id',productId).maybeSingle();
  const next=(old?.quantity||0)+quantity;
  const {error}=old ? await supabaseClient.from('cart_items').update({quantity:next,updated_at:new Date().toISOString()}).eq('id',old.id) : await supabaseClient.from('cart_items').insert({user_id:u.id,product_id:productId,quantity});
  if(error) throw error;
  alert('Produk masuk ke keranjang.');
}
async function cartCount(){ const u=await currentUser(); if(!u)return 0; const {data}=await supabaseClient.from('cart_items').select('quantity').eq('user_id',u.id); return (data||[]).reduce((a,b)=>a+b.quantity,0); }
window.shop={supabase:supabaseClient,rupiah,currentUser,requireUser,signOut,addToCart,cartCount};
