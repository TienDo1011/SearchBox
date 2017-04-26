var express = require("express");
var router = express.Router();
var ctrlMain = require("../controllers/main");

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Tieng anh thay Tien" });
});

router.get("/dict", ctrlMain.dict);
router.get("/q", ctrlMain.suggestion);

module.exports = router;
