# İnteraktif Medya Kütüphanesi Projesi
https://sauwebprogramming.github.io/web-tech-project-meleknka/

Merhaba, bu proje Web Teknolojileri dersi ödevim için geliştirdiğim, film, dizi ve kitapları listeleyebileceğimiz interaktif bir web uygulamasıdır.

## Projemi Neden ve Nasıl Geliştirdim?

Bu ödevde amacım, derste öğrendiğim HTML, CSS ve JavaScript bilgilerini pekiştirmek ve herhangi bir hazır kütüphane kullanmadan, yazdığım kodlarla çalışan bir web uygulaması ortaya çıkarmaktı. Projeyi geliştirirken özellikle temiz kod yazmaya ve proje yapısını düzenli tutmaya dikkat ettim.

Uygulamamda herhangi bir sunucu veya veritabanı kullanmadım. Bunun yerine verileri kendi hazırladığım JSON dosyalarından `fetch` yöntemiyle çektim ve kullanıcı etkileşimlerini (favoriye ekleme gibi) tarayıcının LocalStorage özelliğini kullanarak kaydettim.

## Projemdeki Özellikler

Hocamın belirttiği tüm zorunlu gereksinimleri yerine getirdim ve üzerine kendi merak ettiğim bazı ekstra özellikleri de eklemeye çalıştım.

### Yerine Getirdiğim Zorunlu Gereksinimler
- **Dinamik Sayfa Yapısı**: Sayfalar arası geçişlerde içerik dinamik olarak değişiyor. Detayları bir "Modal" (pencere) içinde gösterdim.
- **Veri Çekme**: Film, dizi ve kitap verilerini `data` klasöründeki JSON dosyalarından asenkron olarak (Async/Await ile) çekiyorum.
- **Responsive Tasarım**: Tasarımı yaparken Flexbox ve CSS Grid kullandım. Telefon, tablet ve bilgisayarda düzgün görünüyor.
- **Arama ve Filtreleme**:
  - Aradığınız bir eseri isminden bulabilirsiniz.
  - Türüne, yılına, yönetmenine veya puanına göre filtreleyebilirsiniz.
- **Sıralama**: İsterseniz puana göre veya isme göre sıralama yapabilirsiniz.
- **Favori Sistemi**: Beğendiğiniz eserleri kalbe tıklayarak favorilerinize ekleyebilirsiniz. Sayfayı yenileseniz bile silinmezler.

### Eklediğim Bonus Özellikler
Ödevden ekstra puan alabilmek ve kendimi geliştirmek için şunları da ekledim:
- **PWA (Uygulama Gibi Çalışma)**: Projeme Service Worker ekledim. Bu sayede internet kesilse bile uygulama (önbellekten) çalışmaya devam ediyor ve telefona uygulama gibi kurulabiliyor.
- **Tema Seçeneği**: Göz yormaması için Gece Modu (Dark Mode) ekledim.
- **Sohbet Botu (Öneri)**: "Ne izlesem?" diye düşünenler için basit bir öneri robotu yaptım. Size rastgele film veya kitap öneriyor.
- **Modern Arayüz**: Tasarımı yaparken modern CSS teknikleri (Glassmorphism gibi) kullanmaya özen gösterdim.

## Kullandığım Teknolojiler

- **HTML5**: Sayfa iskeletini oluşturmak için.
- **CSS3**: Sayfayı güzelleştirmek ve responsive yapmak için.
- **JavaScript (ES6+)**: Tüm mantıksal işlemler, veri çekme ve tıklama olayları için.

## Proje Dosyalarım

Dosya düzenim şu şekildedir:

```
Web-Teknolojileri/
│
├── css/
│   └── style.css          # Yazdığım CSS kodları
│
├── data/                  # Kullandığım JSON verileri
│   ├── movies.json
│   ├── series.json
│   └── books.json
│
├── js/                    # JavaScript dosyalarım
│   ├── main.js            # Ana kontrol dosyası
│   ├── data.js            # Verileri çektiğim yer
│   ├── ui.js              # Ekran işlemlerini yapan kodlar
│   └── suggestion.js      # Öneri botunun kodları
│
├── img/                   # Kullandığım resimler
├── index.html             # Ana sayfa
├── sw.js                  # PWA için Service Worker dosyası
└── README.md              # Bu okuduğunuz dosya
```


MELEK NUR KAYA

B241200017
