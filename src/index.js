import Chance from "chance"
const chance = new Chance();
import { libs, invokeScript, massTransfer, nodeInteraction, broadcast } from "@waves/waves-transactions";
document.chainid = 'T'
document.nodeURL = "https://nodes-testnet.wavesnodes.com";
let assetID = "";
document.users = [] 
let numCall = 0
document.multiplcator = 1

let chainIdMatchList = function(){
  if(document.users.length){
    let get2ndByteFirstAddr = libs.crypto.base58Decode(document.users[0])[1]
    if(get2ndByteFirstAddr == document.chainid.charCodeAt(0)){
      return true
    }else{
      return false
    }
  }
  return true
}

let generateUsers = function(){
    if(!chainIdMatchList()){
       console.log("<span class=\"red\">Don't mix chainid, clear account list first.</span>")
       return
    }
    let countAccount = document.querySelector("#addresses h5 span").textContent
    countAccount == "" ? (countAccount = 0) : (countAccount = countAccount);
    let num = document.getElementById("amountAccounts").value;
    num == "" ? num = 0 : num = num
    if(parseInt(document.users.length) + parseInt(num) <= 100){
      for(let i = 0; i < num; i++){
        document.users.push({index: i, seed: libs.crypto.randomSeed()})
        let element = document.createElement("li")
        element.setAttribute("data-address", libs.crypto.address(document.users[i].seed, document.chainid));
        element.setAttribute("data-index", i);
        element.insertAdjacentHTML("beforeend", "<div class=\"addr\">Address: "+libs.crypto.address(document.users[i].seed, document.chainid)+"</div><div class=\"seed\">Seed: "+ document.users[i].seed+"</div><div class=\"balance\"></div><div class=\"del\">X</div>");
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

document.getElementById("generateAddress").addEventListener("click", function(e){
  e.preventDefault()
  generateUsers()
});

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

document.getElementById("clearUsers").addEventListener("click", function(e){
  document.users.length = 0
  document.querySelector("#addresses h5 span").textContent = 0 
  document.querySelector("#run span").textContent = 0 
  document.getElementById("users").innerHTML = ""
});

document.updateBalance = async function(i){
  if(document.users.length){
    let address = libs.crypto.address(document.users[i].seed, document.chainid);
    if (assetID == "" || assetID == null || assetID == "undefined") {
      await nodeInteraction
        .balance(address, document.nodeURL).then((bal) => {
          if(document.querySelector('[data-address="'+address+'"] .balance')){
            document.querySelector('[data-address="'+address+'"] .balance').setAttribute("data-balance", bal)
            document.querySelector('[data-address="'+address+'"] .balance').textContent = "Balance = " + bal / 10 ** 8
          }
        }).catch((err) => {
          console.log(err);
        });
    } else {
      await nodeInteraction
        .assetBalance(assetID, address, document.nodeURL)
        .then((bal) => {
          if(document.querySelector('[data-address="'+address+'"] .balance')){
            document.querySelector('[data-address="' + address + '"] .balance').setAttribute("data-balance", bal);
            document.querySelector('[data-address="' + address + '"] .balance').textContent = "Balance = " + bal / 10 ** 8;
          }
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
    element.setAttribute("data-address", libs.crypto.address(users[i].seed, document.chainid));
    element.setAttribute("data-index", i);
    element.insertAdjacentHTML("beforeend", "<div class=\"addr\">Address: "+libs.crypto.address(document.users[i].seed, document.chainid)+"</div><div class=\"seed\">Seed: "+ document.users[i].seed+"</div><div class=\"balance\"></div><div class=\"del\">X</div>");
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
  document.getElementById("multiply").value == "" ? document.multiplcator = 1 : document.multiplcator = document.getElementById("multiply").value;
  document.querySelector("#run span").textContent = document.multiplcator * countAccount;
  numCall = document.multiplcator * countAccount;
});

let sendTokens = async function(amount){
  console.log("Mass distribution init...");
  if(document.users.length > 100){
    alert("100 maximum");
    return
  }
  let mainSeed = document.getElementById("mainSeed").value;
  let checkAccountType = await nodeInteraction.scriptInfo(libs.crypto.address(mainSeed, document.chainid), document.nodeURL)
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
      recipient: libs.crypto.address(document.users[i].seed, document.chainid),
    });
  }
  let fee = extraFee + masstxdata.length * 100000
  const params = {
    transfers: masstxdata,
    assetId: assetID == "" ? null : assetID,
    fee: fee
  };

  let tx = await broadcast(massTransfer(params, mainSeed), document.nodeURL);
  console.log("Wait for mass distribution...")
  let txDone = await nodeInteraction.waitForTx(tx.id, { apiBase: document.nodeURL });
  console.log("Mass distributiom done.");
}

document.getElementById("sendTokens").addEventListener("click", function (e) {
  e.preventDefault();
  sendTokens();
});

document.getElementById("network").addEventListener("change", function(e){
  if (!chainIdMatchList()) {
    console.log("<span class=\"red\">Don't mix chainid, clear account list first.</span>")
    if (e.target.selectedIndex == 0) {
      e.target.selectedIndex = 1
    } else if (e.target.selectedIndex == 1) {
      e.target.selectedIndex = 0
    }
    return;
  }
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
require("../src/console-log-div.js");
var js = CodeMirror.fromTextArea(document.getElementById("codejs"), {
  mode: "text/javascript",
  lineNumbers: true
});

document.getElementById("run").addEventListener("click", function () {
  document.countingCalls = 0
  if (document.getElementById("dynamicfunction")){
    document.getElementById("dynamicfunction").remove();
  }
  var jsx = `document.dynamicfunction = async function() { 
    var invokeScript = document.invokeScript; 
    var broadcast = document.broadcast;
    var nodeInteraction = document.nodeInteraction;
    var updateBalance = document.updateBalance
    var chance = document.chance
    document.chainId = document.getElementById("network").value
    let explorerUrl = document.chainId == 'T' ? "https://wavesexplorer.com/testnet/tx/" : "https://stagenet.wavesexplorer.com/tx/"
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
        console.log('<i>Broacasted tx: <a href="'+explorerUrl+data.id+'" target="_blank">'+data.id+'</a></i>')        
      }).catch(err => console.log(err.message+"<br/>", err))
      document.countingCalls++
    }

    Promise.all(txs.map(id =>{
      return nodeInteraction.waitForTx(id, {apiBase: document.nodeURL}).then(res => {
        let status = "" 
        if(res.applicationStatus){ // RIDE V4 Status
          status = 'Status: ' + res.applicationStatus + '<br/>'
        }
        if(res.applicationStatus == "scriptExecutionFailed"){
          nodeInteraction.stateChanges(res.id, document.nodeURL).then(state => {
            
            console.log(status+'<span class="red">Error: ' + state.errorMessage.text + '</span><br/>TxID: <a href="'+explorerUrl+res.id+'" target="_blank">' + res.id + '</a>, Sender: ' + res.sender); 
          }) 
        }else{
          console.log(status+'TxID: <a href="'+explorerUrl+res.id+'" target="_blank">' + res.id + '</a>, Sender: ' + res.sender)
        }
      })
    })).then(jsons => {
        // console.log("All promise sent.")
    })
    
  }
  `;
  var s = document.createElement("script");
  s.setAttribute("id", "dynamicfunction");
  s.textContent = jsx; //inne
  document.body.appendChild(s);
  var start = window.performance.now();
  for(var i=0; i < document.multiplcator; i++){
    document.dynamicfunction();
  }
  var end = window.performance.now();
  var time = end - start;
  console.log(document.countingCalls + " Invocation(s) broadcast initiated in: "+time+" ms");
  
});

let checkBalance = setInterval(function(e){
  for (let i = 0; i < document.users.length; i++) {
    document.updateBalance(i);
  }
}, 4000)


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
  if (document.querySelector("footer").classList.contains("expand")) {
    document.getElementById("expandConsole").textContent = "Minimize";
  } else {
    document.getElementById("expandConsole").textContent = "Expand";
  }
});