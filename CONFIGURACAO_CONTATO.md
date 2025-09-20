# 📧 Como Configurar o Sistema de Contato (EmailJS)

## 🚀 Configuração Rápida (5 minutos)

### 1. Criar Conta no EmailJS
1. Acesse: https://www.emailjs.com/
2. Clique em **Sign Up** e crie uma conta gratuita
3. Confirme seu email

### 2. Configurar Serviço de Email
1. No dashboard, clique em **Email Services**
2. Clique em **Add New Service**
3. Escolha **Gmail** (mais fácil)
4. Conecte sua conta Gmail
5. Anote o **Service ID** (ex: service_abc123)

### 3. Criar Template de Email
1. Vá em **Email Templates**
2. Clique em **Create New Template**
3. Use este template:

```
Assunto: {{subject}} - Contato SuperMarket

Olá SuperMarket!

Você recebeu uma nova mensagem através do site:

Nome: {{from_name}}
Email: {{from_email}}
Telefone: {{from_phone}}
Assunto: {{subject}}

Mensagem:
{{message}}

---
Enviado pelo site SuperMarket em {{date}}
```

4. Anote o **Template ID** (ex: template_xyz789)

### 4. Configurar no Site
1. Abra o arquivo `index.html`
2. Procure por estas linhas:
```javascript
emailjs.init("YOUR_PUBLIC_KEY"); // Linha ~1610
emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams) // Linha ~1660
```

3. Substitua:
   - `YOUR_PUBLIC_KEY` pela sua Public Key (encontre em Account > API Keys)
   - `YOUR_SERVICE_ID` pelo Service ID do passo 2
   - `YOUR_TEMPLATE_ID` pelo Template ID do passo 3

### 5. Testar
1. Abra seu site
2. Preencha o formulário "Fale com a Gente"
3. Envie uma mensagem de teste
4. Verifique se chegou no seu email

## 📊 Funcionalidades do Sistema

### ✅ O que o sistema faz:
- 📧 Envia emails diretamente para você
- 💾 Salva dados localmente como backup
- 📱 Fallback automático para WhatsApp se falhar
- 🎯 Categoriza mensagens por assunto
- ✨ Interface bonita e responsiva
- ⚡ Validação de formulário

### 📈 Dados Coletados:
- Nome do cliente
- Email
- Telefone/WhatsApp
- Assunto da mensagem
- Mensagem completa
- Data/hora do envio

### 🔄 Sistema de Backup:
Se o EmailJS falhar, o sistema:
1. Salva os dados no navegador (localStorage)
2. Abre automaticamente o WhatsApp com a mensagem
3. Cliente não perde os dados digitados

## 🎯 Benefícios para seu Negócio

- **Organização**: Todas as mensagens chegam no seu email
- **Profissionalismo**: Formulário bonito e funcional
- **Backup**: Nunca perde uma mensagem de cliente
- **Móvel**: Funciona perfeitamente no celular
- **Gratuito**: EmailJS oferece 200 emails grátis/mês

## ⚙️ Configuração Alternativa (Google Sheets)

Se preferir salvar em planilha:
1. Crie uma planilha no Google Sheets
2. Use Google Apps Script
3. Configure webhook para receber dados

## 🆘 Suporte

Se precisar de ajuda, me chame que configuro para você!

---
**Lembre-se**: Teste sempre antes de usar em produção! 🧪