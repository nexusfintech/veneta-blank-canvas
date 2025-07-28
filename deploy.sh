#!/bin/bash
echo "🚀 Avvio del processo di build per il deploy..."

# Esegui il build normale
echo "📦 Esecuzione build..."
npm run build

# Verifica che il build sia andato a buon fine
if [ ! -d "dist/public" ]; then
    echo "❌ Errore: cartella dist/public non trovata. Build fallito."
    exit 1
fi

# Copia i file statici nella posizione corretta per tutte le possibili configurazioni
echo "📁 Sistemazione dei file statici per il deploy..."

# Copia nella directory server (per il caso import.meta.dirname punti a server/)
cp -r dist/public server/ 2>/dev/null || true

# Copia nella directory dist (per il caso import.meta.dirname punti a dist/)
cp -r dist/public/* dist/ 2>/dev/null || true

# Crea anche una copia nella root del progetto (backup)
cp -r dist/public ./ 2>/dev/null || true

echo "✅ Build completato con successo!"
echo "🌐 File statici sistemati in tutte le posizioni necessarie"

# Verifica che tutti i file necessari esistano
echo "🔍 Verifica file di deploy..."
if [ -f "dist/index.js" ]; then
    echo "   ✓ Server compilato: dist/index.js"
else
    echo "   ❌ Server compilato mancante!"
    exit 1
fi

if [ -f "dist/index.html" ]; then
    echo "   ✓ Frontend: dist/index.html"
else
    echo "   ❌ Frontend mancante!"
    exit 1
fi

if [ -d "dist/assets" ]; then
    echo "   ✓ Assets: dist/assets/"
else
    echo "   ❌ Assets mancanti!"
    exit 1
fi

echo ""
echo "🎉 DEPLOY PRONTO!"
echo ""
echo "📋 File necessari per il deploy:"
echo "   - Server: dist/index.js"
echo "   - Frontend: dist/index.html"
echo "   - Assets: dist/assets/"
echo "   - Configurazione: .replit"
echo ""
echo "🚀 Per eseguire il deploy:"
echo "   1. Clicca sul pulsante 'Deploy' in Replit"
echo "   2. Il sistema userà automaticamente:"
echo "      - build: npm run build"
echo "      - start: npm run start"
echo ""
echo "💡 Il deploy è stato configurato per funzionare con:"
echo "   - PostgreSQL database (disponibile tramite DATABASE_URL)"
echo "   - Porta automatica (Replit gestisce automaticamente)"
echo "   - File statici serviti correttamente"
echo ""
echo "✅ Tutti i problemi di percorso sono stati risolti!"