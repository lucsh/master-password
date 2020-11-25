import './sha256';

const forms = document.querySelectorAll('.form');
const passLenght = document.querySelector('input[name="lenght"]');
const useSymbols = document.querySelector('input[name="symbols"]');
const useCaps = document.querySelector('input[name="caps"]');
const seed = document.querySelector('input[name="seed"]');
const newPass = document.querySelector('input[name="new-pass"]');
const btnSetup = document.querySelector('#btn_setup');
const setupContent = document.querySelector('#setup-content');
const btnPeek = document.querySelector('#btn_peek');
const hiddenSeed = document.querySelector('#hidden-seed');
const btnClose = document.querySelector('#btn_close');
const disclamerContainer = document.querySelector('#disclamer-container');

const isChrome = navigator.userAgent.indexOf('Chrome') > -1;
let isSafari = navigator.userAgent.indexOf('Safari') > -1;

if (isChrome && isSafari) {
    isSafari = false;
}

if (isSafari) {
    document.body.classList.add('safari');
}

function getPass(seed, hidden) {
    let contrasena = '';

    const len = passLenght.value;
    // eslint-disable-next-line no-undef
    let prepass = sha256(`${seed}${hidden}`);

    if (useSymbols.checked) {
        const vocales = prepass.match(/[aeiou]/gi);

        const syms = '{!#$%&()*+,-./:;<=>?@[{}]^_|~}';
        const index = Math.round((vocales.length * syms.length) / 100);
        prepass =
            prepass.slice(0, len / 3) +
            syms[index] +
            prepass.slice(len / 3, (len * 2) / 3) +
            syms[index + 2] +
            prepass.slice((len * 2) / 3, len);
    }
    let middle = prepass.slice(len / 3, (len * 2) / 3)
    if (useCaps.checked) {
        if (middle.substring(1,len / 3).match(/^[0-9]+$/) != null){
            //#$4237 => $A23L
            const letters="IDKFAHOLYV"
            const posa=middle[1]
            const posb=middle.slice(-1)
             middle=`${middle[0]}${letters[posa]}${middle.substring(1,middle.length-2)}${letters[posb]}`
        }

        prepass =
            prepass.slice(0, len / 3) +
            middle.toUpperCase() +
            prepass.slice((len * 2) / 3, len);
    }
    contrasena = prepass.slice(0, len);

    return contrasena;
}

function getNewPass() {
    if (seed.value || hiddenSeed.value) {
        newPass.value = getPass(seed.value, hiddenSeed.value);
    }
}

function greet() {
    console.log(`
      #####  ######   #####  
     #     # #     # #     # 
     #       #     # #       
      #####  ######  #  #### 
           # #       #     # 
     #     # #       #     # 
      #####  #        #####  
                              
    https://github.com/lucsh/master-password
    https://luc.sh
    `);
}

function showPassword() {
    hiddenSeed.type = 'text';
    this.innerHTML = '&#9675;';
    this.innerHTML = '&#9679;';
    this.classList.toggle('show');
}

function hidePassword() {
    hiddenSeed.type = 'password';
    this.innerHTML = '&#9675;';
    this.innerHTML = '&#9675;';
    this.classList.toggle('show');
}

function showSetupContent() {
    setupContent.classList.toggle('visible');
    setupContent.classList.toggle('collapsed');
}

function showDisclamerContent() {
    disclamerContainer.classList.toggle('collapsed');
}

useSymbols.addEventListener('change', getNewPass);
useCaps.addEventListener('change', getNewPass);
passLenght.addEventListener('input', getNewPass);

btnSetup.addEventListener('mousedown', showSetupContent);
btnClose.addEventListener('mousedown', showDisclamerContent);

forms.forEach((form) => form.addEventListener('submit', (e) => e.preventDefault()));

seed.addEventListener('input', getNewPass);
hiddenSeed.addEventListener('input', getNewPass);

btnPeek.addEventListener('mousedown', showPassword);
btnPeek.addEventListener('mouseup', hidePassword);

greet();
getNewPass();

//btnClose
// disclamerContainer
