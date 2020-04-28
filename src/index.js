const wt = require("@waves/waves-transactions")

import { v1 as uuidv1 } from "uuid";
import { sha256 } from "js-sha256";
import { cpus } from "os";
import Chance from "chance"
const chance = new Chance();

const { invokeScript, massTransfer, nodeInteraction, broadcast } = require("@waves/waves-transactions");

let whitelisted = false
let chainid = 'S'
let nodeURL = "https://nodes-stagenet.wavesnodes.com";
let assetID = ""; // "Gf9t8FA4H3ssoZPCwrg3KwUFCci8zuUFP9ssRsUY3s6a";
let dappAddress = "3MqJWRb7VYy7nZMrHmJ8zKnU8PxBq7Li6Zs";
let amountPrice = 17099863201094; 
document.users = [] 
let numCall = 0
document.multiplcator = 1
// ADDRESS OWNER
// license patch spirit box dial ill market slab dynamic trophy true ramp room edit brush
// 3PQzymawchcHYgCjnCYxjmGM11A5mCujq2A

let generateUsers = function(){
  let countAccount = document.querySelector("#addresses h5 span").textContent
  countAccount == "" ? (countAccount = 0) : (countAccount = countAccount);
  let num = document.getElementById("amountAccounts").value;
  if(num > 100){
    alert("100 address maximum")
    return
  }
  for(let i = 0; i < num; i++){
    document.users.push({index: i, seed: wt.libs.crypto.randomSeed()})
    let element = document.createElement("li")
    element.setAttribute("data-address", wt.libs.crypto.address(document.users[i].seed, chainid));
    element.setAttribute("data-index", i);
    element.insertAdjacentHTML("beforeend", "Address: "+wt.libs.crypto.address(document.users[i].seed, chainid)+"<br/>Seed: "+ document.users[i].seed+"<div class=\"balance\"></div><div class=\"res_invoke\"></div>");
    document.getElementById("users").appendChild(element);
    countAccount++
  }
  document.querySelector("#addresses h5 span").textContent = countAccount;
  document.querySelector("#run span").textContent = countAccount;
  document.getElementById("amountAccounts").value = ""
}


document.getElementById("generateAddress").addEventListener("click", function(e){
  e.preventDefault()
  generateUsers()
});


document.updateBalance = async function(i){
  if(document.users.length){
    let address = wt.libs.crypto.address(document.users[i].seed, chainid);
    if (assetID == "" || assetID == null || assetID == "undefined") {
      await nodeInteraction
        .balance(address, nodeURL).then((bal) => {
          document.querySelector('[data-address="'+address+'"] .balance').setAttribute("data-balance", bal)
          document.querySelector('[data-address="'+address+'"] .balance').textContent = "Balance = " + bal / 10 ** 8
        }).catch((err) => {
          console.log(err);
        });
    } else {
      await nodeInteraction
        .assetBalance(assetID, address, nodeURL)
        .then((bal) => {
          document
            .querySelector('[data-address="' + address + '"] .balance')
            .setAttribute("data-balance", bal);
          document.querySelector(
            '[data-address="' + address + '"] .balance'
          ).textContent = "Balance = " + bal / 10 ** 8;
        }).catch((err) => {
          console.log(err);
        });
    }
  } 
}

let displayExistingUsers = function(users){
  let countAccount = 0
  let num = users.length

  for(let i = 0; i < num; i++){
    let element = document.createElement("li")
    element.setAttribute("data-address", wt.libs.crypto.address(users[i].seed, chainid));
    element.setAttribute("data-index", i);
    element.insertAdjacentHTML("beforeend", "Address: "+wt.libs.crypto.address(users[i].seed, chainid)+"<br/>Seed: "+ users[i].seed+"<div class=\"balance\"></div><div class=\"res_invoke\"></div>");
    document.getElementById("users").appendChild(element);
    countAccount++
  }
  document.querySelector("#addresses h5 span").textContent = countAccount;
  document.querySelector("#run span").textContent = countAccount;
  document.getElementById("amountAccounts").value = ""
  numCall = countAccount;
}

document.getElementById("multiply").addEventListener("input", function(e){
  let countAccount = document.querySelector("#addresses h5 span").textContent;
  document.multiplcator = document.getElementById("multiply").value
  document.querySelector("#run span").textContent = document.multiplcator * countAccount;
  numCall = document.multiplcator * countAccount;
});


let smartAccount = true // make it dynamic with a checkbox or check it directrely if in api
let sendTokens = async function(amount){
  console.log("Mass tranfer init...")
  if(document.users.length > 100){
    alert("100 maximum");
    return
  }
  let mainSeed = document.getElementById("mainSeed").value;

  let amountToSend = document.getElementById("amountToSend").value;

  assetID = document.getElementById("assetid").value;
  if( assetID == ""){ assetID = null; }

  let masstxdata = []
  for(let i = 0; i < document.users.length; i++){
    masstxdata.push({
      amount: amountToSend * 10 ** 8,
      recipient: wt.libs.crypto.address(document.users[i].seed, chainid),
    });
  }
  let fee = smartAccount ? 400000 + masstxdata.length * 100000 : masstxdata.length * 100000
  const params = {
    transfers: masstxdata,
    assetId: assetID == "" ? null : assetID,
    fee: fee
  };

  let tx = await broadcast(massTransfer(params, mainSeed), nodeURL)
  console.log("Wait for tx...")
  let txDone = await nodeInteraction.waitForTx(tx.id, { apiBase: nodeURL });
  let countInterval = 0;
  let intervalID  = setInterval(function (e) {
      for (let i = 0; i < document.users.length; i++) {
        document.updateBalance(i);
      }
      if (++countInterval === 4) {
        window.clearInterval(intervalID);
        console.log("Mass Transfer confirmed.");
      }
  }, 2500);

}

document.getElementById("sendTokens").addEventListener("click", function (e) {
  e.preventDefault();
  sendTokens();
});


document.invokeScript = invokeScript;
document.broadcast = broadcast;
document.nodeInteraction = nodeInteraction;
document.chance = chance;
require("codemirror/mode/javascript/javascript");
require("codemirror/addon/edit/closebrackets");
var CodeMirror = require("codemirror");
require("console-log-div");
var js = CodeMirror.fromTextArea(document.getElementById("codejs"), {
  mode: "text/javascript",
  lineNumbers: true
});

$("#run").click(function () {
  document.countingCalls = 0
  $("#chalfunction").remove();
  var jsx = `document.challengeFunction = async function() { 
    var invokeScript = document.invokeScript; 
    var broadcast = document.broadcast;
    var nodeInteraction = document.nodeInteraction;
    var updateBalance = document.updateBalance
    var chance = document.chance
    var numCall = ${numCall};
    var txs = []
    for(var i=0; i < document.users.length; i++){
    `;
  jsx += js.getValue();
  jsx += `
      
      let signedTx = invokeScript(params, document.users[i].seed)
      txs.push(signedTx.id)
      let broadcastTx = broadcast(signedTx, "${nodeURL}").then(data => { 
        console.log("<i>Broacasted tx: "+data.id+"</i>")          
      }).catch(err => console.log(err))
      document.countingCalls++
    }
    console.log(document.countingCalls+" Invocation(s) initiated")

    Promise.all(txs.map(id =>{
      return nodeInteraction.waitForTx(id, {apiBase:"https://nodes-stagenet.wavesnodes.com"}).then(res => {
        
        if(res.applicationStatus == "scriptExecutionFailed"){
          nodeInteraction.stateChanges(res.id, "https://nodes-stagenet.wavesnodes.com").then(state => {
            console.log("Status: "+res.applicationStatus+"<br/>Error: " + state.errorMessage.text+"<br/>TxID: "+res.id+", Sender: "+res.sender); 
          }) 
        }else{
          console.log("Status: "+res.applicationStatus+"<br/>TxID: "+res.id+", Sender: "+res.sender)
        }
      })
    })).then(jsons => {
        // console.log("All promise sent.")
        for (let i = 0; i < document.users.length; i++) {
          document.updateBalance(i);
        }
    })
  }
  `;
  var s = document.createElement("script");
  s.setAttribute("id", "chalfunction");
  s.textContent = jsx; //inne
  document.body.appendChild(s);
  for(var i=0; i < document.multiplcator; i++){
    document.challengeFunction();
  }
  
});



// SAVE/CLEAR

document.getElementById("save").addEventListener("click", function (e) {
  e.preventDefault();
  localStorage.setItem("users", JSON.stringify(document.users));
  localStorage.setItem("mainSeed", document.getElementById("mainSeed").value);
  localStorage.setItem("assetID", document.getElementById("assetid").value);
  localStorage.setItem("lastCode", js.getValue())
  console.log("Users, Seed, Asset ID and code saved!");
});

document.getElementById("reset").addEventListener("click", function (e) {
  e.preventDefault();
  localStorage.removeItem("users");
  localStorage.removeItem("mainSeed");
  localStorage.removeItem("assetID");
  document.getElementById("mainSeed").value = "";
  document.getElementById("assetid").value = "";
  document.getElementById("users").innerHTML = "";
  document.users = [];
  js.setValue('console.log("test")');
  document.querySelector("#addresses h5 span").textContent = 0;
  document.querySelector("#run span").textContent = 0;
  console.log("Configuration and code cleared!");
});

if (localStorage.getItem("users")) {
  console.log("Configuration loaded")
  document.users = JSON.parse(localStorage.getItem("users"))
  js.setValue(localStorage.getItem("lastCode"))
  document.getElementById("mainSeed").value = localStorage.getItem("mainSeed");
  document.getElementById("assetid").value = localStorage.getItem("assetID");
  displayExistingUsers(document.users);
  for (let i = 0; i < document.users.length; i++) {
    document.updateBalance(i);
  }
}

document.getElementById("clearConsole").addEventListener("click", function (e) {
  e.preventDefault();
  document.getElementById("console-log-text").innerHTML = "";
});
document.getElementById("expandConsole").addEventListener("click", function (e) {
  e.preventDefault();
  document.querySelector("footer").classList.toggle("expand");
});
// OVERRIRE CONSOLE LOG
/* (function () {
  var old = console.log;
  var logger = document.getElementById('log');
  console.log = function () {
    for (var i = 0; i < arguments.length; i++) {
      if (typeof arguments[i] == 'object') {
          logger.innerHTML += (JSON && JSON.stringify ? JSON.stringify(arguments[i], undefined, 2) : arguments[i]) + '<br />';
      } else {
          logger.innerHTML += arguments[i] + '<br />';
      }
    }
  }
})(); */

// TRANSFER TOKEN FOR DEV ONLY
/* wt.broadcast(
  wt.transfer(
    {
      amount: 10000000,
      recipient: "3MouSkYhyvLXkn9wYRcqHUrhcDgNipSGFQN",
      chainId: "S",
    },
    "ridge near cute smoke slight olive paddle okay velvet tilt benefit open silly together rent"
  ),
  "https://nodes-stagenet.wavesnodes.com"
).then((res) => console.log(res)).catch((err) => console.log(err)); */