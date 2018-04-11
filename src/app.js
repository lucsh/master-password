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
  { service: 'cpanel', url: 'localhost', displayName: 'cPanel' },
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
const passLenght = document.querySelector('input[name="length"]') || 14;
const eye = document.querySelector('.eye');
const newServ = document.querySelector('input[name="new-serv"]');
const newPass = document.querySelector('.new-pass');

function getPass(service) {
  if (user.value && password.value) {
    const usuario = (user.value).toLowerCase();
    let prepass = forge_sha256(`${password.value}/${usuario}@${service}`);

    const vocales = prepass.match(/[aeiou]/gi);

    const specialChars = '{!#$%&()*+,-./:;<=>?@[{}]^_| ~}';

    const index = Math.round((vocales.length / 100) * specialChars.length);
    prepass = prepass.slice(0, passLenght / 3) + specialChars[index] + prepass.slice(passLenght / 3, (passLenght * 2) / 3) + specialChars[index + 2] + prepass.slice((passLenght * 2) / 3, passLenght);
    return prepass.slice(1, passLenght + 1);
  } return '';
}

function getNewPass() {
  newPass.innerHTML = getPass(newServ.value);
}

function populateList() {
  tabla.innerHTML = sitios.map((sitio, i) => `
        <tr id="${i}"><td class="sitio"><a href="sitio.url">${sitio.displayName}</a> </td>
        <td class="password">${(getPass(sitio.service))}</td></tr>
          `).join('');
  getNewPass();
}


function selectAll(e) {
  // Filtro los clicks para que solo funcione en password
  if (!e.target.className === 'password') return;
  window.getSelection().selectAllChildren(e.target);
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

password.addEventListener('change', populateList);
user.addEventListener('change', populateList);

forms.forEach(form => form.addEventListener('submit', e => e.preventDefault()));
eye.addEventListener('mousedown', showPassword);
eye.addEventListener('mouseup', hidePassword);
eye.addEventListener('touchstart', showPassword);
eye.addEventListener('touchend', hidePassword);

newServ.addEventListener('change', getNewPass);
// Event delegation porque la populo despues
tabla.addEventListener('click', selectAll);
tabla.addEventListener('touchstart', selectAll);

newPass.addEventListener('click', selectAll);
newPass.addEventListener('touchstart', selectAll);

populateList();

