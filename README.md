# Av Meydanı — Nişan Poligonu

React + Vite ile hazırlanmış, Vercel'e statik olarak deploy edilebilen mini oyun.

## Özellikler
- Canvas üzerinde hareketli geyik hedefi ve farklı mesafe seviyeleri
- Fareyle nişan alıp tıklayarak atış, mermi sayacı ve şarjör yenileme
- Mesafe ve isabet hassasiyetine bağlı puan/oyun içi para ödülü
- Silah mağazası, satın alma ve kuşanma
- Dürbün yakınlaştırma, performans istatistikleri
- İlerleme `localStorage` içinde saklanır; sunucu veya veritabanı gerekmez
- Mobil uyumlu arayüz

## Yerelde çalıştırma
Node.js 18+ önerilir.

```bash
npm install
npm run dev
```

## Build testi
```bash
npm run build
```

## Vercel'e deploy
1. Bu klasörü GitHub'da yeni bir repository'ye yükle.
2. Vercel'de **Add New → Project** seçip repository'yi import et.
3. Framework preset: **Vite** (genellikle otomatik algılanır).
4. Build command: `npm run build`
5. Output directory: `dist`
6. **Deploy** seç.

Vercel için ek environment variable veya backend gerekmiyor. Oyun ilerlemesi kullanıcı tarayıcısına kaydedilir; farklı cihazlar arasında senkronize olmaz.
# copilot-game-studios
