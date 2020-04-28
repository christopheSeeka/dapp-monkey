var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
      console.log(wt.libs.crypto.randomSeed());
/*   const signedInvokeScriptTx = invokeScript(params, seed).broadcast().then(data => {
    console.log(data)
    res.send({ res: "OK" });
  }).catch(err => {
    console.log(err)
    res.send({ res: "KO" });
  }) */
});

module.exports = router;
