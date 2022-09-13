const morgan = require('morgan');
// mengimport module express
const express = require('express');
// mengimport module express-ejs-layouts
const expressLayouts = require('express-ejs-layouts');
// mengimport fungsi contact yang ada di dalam folder utils
const { loadContact, cekDuplikat, addContact, findContact, updateContact, deleteContact } = require('./utils/contacts');
// mengimport fungsi untuk memvalidasi data
const { body, check, validationResult } = require('express-validator');
// mengimport module untuk memberikan konfirmasi pesan jika berhasil
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
// memasukkan sebuah fungsi express ke variabel app
const app = express();

// menyimpan port
const port = 3000;

app.use(morgan('dev'));
// information using ejs
app.set('view engine', 'ejs');
// information using express-ejs-layouts
app.use(expressLayouts);
// menggunakan middleware untuk mendapatkan data req.body
app.use(express.urlencoded({ extended: false }));
// Konfigurasi flash
app.use(cookieParser('secret'));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());
app.use(express.static('public'));

// membuat route /
app.get('/', (req, res) => {
  // merender file index dan mengirimkan data dengan layout main-layout
  res.render('index', {
    isActive: 'home',
    layout: 'layouts/main-layout',
    title: 'WebServer EJS',
    nama: 'Iwan Plamboyan',
  });
});

// membuat route /about
app.get('/about', (req, res) => {
  // memanggil file about dan mengirimkan data dengan layout main-layout
  res.render('about', {
    isActive: 'about',
    layout: 'layouts/main-layout',
    title: 'about page',
  });
});

// membuat route /contact
app.get('/contact', (req, res) => {
  const contacts = loadContact();
  // memanggil file contact dan mengirimkan data dengan layout main-layout
  res.render('contact', {
    isActive: 'contact',
    layout: 'layouts/main-layout',
    title: 'contact page',
    contacts,
    pesan: req.flash('pesan'),
  });
});

// membuat route /contact
app.get('/contact/add', (req, res) => {
  // merender file add-contact dan mengirimkan data dengan layout main-layout
  res.render('add-contact', {
    isActive: 'contact',
    layout: 'layouts/main-layout',
    title: 'Form Tambah Contact',
  });
});

// membuat route /contact dengan method post
app.post(
  '/contact',
  [
    // cek name jika duplikat
    body('name').custom((value) => {
      const duplikat = cekDuplikat(value);
      if (duplikat) {
        throw new Error('Nama contact sudah digunakan!');
      }
      return true;
    }),
    // cek email
    check('email', 'Email tidak valid!').isEmail(),
    // cek mobile phone
    check('nohp', 'No Hp tidak valid!').isMobilePhone('id-ID'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    // jika ada error maka render file add-contact
    if (!errors.isEmpty()) {
      res.render('add-contact', {
        isActive: 'contact',
        layout: 'layouts/main-layout',
        title: 'Form tambah Contact',
        errors: errors.array(),
      });
    } else {
      // jika tidak ada error maka tambahkan contact yang direquest dan alihkan ke route /contact
      addContact(req.body);
      req.flash('pesan', 'Data contact berhasil ditambahkan!');
      res.redirect('/contact');
    }
  }
);

// membuat route untuk detail contact
app.get('/contact/:name', (req, res) => {
  // masukkan contact jika ditemukkan
  const contact = findContact(req.params.name);

  //   merender file detail dengan mengirimkan beberapa data
  res.render('detail', {
    isActive: 'contact',
    layout: 'layouts/main-layout',
    title: 'Detail Contact',
    contact,
  });
});

// membuat route edit contact
app.get('/contact/edit/:name', (req, res) => {
  // masukkan contact jika ditemukkan
  const contact = findContact(req.params.name);

  //   merender file edit-contact dengan mengrimkan beberapa data
  res.render('edit-contact', {
    isActive: 'contact',
    layout: 'layouts/main-layout',
    title: 'Form Edit Contact',
    contact,
  });
});

// membuat route update dengan method post
app.post(
  '/contact/update',
  [
    // cek name
    body('name').custom((value, { req }) => {
      const duplikat = cekDuplikat(value);
      if (value !== req.body.oldName && duplikat) {
        throw new Error('Nama contact sudah digunakan!');
      }
      return true;
    }),
    // cek email
    check('email', 'Email tidak valid!').isEmail(),
    // cek mobile phone
    check('nohp', 'No Hp tidak valid!').isMobilePhone('id-ID'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    // jika ada error maka render file edit-contact
    if (!errors.isEmpty()) {
      res.render('edit-contact', {
        isActive: 'contact',
        layout: 'layouts/main-layout',
        title: 'Form edit Contact',
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      // jika tidak ada error maka update contact dan alihkan ke route /contact
      updateContact(req.body);
      req.flash('pesan', 'Data contact berhasil diubah!');
      res.redirect('/contact');
    }
  }
);

// membuat route delete contact
app.get('/contact/delete/:name', (req, res) => {
  // masukkan contact jika ditemukkan
  const contact = loadContact(req.params.name);

  //   jika contact tidak ditemukan atau kosong maka kirim pesan 404 page not found
  if (!contact) {
    // menetapkan status code untuk page not found
    res.status(404);
    // mengirim pesan
    res.send('Page not found : 404');
  } else {
    // jika contact ditemukkan maka hapus contact berdasarkan name yang dikirimkan dan alihkan ke route /contact
    deleteContact(req.params.name);
    req.flash('pesan', 'Data contact berhasil dihapus!');
    res.redirect('/contact');
  }
});

// membuat middleware jika mengakses route selain route yang diatas maka page not found
app.use('/', (req, res) => {
  // menetapkan status code untuk page not found
  res.status(404);
  // mengirim pesan
  res.send('Page not found : 404');
});

// menjalankan express di port 3000
app.listen(port, () => {
  // mengirim pesan jika server sudah siap digunakan
  console.log(`Example app listening on port ${port}`);
});
