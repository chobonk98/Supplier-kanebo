import { createClient } from 'npm:@supabase/supabase-js@2'
const json=(x:any,s=200)=>new Response(JSON.stringify(x),{status:s,headers:{'Content-Type':'application/json'}})
async function sha512(s:string){const d=new TextEncoder().encode(s);const h=await crypto.subtle.digest('SHA-512',d);return [...new Uint8Array(h)].map(b=>b.toString(16).padStart(2,'0')).join('')}
Deno.serve(async req=>{
 try{
  const body=await req.json();
  const key=Deno.env.get('MIDTRANS_SERVER_KEY')!;
  const valid=await sha512(String(body.order_id)+String(body.status_code)+String(body.gross_amount)+key);
  if(valid!==body.signature_key) return json({message:'Invalid signature'},401)
  const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  let payment='pending', status='pending_payment';
  if(body.transaction_status==='settlement'||body.transaction_status==='capture'){payment='paid';status='paid'}
  else if(body.transaction_status==='expire'){payment='expired';status='cancelled'}
  else if(body.transaction_status==='cancel'||body.transaction_status==='deny'){payment='failed';status='cancelled'}
  const {data:order}=await admin.from('orders').select('id,user_id,total,payment_status').eq('order_number',body.order_id).maybeSingle();
  if(!order) return json({ok:true,message:'Order not found; ignored'})
  await admin.from('orders').update({payment_status:payment,status,midtrans_transaction_id:body.transaction_id,updated_at:new Date().toISOString()}).eq('id',order.id)
  return json({ok:true})
 }catch(e){return json({message:e?.message||String(e)},500)}
})
