// Fix: Declare Deno global variable to resolve TypeScript "Cannot find name 'Deno'" errors in non-Deno aware environments
declare const Deno: any;

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.46.1'

// Configurações
const KIWIFY_WEBHOOK_TOKEN = "flftys1ko4w"; // O Token de validação que você criou na Kiwify

Deno.serve(async (req) => {
  // 1. Lidar com preflight do navegador (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    const body = await req.json()
    
    // Log para depuração (visível no painel do Supabase)
    console.log("Webhook recebido da Kiwify:", JSON.stringify(body, null, 2))

    const customerEmail = body.Customer?.email?.toLowerCase().trim()
    const product_id = body.product_id
    const order_status = body.order_status // Ex: approved, refunded, canceled

    // Mapeamento de Planos baseado no que você criou
    // PRO: flftys1ko4w (Token/ID)
    // ELITE: 3k46podrkwi (Token/ID)
    let planToAssign: 'Free' | 'Pro' | 'Elite' = 'Free'
    
    // Verificamos se o nome do produto ou ID contém palavras-chave
    const productName = (body.product_name || "").toUpperCase()
    if (productName.includes("ELITE")) {
      planToAssign = 'Elite'
    } else if (productName.includes("PRO")) {
      planToAssign = 'Pro'
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (order_status === 'paid' || order_status === 'approved') {
      console.log(`Liberando plano ${planToAssign} para ${customerEmail}`)
      const { error } = await supabase
        .from('profiles')
        .update({ plan: planToAssign })
        .eq('email', customerEmail)
      
      if (error) throw error
    } 
    else if (order_status === 'refunded' || order_status === 'canceled' || order_status === 'chargeback') {
      console.log(`Removendo acesso de ${customerEmail}`)
      const { error } = await supabase
        .from('profiles')
        .update({ plan: 'Free' })
        .eq('email', customerEmail)
      
      if (error) throw error
    }

    return new Response(JSON.stringify({ message: "Processado com sucesso" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })

  } catch (err) {
    console.error("Erro no processamento do webhook:", err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    })
  }
})