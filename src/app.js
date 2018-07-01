import './assets/scss/app.scss';
import './assets/js/forge-sha256';

/*
 * Inspired on https://ss64.com/pass/
 */

/*
 * The sites to display.
 * You can edit this to customise the page,
 * to include another website just add an extra line:
 */

const sitios = [
  { service: 'cpanel', url: '', displayName: 'cPanel' },
  { service: 'github', url: 'https://github.com/github', displayName: 'GitHub' },
  { service: 'bitbucket', url: 'https://bitbucket.org/account/signin/', displayName: 'Bitbucket' },
  { service: 'amazon', url: 'https://www.amazon.com/', displayName: 'Amazon' },
  { service: 'adobe', url: 'https://accounts.adobe.com/', displayName: 'Adobe' },
  { service: 'apple', url: 'https://www.apple.com/', displayName: 'Apple' },
  { service: 'dropbox', url: 'https://www.dropbox.com/login', displayName: 'Dropbox' },
  { service: 'ebay', url: 'https://signin.ebay.com/', displayName: 'Ebay' },
  { service: 'facebook', url: 'https://www.facebook.com/', displayName: 'Facebook' },
  { service: 'google', url: 'https://www.google.com/', displayName: 'Google' },
  { service: 'linkedin', url: 'https://www.linkedin.com/', displayName: 'LinkedIn' },
  { service: 'paypal', url: 'https://www.paypal.com/', displayName: 'PayPal' },
  { service: 'tumblr', url: 'https://www.tumblr.com/', displayName: 'Tumblr' },
  { service: 'twitter', url: 'https://twitter.com/', displayName: 'Twitter' },
  { service: 'wikipedia', url: 'https://www.wikipedia.org/', displayName: 'Wikipedia' },
  { service: 'wordpress', url: 'https://www.wordpress.com/', displayName: 'WordPress' },
  { service: 'yahoo', url: 'https://login.yahoo.com/', displayName: 'Yahoo' },
];

const forms = document.querySelectorAll('.form');
const user = document.querySelector('input[name="user"]');
const password = document.querySelector('input[name="master"]');
const tabla = document.querySelector('.sitios');
const passLenght = document.querySelector('input[name="lenght"]');
const eye = document.querySelector('.eye');
const useSymbols = document.querySelector('input[name="symbols"]');
const useCaps = document.querySelector('input[name="caps"]');
const newServ = document.querySelector('input[name="new-serv"]');
const newPass = document.querySelector('input[name="new-pass"]');
const btnTitle = document.querySelector('#btn_title');
const contenido = document.querySelector('.contenido');

if (navigator.userAgent.toLowerCase().indexOf('safari') !== -1) {
  document.body.classList.add('safari');
}

function getPass(service) {
  let contrasena = '';

  if (user.value && password.value) {
    const len = passLenght.value;
    const usuario = user.value.toLowerCase();
    let prepass = forge_sha256(`${password.value}/${usuario}@${service}`);

    if (useSymbols.checked) {
      const vocales = prepass.match(/[aeiou]/gi);

      const syms = '{!#$%&()*+,-./:;<=>?@[{}]^_| ~}';

      const index = Math.round((vocales.length / 100) * syms.length);

      prepass =
        prepass.slice(0, len / 3) +
        syms[index] +
        prepass.slice(len / 3, (len * 2) / 3) +
        syms[index + 2] +
        prepass.slice((len * 2) / 3, len);
    }
    if (useCaps.checked) {
      prepass =
        prepass.slice(0, len / 3) +
        prepass.slice(len / 3, (len * 2) / 3).toUpperCase() +
        prepass.slice((len * 2) / 3, len);
    }
    contrasena = prepass.slice(0, len);
  }
  return contrasena;
}

function getNewPass() {
  newPass.value = newServ.value ? getPass(newServ.value) : '';
}

function populateList() {
  tabla.innerHTML = sitios
    .map(
      (sitio, i) => `
        <tr id="${i}"><td class="sitio"><a href="${sitio.url}">${sitio.displayName}</a> </td>
        <td class="password"><input type="text" class="password-input" value="${getPass(
          sitio.service,
        )}" onClick="this.select();"></td></tr>
          `,
    )
    .join('');
  getNewPass();
}

function showPassword() {
  password.type = 'text';
  this.innerHTML = '&#9679;';
  this.classList.toggle('show');
}

function hidePassword() {
  password.type = 'password';
  this.innerHTML = '&#9675;';
  this.classList.toggle('show');
}

function sleep(ms = 0) {
  return new Promise(r => setTimeout(r, ms));
}
function showContent() {
  contenido.classList.toggle('visible');
  contenido.classList.toggle('collapsed');
  console.log('do it');

  sleep(550).then(() => {
    window.scroll({ top: 10000, left: 0, behavior: 'smooth' });
    console.log('did');
  });
}

password.addEventListener('change', populateList);
user.addEventListener('change', populateList);
useSymbols.addEventListener('change', populateList);
useCaps.addEventListener('change', populateList);
passLenght.addEventListener('change', populateList);

btnTitle.addEventListener('mousedown', showContent);

forms.forEach(form => form.addEventListener('submit', e => e.preventDefault()));
eye.addEventListener('mousedown', showPassword);
eye.addEventListener('mouseup', hidePassword);
eye.addEventListener('touchstart', showPassword);
eye.addEventListener('touchend', hidePassword);

newServ.addEventListener('change', getNewPass);

populateList();
