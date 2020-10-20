import CodeMirror from "codemirror";
import "codemirror/mode/javascript/javascript";

import Split from "split";
// eslint-disable-next-line
const _ = (el) => document.querySelector(el);
/**
 * Storage theme settings
 *
 * set Storage.val = {color: 'blue'}
 * get Storage.val
 */

const Storage = {
  get val() {
    this.data = window.localStorage.getItem("last-saved");
    return this.data;
  },
  set val(value) {
    this.data = value;
    window.localStorage.setItem("last-saved", this.data);
  }
};

// print info cose
const info = `------------------
Running Codemirror 
------------------`;

const editor = document.getElementById("editor");
const logger = document.getElementById("log");
const clear = document.getElementById("clear");
const run = document.getElementById("run");
const infoDiv = document.getElementById("info");

let codeEditor = CodeMirror(editor, {
  mode: { name: "javascript", json: true, css: true },
  lineNumbers: true,
  lineWrapping: false,
  theme: "material-palenight"
});

// first code
let initValue = Storage.val
  ? Storage.val
  : `
  // Fib 
  function fib(n){
    if(n < 2){
      return n;
    }
     return fib(n -1) + fib(n-2)
   }
   fib(4)
 `;

codeEditor.setValue(initValue);

// divide
Split(["#editor", "#log"], {
  elementStyle: (dimension, size, gutterSize) => ({
    "flex-basis": `calc(${size}% - ${gutterSize}px)`
  }),

  gutterStyle: (dimension, gutterSize) => ({
    "flex-basis": `${gutterSize}px`
  }),

  minSize: [200, 200]
});

window.addEventListener("error", errorInfo);
logger.textContent = info + "\n";
clear.addEventListener("click", clearLog);
run.addEventListener("click", runEval);
notification("Ready");

/**
 * Replace Console log
 */

const log = console.log;
console.log = function () {
  let val = [].slice.call(arguments).reduce(function (prev, arg) {
    let output = typeof arg === "object" ? JSON.stringify(arg) : arg;
    if (typeof arg === "object" && typeof JSON === "object")
      output = `<span class="log-object">${JSON.stringify(arg)}</span>\n`;
    else if (typeof arg === "function" && typeof JSON.stringify === "function")
      output = `<span class="log-function">${JSON.stringify(arg)}</span>\n`;
    else output = `<span class="log-${typeof arg}">${arg}</span>\n`;
    return prev + " " + output;
  }, "");
  logger.innerHTML += val;
  log(...arguments);
};

/**
 * Error info
 * @param {string} e
 */
function errorInfo(e) {
  let msg = "EXCEPTION: ";
  msg += e.message + "\n";
  msg += e.filename;
  msg += e.lineno + ":" + e.colno;
  logger.innerHTML += `<div style="margin: 10px 0; display:block; background: #f55; color: white; padding: 4px 10px; border-radius: 4px; font-family: 'Lucida Console', Monaco, monospace, sans-serif; font-size: 80%"><b style="color:#FFEB3B;">Error</b>: ${msg}</div>`;
}
/**
 * Clear log
 * @param {object} evt
 */
function clearLog(evt) {
  evt.preventDefault();
  notification("Clear log");
  logger.textContent = info + "\n";
  logger.className = "clearing";
  let w = setTimeout(() => {
    logger.className = "";
    clearTimeout(w);
  }, 800);
}
/**
 * Parse code and check type
 * @param {string} str
 */
function parseCode(str) {
  // eslint-disable-next-line
  let code = eval(str);
  let output = typeof code === "object" ? JSON.stringify(code) : code;
  if (typeof code === "object" && typeof JSON === "object")
    output = `<span class="log-object">${JSON.stringify(code)}</span>\n`;
  else if (typeof code === "function" && typeof JSON.stringify === "function")
    output = `<span class="log-function">${JSON.stringify(code)}</span>\n`;
  else output = `<span class="log-${typeof code}">${code}</span>\n`;
  return output;
}
/**
 * Run code
 * @param {object} evt
 */
function runEval(evt) {
  if (evt) evt.preventDefault();
  notification("Run code");
  return render();
}
/**
 * Render code
 */
function render() {
  let code = editor.querySelector(".CodeMirror-scroll");
  code.classList.add("clearing");
  let w = setTimeout(() => {
    code.classList.remove("clearing");
    Storage.val = codeEditor.getValue();
    let output = codeEditor.getValue();
    logger.innerHTML += parseCode(output);
    clearTimeout(w);
  }, 800);
}
/**
 * Show notifications
 * @param {string} txt
 */

function notification(txt) {
  infoDiv.innerHTML = `<span>${txt}</span>`;
  let w = setTimeout(() => {
    infoDiv.innerHTML = `<span>Console</span>`;
    clearTimeout(w);
  }, 1000);
}
