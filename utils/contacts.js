// mengimport core module filesystem
const fs = require('fs');

// jika tidak folder data maka buat foldernya
if (!fs.existsSync('./data')) {
  fs.mkdirSync('data');
}

// jika tidak ada file contacts.json didalam data maka buat filenya dan tuliskan array kosong
if (!fs.existsSync('./data/contacts.json')) {
  fs.writeFileSync('data/contacts.json', '[]');
}

// fungsi untuk membaca contacts.json
const loadContact = () => {
  const file = fs.readFileSync('data/contacts.json', 'utf8');
  return (contacts = JSON.parse(file));
};

// fungsi untuk menemukan contact berdasarkan nama yang dikirimkan dari parameter
const findContact = (name) => {
  const contacts = loadContact();
  return contacts.find((contact) => contact.name.toLowerCase() === name.toLowerCase());
};

// fungsi untuk menyimpan contacts ke dalam file contacts.json
const saveContacts = (contacts) => {
  fs.writeFileSync('data/contacts.json', JSON.stringify(contacts));
};

// fungsi untuk menambahkan contact dan menyimpan langsung kedalam file contacts.json
const addContact = (contact) => {
  const contacts = loadContact();
  contacts.push(contact);
  saveContacts(contacts);
};

// fungsi untuk cek name jika duplikat
const cekDuplikat = (name) => {
  const contacts = loadContact();
  return contacts.find((contact) => contact.name === name);
};

// fungsi menghapus contact berdasarkan name yang dikirimkan dari parameter
const deleteContact = (name) => {
  const contacts = loadContact();
  const filteredContacts = contacts.filter((contact) => contact.name !== name);
  saveContacts(filteredContacts);
};

// fungsi untuk mengupdate contact
const updateContact = (newContact) => {
  const contacts = loadContact();
  const filteredContacts = contacts.filter((contact) => contact.name !== newContact.oldName);
  delete newContact.oldName;
  filteredContacts.push(newContact);
  saveContacts(filteredContacts);
};

// mengexport fungsi untuk digunakan dibeberapa file
module.exports = { loadContact, findContact, addContact, cekDuplikat, deleteContact, updateContact };
