import { createClient } from 'npm:@supabase/supabase-js@2'

const cors = { 'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json' }
const json=(x:any,s=200)=>new Response(JSON.stringify(x),{status:s,headers:cors})

Deno.serve(async req=>{
  if(req.method==='OPTIONS') return new Response('ok',{headers:cors})
  try{
    const auth=req.headers.get('Authorization')||''
    if(!auth.startsWith('Bearer ')) return json({message:'Login diperlukan.'},401)
    const supabase=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:auth}}})
    const {data:{user},error:ue}=await supabase.auth.getUser()
    if(ue||!user) return json({message:'Sesi login tidak valid.'},401)
    const body=await req.json()
    const {customer_name,phone,address,notes='',shipping=0}=body
    if(!customer_name||!phone||!address) return json({message:'Nama, nomor HP dan alamat wajib diisi.'},400)
    const {data:cart,error:ce}=await supabase.from('cart_items').select('id,quantity,product_id,store_products(id,name,price,stock,active)').eq('user_id',user.id)
    if(ce) throw ce
    if(!cart?.length) return json({message:'Keranjang kosong.'},400)
    for(const x of cart){ if(!x.store_products?.active || x.quantity>x.store_products.stock) return json({message:`Stok tidak cukup: ${x.store_products?.name||'produk'}`},400) }
    const subtotal=cart.reduce((a,x)=>a+x.store_products.price*x.quantity,0)
    const total=subtotal+Math.max(0,Number(shipping)||0)
    const orderNumber='KBN-'+Date.now()+'-'+crypto.randomUUID().slice(0,6).toUpperCase()
    const {data:order,error:oe}=await supabase.from('orders').insert({user_id:user.id,order_number:orderNumber,customer_name,phone,address,notes,subtotal,shipping:Math.max(0,Number(shipping)||0),total}).select().single()
    if(oe) throw oe
    const rows=cart.map(x=>({order_id:order.id,product_id:x.product_id,product_name:x.store_products.name,price:x.store_products.price,quantity:x.quantity,subtotal:x.store_products.price*x.quantity}))
    const {error:ie}=await supabase.from('order_items').insert(rows); if(ie) throw ie
    const serverKey=Deno.env.get('MIDTRANS_SERVER_KEY'); if(!serverKey) return json({message:'MIDTRANS_SERVER_KEY belum diatur di Edge Function.'},500)
    const authHeader='Basic '+btoa(serverKey+':')
    const r=await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions',{method:'POST',headers:{accept:'application/json','content-type':'application/json',authorization:authHeader},body:JSON.stringify({transaction_details:{order_id:orderNumber,gross_amount:total},customer_details:{first_name:customer_name,email:user.email||'',phone}})})
    const mid=await r.json()
    if(!r.ok) return json({message:'Midtrans menolak transaksi.',detail:mid},502)
    await supabase.from('orders').update({midtrans_token:mid.token,updated_at:new Date().toISOString()}).eq('id',order.id)
    await supabase.from('cart_items').delete().eq('user_id',user.id)
    return json({ok:true,order_id:order.id,order_number:orderNumber,token:mid.token})
  }catch(e){ return json({message:e?.message||String(e)},500) }
})
