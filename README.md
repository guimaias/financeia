# FinanceIA - Gestão Financeira Pessoal

App moderno e minimalista de gestão financeira pessoal com design fintech. Controle receitas, despesas, orçamentos e metas de economia com uma interface simples e intuitiva.

## 📱 Instalação no iPhone

O FinanceIA é uma Progressive Web App (PWA) que funciona como app nativo no seu iPhone.

### Passo 1: Acesse o site (após publicar)
Abra no Safari do seu iPhone: `https://seu-dominio.vercel.app`

### Passo 2: Instale na tela inicial
1. Toque o botão **Compartilhar** (canto inferior)
2. Role para baixo e toque **"Adicionar à Tela Inicial"**
3. Personalize o nome (recomendamos "FinanceIA")
4. Toque **Adicionar**

Pronto! O app aparecerá na sua tela inicial como um ícone.

---

## 🚀 Publicar no Vercel (Gratuito em 5 minutos)

### Opção 1: Usando Git (Recomendado)

1. **Crie uma conta no GitHub** (se não tiver): https://github.com/signup
2. **Crie um repositório novo** e envie este código:
   ```bash
   git init
   git add .
   git commit -m "FinanceIA PWA - inicial"
   git branch -M main
   git remote add origin https://github.com/seu-usuario/financeia.git
   git push -u origin main
   ```

3. **Vá para Vercel** e faça login: https://vercel.com
4. Clique **"New Project"**
5. Selecione o repositório `financeia`
6. Vercel detectará automaticamente que é um projeto Vite
7. Clique **"Deploy"**

Pronto! Seu site estará em `https://financeia.vercel.app` (ou outro nome)

### Opção 2: Sem Git (mais simples)

1. Vá para https://vercel.com/new
2. Selecione **"Other"** ou **"CLI"**
3. Execute no terminal:
   ```bash
   npm install -g vercel
   vercel
   ```
4. Siga as instruções na tela

---

## 💻 Rodar localmente (Desenvolvimento)

### Requisitos:
- Node.js 16+ (download em https://nodejs.org)

### Passos:

```bash
# 1. Entre na pasta
cd pwa-financeia

# 2. Instale as dependências
npm install

# 3. Rode o servidor local
npm run dev
```

O app abrirá em `http://localhost:5173`

---

## 📦 Ícones da PWA

O app vem com ícones placeholder. Para usar ícones personalizados:

1. Crie dois arquivos PNG:
   - `public/icon-192.png` (192x192 pixels)
   - `public/icon-512.png` (512x512 pixels)

2. Adicione também versões "maskable" (para ícones adaptativos do Android):
   - `public/icon-maskable-192.png`
   - `public/icon-maskable-512.png`

**Dica:** Use https://www.favicon-generator.org ou https://realfavicongenerator.net

---

## ✨ Recursos

- ✅ Design moderno inspirado em Nubank/Revolut
- ✅ Adicionar receitas e despesas em segundos
- ✅ Navegação por mês (vê dados passados)
- ✅ Gráficos de gastos por categoria
- ✅ Orçamentos com alertas de limite
- ✅ Metas de economia
- ✅ Modo claro/escuro
- ✅ Funciona 100% offline
- ✅ Exporta dados para CSV
- ✅ Instalável na tela inicial (iOS/Android)

---

## 🔧 Stack Técnico

- **React 18** - Interface reativa
- **Vite** - Build rápido
- **Tailwind CSS** - Estilo responsivo
- **Recharts** - Gráficos
- **Lucide Icons** - Ícones
- **PWA** - Funciona offline

---

## 📝 Licença

Projeto pessoal. Sinta-se livre para usar e modificar conforme desejar.

---

## 🆘 Suporte

Se o app não instalar no iPhone:
1. Verifique que está usando **Safari** (não Chrome)
2. Certifique-se que o site está em **HTTPS** (Vercel usa automaticamente)
3. Tente forçar reload: deslize para baixo na página e solte
4. Se ainda não aparecer o botão "Adicionar à Tela", o manifest.json pode estar com problemas

---

**Feito com ❤️ para gerenciar suas finanças de forma simples.**
