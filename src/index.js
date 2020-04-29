const wt = require("@waves/waves-transactions")
import Chance from "chance"
const chance = new Chance();
const { invokeScript, massTransfer, nodeInteraction, broadcast } = require("@waves/waves-transactions");
document.chainid = 'T'
document.nodeURL = "https://nodes-testnet.wavesnodes.com";
let assetID = "";
document.users = [] 
let numCall = 0
document.multiplcator = 1

let generateUsers = function(){
    let countAccount = document.querySelector("#addresses h5 span").textContent
    countAccount == "" ? (countAccount = 0) : (countAccount = countAccount);
    let num = document.getElementById("amountAccounts").value;
    num == "" ? num = 0 : num = num
    if(parseInt(document.users.length) + parseInt(num) <= 100){
      for(let i = 0; i < num; i++){
        document.users.push({index: i, seed: wt.libs.crypto.randomSeed()})
        let element = document.createElement("li")
        element.setAttribute("data-address", wt.libs.crypto.address(document.users[i].seed, document.chainid));
        element.setAttribute("data-index", i);
        element.insertAdjacentHTML("beforeend", "<div class=\"addr\">Address: "+wt.libs.crypto.address(document.users[i].seed, document.chainid)+"</div><div class=\"seed\">Seed: "+ document.users[i].seed+"</div><div class=\"balance\"></div><div class=\"del\">X</div>");
        document.getElementById("users").appendChild(element);
        countAccount++
      }
      document.querySelector("#addresses h5 span").textContent = countAccount;
      document.querySelector("#run span").textContent = countAccount;
      document.getElementById("amountAccounts").value = ""
    }else{
      console.log("100 accounts max")
    }
}
document.getElementById("users").addEventListener("click", function(elm){
  if(elm.target.matches('.del')){
    let index = parseInt(elm.target.parentNode.getAttribute("data-index"));
    var indexFromValue = document.users.findIndex((x) => x.index === parseInt(index));
    if (indexFromValue != -1) {
      document.users.splice(indexFromValue, 1);
    }
    document.querySelectorAll('[data-index="' + index + '"]')[0].remove();
    document.querySelector("#addresses h5 span").textContent = document.users.length 
    document.querySelector("#run span").textContent = document.users.length 
  }
})

document.getElementById("generateAddress").addEventListener("click", function(e){
  e.preventDefault()
  generateUsers()
});

document.updateBalance = async function(i){
  if(document.users.length){
    let address = wt.libs.crypto.address(document.users[i].seed, document.chainid);
    if (assetID == "" || assetID == null || assetID == "undefined") {
      await nodeInteraction
        .balance(address, document.nodeURL).then((bal) => {
          document.querySelector('[data-address="'+address+'"] .balance').setAttribute("data-balance", bal)
          document.querySelector('[data-address="'+address+'"] .balance').textContent = "Balance = " + bal / 10 ** 8
        }).catch((err) => {
          console.log(err);
        });
    } else {
      await nodeInteraction
        .assetBalance(assetID, address, document.nodeURL)
        .then((bal) => {
          document.querySelector('[data-address="' + address + '"] .balance').setAttribute("data-balance", bal);
          document.querySelector('[data-address="' + address + '"] .balance').textContent = "Balance = " + bal / 10 ** 8;
        })
        .catch((err) => {
          console.log(err);
        });
    }
  } 
}

let displayExistingUsers = function(users){
  let countAccount = 0;
  let num = users.length;
  for(let i = 0; i < num; i++){
    let element = document.createElement("li")
    element.setAttribute("data-address", wt.libs.crypto.address(users[i].seed, document.chainid));
    element.setAttribute("data-index", i);
    element.insertAdjacentHTML("beforeend", "<div class=\"addr\">Address: "+wt.libs.crypto.address(document.users[i].seed, document.chainid)+"</div><div class=\"seed\">Seed: "+ document.users[i].seed+"</div><div class=\"balance\"></div><div class=\"del\">X</div>");
    document.getElementById("users").appendChild(element);
    countAccount++
  }
  document.querySelector("#addresses h5 span").textContent = countAccount;
  document.querySelector("#run span").textContent = countAccount;
  document.getElementById("amountAccounts").value = ""
  numCall = countAccount;
}

document.getElementById("multiply").addEventListener("input", async function(e){
  let countAccount = document.querySelector("#addresses h5 span").textContent;
  document.multiplcator = document.getElementById("multiply").value
  document.querySelector("#run span").textContent = document.multiplcator * countAccount;
  numCall = document.multiplcator * countAccount;
});

let sendTokens = async function(amount){
  console.log("Mass tranfer init...")
  if(document.users.length > 100){
    alert("100 maximum");
    return
  }
  let mainSeed = document.getElementById("mainSeed").value;
  let checkAccountType = await nodeInteraction.scriptInfo(wt.libs.crypto.address(mainSeed, document.chainid), document.nodeURL)
  let extraFee = checkAccountType.extraFee
  if(extraFee!=0){
    console.log("Adding extra " + extraFee + " free due to smart account.");
  }

  let amountToSend = document.getElementById("amountToSend").value;
  assetID = document.getElementById("assetid").value;
  if( assetID == ""){ assetID = null; }
  let masstxdata = []
  for(let i = 0; i < document.users.length; i++){
    masstxdata.push({
      amount: amountToSend * 10 ** 8,
      recipient: wt.libs.crypto.address(document.users[i].seed, document.chainid),
    });
  }
  let fee = extraFee + masstxdata.length * 100000
  const params = {
    transfers: masstxdata,
    assetId: assetID == "" ? null : assetID,
    fee: fee
  };

  let tx = await broadcast(massTransfer(params, mainSeed), document.nodeURL);
  console.log("Wait for tx...")
  let txDone = await nodeInteraction.waitForTx(tx.id, { apiBase: document.nodeURL });
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

document.getElementById("network").addEventListener("change", function(e){
  if( e.target.selectedIndex == 0){
    document.chainid = "T";
    document.nodeURL = "https://nodes-testnet.wavesnodes.com";
  } else if (e.target.selectedIndex == 1) {
    document.chainid = "S";
    document.nodeURL = "https://nodes-stagenet.wavesnodes.com";
  }
})


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
    document.chainId = document.getElementById("network").value
    var numCall = ${numCall};
    var txs = []
    
    for(var i=0; i < document.users.length; i++){
    `;
  jsx += js.getValue();
  jsx += `
      params.chainId = document.chainId
      let signedTx = invokeScript(params, document.users[i].seed)
      txs.push(signedTx.id)
      let broadcastTx = broadcast(signedTx, document.nodeURL).then(data => { 
        console.log("<i>Broacasted tx: "+data.id+"</i>")          
      }).catch(err => console.log(err))
      document.countingCalls++
    }

    Promise.all(txs.map(id =>{
      return nodeInteraction.waitForTx(id, {apiBase: document.nodeURL}).then(res => {
        
        if(res.applicationStatus == "scriptExecutionFailed"){
          nodeInteraction.stateChanges(res.id, document.nodeURL).then(state => {
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
  var start = window.performance.now();
  for(var i=0; i < document.multiplcator; i++){
    document.challengeFunction();
  }
  var end = window.performance.now();
  var time = end - start;
  console.log(document.countingCalls + " Invocation(s) broadcast initiated in: "+time+" ms");
  
});



// SAVE/CLEAR

document.getElementById("save").addEventListener("click", function (e) {
  e.preventDefault();
  localStorage.setItem("users", JSON.stringify(document.users));
  localStorage.setItem("mainSeed", document.getElementById("mainSeed").value);
  localStorage.setItem("assetID", document.getElementById("assetid").value);
  localStorage.setItem("lastCode", js.getValue())
  localStorage.setItem("chainid", document.getElementById("network").value)
  console.log("Users, Seed, Asset ID, chain ID and Code saved!");
});

document.getElementById("reset").addEventListener("click", function (e) {
  e.preventDefault();
  localStorage.removeItem("users");
  localStorage.removeItem("mainSeed");
  localStorage.removeItem("assetID");
  localStorage.removeItem("chainid")
  document.getElementById("mainSeed").value = "";
  document.getElementById("assetid").value = "";
  document.getElementById("users").innerHTML = "";
  document.getElementById("network").selectedIndex = "0"
  document.users = [];
  js.setValue('console.log("test")');
  document.querySelector("#addresses h5 span").textContent = 0;
  document.querySelector("#run span").textContent = 0;
  console.log("Configuration and code cleared!");
});

if (localStorage.getItem("users")) {
  document.users = JSON.parse(localStorage.getItem("users"))
  js.setValue(localStorage.getItem("lastCode"))
  document.getElementById("mainSeed").value = localStorage.getItem("mainSeed");
  document.getElementById("assetid").value = localStorage.getItem("assetID");
  if(localStorage.getItem("chainid") == "T"){
    document.chainid = "T";
    document.nodeURL = "https://nodes-testnet.wavesnodes.com";
    document.getElementById("network").selectedIndex = 0;
  }else if(localStorage.getItem("chainid") == "S"){
    document.chainid = "S";
    document.nodeURL = "https://nodes-stagenet.wavesnodes.com";
    document.getElementById("network").selectedIndex = 1;
  }
  displayExistingUsers(document.users);
  for (let i = 0; i < document.users.length; i++) {
    document.updateBalance(i);
  }
   console.log("Configuration loaded");
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