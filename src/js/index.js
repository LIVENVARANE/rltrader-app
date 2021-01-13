const electron = require("electron");
const fs = require("fs");

function pageLoad() {
    const dataFolderPath = (electron.app || electron.remote.app).getPath('userData');
     
    if(fs.existsSync(dataFolderPath + "/data/")) {
        var userDataPath = dataFolderPath + "/data/userdata.json";

        if(fs.existsSync(userDataPath)) {
            var userDataContent = JSON.parse(fs.readFileSync(userDataPath, 'utf-8').toString());

            document.getElementById("itemsearch").addEventListener("keyup", function(event) {
                if (event.key == 'Enter') {
                    event.preventDefault();
                    $(".search").click();
                }
            });

            if(userDataContent.didFirstConnect != 1) {
                document.getElementById('welcome-screen').style.display = "block";
            }
            else {
                var invContainer = document.getElementById("inv-container");
                invContainer.innerHTML = "";
                userDataContent.inventory.forEach(item => {
                    var itemDiv = document.createElement('div');
                    itemDiv.className = "item";
                    itemDiv.style.borderTop = "2px solid " + item.cssColor;
                    itemDiv.align = "left";
                    invContainer.appendChild(itemDiv);

                    var itemImage = document.createElement('img');
                    itemImage.src = item.itemImage;
                    itemImage.className = "itemimage";
                    itemDiv.appendChild(itemImage);

                    var itemName = document.createElement('span');
                    itemName.innerHTML = item.name;
                    itemName.className = "itemname";
                    itemDiv.appendChild(itemName);
                });
            }
        } else {
            console.log("File userdata.json not found, creating one..");

            var initialContent = {"didFirstConnect":0};
            fs.writeFileSync(userDataPath, JSON.stringify(initialContent, null, 4),'utf-8');
            pageLoad();
        }
    } else {
        console.log("Folder data not found, creating one..");
        fs.mkdirSync(dataFolderPath + "/data/");
        pageLoad();
    }
}

window.onload = pageLoad;

function startConfig(type) {
    var online_btn = document.getElementById('online-btn');
    var offline_btn = document.getElementById('offline-btn');
    var question_teller = document.getElementById('questionteller');
    var username_field = document.getElementById('lc-username-field');
    if(type == "online") {
        online_btn.innerHTML = "Coming Soon";
    } else if(type == "offline") {
        $("#questionteller").animate({ opacity: 0 }, function() {
            question_teller.innerHTML = "Alright, how do you want us to call you?"
        });
        $("#questionteller").animate({ opacity: 1 });
        $("#obtn-text").animate({ opacity: 0 }, "fast", function() {
            offline_btn.innerHTML = '<span id="obtn-text"> <i class="fas fa-arrow-right"></i> </span>';
        });
        $("#obtn-text").animate({ opacity: 1 });
        username_field.style.display = "block";
        username_field.style.opacity = 0;
        $("#lc-username-field").animate({ opacity: 1 }, function() {
            username_field.style.top = "-200px";
        });
        username_field.focus();
        offline_btn.removeAttribute('onclick');
        offline_btn.setAttribute('onclick', 'startConfig("o-continue");');
    } else if(type == "o-continue") {
        if(username_field.value == "") {
            $("#questionteller").animate({ opacity: 0 }, function() {
                question_teller.innerHTML = "Please enter a valid username.";
            });
            $("#questionteller").animate({ opacity: 1 });
            username_field.focus();
        } else {
            $("#obtn-text").animate({ opacity: 0 }, "fast", function() {
                offline_btn.innerHTML = '<span id="obtn-text"> <i class="fas fa-check"></i> </span>';
            });
            $("#obtn-text").animate({ opacity: 1 });
            $("#questionteller").animate({ opacity: 0 }, function() {
                question_teller.innerHTML = "Perfect, we got everything we need!";
            });
            $("#questionteller").animate({ opacity: 1 });

            var userDataPath = (electron.app || electron.remote.app).getPath('userData') + "/data/userdata.json";
            var userDataContent = JSON.parse(fs.readFileSync(userDataPath, 'utf-8').toString());

            userDataContent.didFirstConnect = 1;
            userDataContent.username = username_field.value;
            userDataContent.inventory = [];
            
            fs.writeFileSync(userDataPath, JSON.stringify(userDataContent, null, 4));

            setTimeout(function () {
                $("#welcome-screen").fadeOut("fast");
            }, 2000);
        }
    }
}

function addItemWindow() {
    var aiw = document.getElementById('additemwindow'); //cp iteminfo
    if(aiw.style.visibility == "visible") {
        $(".aiw-container").animate({ top: "-50px" }, "fast");
        $("#additemwindow").animate({ opacity: 0 }, "fast", function() {
            setTimeout(function () {
                aiw.style.visibility = "hidden";
                document.getElementById('colorpicker').style.visibility = "hidden";
                document.getElementById('iteminfo').style.visibility = "hidden";
                document.querySelector("footer").style.zIndex = 0;
            }, 100);
        });
    } else { //hidden
        document.querySelector("footer").style.zIndex = -1;
        aiw.style.visibility = "visible";
        aiw.style.opacity = 0;
        $("#additemwindow").animate({ opacity: 1 }, "fast");
        $(".aiw-container").animate({ top: "10px" }, "fast");
        document.getElementById('itemsearch').focus();
    }
}

function settingsWindow() {
    var sw = document.getElementById('settingswindow');
    if(sw.style.visibility == "visible") {
        $("#settingswindow").animate({ opacity: 0 }, "fast", function() {
            setTimeout(function () {
                sw.style.visibility = "hidden";
                document.querySelector("footer").style.zIndex = 0;
            }, 100);
        });
    } else { //hidden
        document.querySelector("footer").style.zIndex = -1;
        sw.style.visibility = "visible";
        sw.style.opacity = 0;
        $("#settingswindow").animate({ opacity: 1 }, "fast");
    }
}

function toggleToolbar() {
    var toolbar = document.querySelector("footer");
    if(toolbar.style.bottom == "23px") { //will hide
        $("footer").animate({ bottom: "-46px" });
        $(".toolbar-toggler").animate({ top: "-20px" }, "fast");
        $(".toolbar-toggler").animate({ opacity: 0 }, "fast", function() {
            $(".toolbar-toggler").parent().html("<i class=\"fas fa-chevron-up toolbar-toggler\" onclick=\"toggleToolbar()\"></i>");
            $(".toolbar-toggler").css("top", "-20px");
        });
        $(".toolbar-toggler").animate({ opacity: 1 }, "fast");

        $("#f-username").animate({ top: "-54px" }, "fast");
    } else { //will show
        $("footer").animate({ bottom: "23px" });
        $(".toolbar-toggler").animate({ top: "0px" }, "fast");
        $(".toolbar-toggler").animate({ opacity: 0 }, "fast", function() {
            $(".toolbar-toggler").parent().html("<i class=\"fas fa-chevron-down toolbar-toggler\" onclick=\"toggleToolbar()\"></i>");
            $(".toolbar-toggler").css("top", "0px");
        });
        $(".toolbar-toggler").animate({ opacity: 1 }, "fast");
        $("#f-username").animate({ top: "-34px" }, "fast");
    }
}

function colorPicker() {
    var cp = document.getElementById('colorpicker'); //cp iteminfo
    if(cp.style.visibility == "visible") {
        $("#colorpicker").animate({ opacity: 0 }, "fast", function() {
            cp.style.visibility = "hidden";
        });
    } else { //hidden
        cp.style.visibility = "visible";
        cp.style.opacity = 0;
        $("#colorpicker").animate({ opacity: 1 }, "fast");
    }
}

async function selectColor(color) {
    var colorbutton = document.getElementById('colorbutton');
    var priceLabel = document.getElementById('price');
    var colorpicker = document.getElementById('colorpicker');
    var itemnameLabel = document.getElementById('item-name');
    var itemImage = document.getElementById('itemimage');
    var stop = false;

    var itemImageURL = await doItemRequest(itemnameLabel.innerText.replace(" : ", "_").replace(" ", "_"), "/" + color.replace("default", ""), true);
    itemImageURL = itemImageURL.substring(itemImageURL.indexOf("<img src=\"https://img.rl.insider.gg/itemPics/large/") + 10);
    itemImage.src = itemImageURL.substring(0, itemImageURL.indexOf('"'));

    switch(color) {
        case "black":
            colorbutton.innerHTML = "Black";
            colorbutton.style.background = "black";
            colorbutton.style.color = "white";
            break;
        case "white":
            colorbutton.innerHTML = "Titanium White";
            colorbutton.style.background = "#dbdbdb";
            colorbutton.style.color = "white";
            break;
        case "grey":
            colorbutton.innerHTML = "Grey";
            colorbutton.style.background = "grey";
            colorbutton.style.color = "white";
            break;
        case "crimson":
            colorbutton.innerHTML = "Crimson";
            colorbutton.style.background = "#de1b1b";
            colorbutton.style.color = "white";
            break;
        case "pink":
            colorbutton.innerHTML = "Pink";
            colorbutton.style.background = "pink";
            colorbutton.style.color = "white";
            break;
        case "cobalt":
            colorbutton.innerHTML = "Cobalt";
            colorbutton.style.background = "#1b5cde";
            colorbutton.style.color = "white";
            break;
        case "sblue":
            colorbutton.innerHTML = "Sky Blue";
            colorbutton.style.background = "#09e9ed";
            colorbutton.style.color = "white";
            break;
        case "sienna":
            colorbutton.innerHTML = "Burnt Sienna";
            colorbutton.style.background = "brown";
            colorbutton.style.color = "white";
            break;
        case "saffron":
            colorbutton.innerHTML = "Saffron";
            colorbutton.style.background = "yellow";
            colorbutton.style.color = "black";
            break;
        case "lime":
            colorbutton.innerHTML = "Lime";
            colorbutton.style.background = "#07eb12";
            colorbutton.style.color = "white";
            break;
        case "fgreen":
            colorbutton.innerHTML = "Forest Green";
            colorbutton.style.background = "#0d7522";
            colorbutton.style.color = "white";
            break;
        case "orange":
            colorbutton.innerHTML = "Orange";
            colorbutton.style.background = "orange";
            colorbutton.style.color = "white";
            break;
        case "purple":
            colorbutton.innerHTML = "Purple";
            colorbutton.style.background = "purple";
            colorbutton.style.color = "white";
            break;
        case "default":
            colorbutton.innerHTML = "Default";
            colorbutton.style.background = "#313131";
            colorbutton.style.color = "white";
            break;
        default:
            alert("An error hapenned, please restart RLTrader. Error code: WCSCF");
            stop = true;
            break;
    }

    if(!stop) {
        $("#colorpicker").animate({ opacity: 0 }, "fast", function() {
            colorpicker.style.visibility = "hidden";
        });
        if(color == "default") {
            priceLabel.innerHTML = await doItemRequest(itemnameLabel.innerHTML.replace(" ", "_"), "", "currentPriceRange") + " Cr";
        } else {
            priceLabel.innerHTML = await doItemRequest(itemnameLabel.innerHTML.replace(" ", "_"), "/" + color, "currentPriceRange") + " Cr";
        }
        
    }
}

function addItemToInventory() {
    var itemnameLabel = document.getElementById('item-name');
    var colorbutton = document.getElementById('colorbutton');
    var priceLabel = document.getElementById('price');

    if(itemnameLabel.innerText != "An error happened") {
        if(colorbutton.innerText != "Choose a color") {
            var userDataPath = (electron.app || electron.remote.app).getPath('userData') + "/data/userdata.json";
            var userDataContent = JSON.parse(fs.readFileSync(userDataPath, 'utf-8').toString());

            var price;
            if(priceLabel.innerText == "No price yet.") { price = "/" } else { price = priceLabel.innerText.replace(" Cr", "") }

            var color;
            switch(colorbutton.innerText) {
                case "Black":
                    color = "black";
                    break;
                case "Titanium White":
                    color = "white";
                    break;
                case "Grey":
                    color = "grey";
                    break;
                case "Crimson":
                    color = "crimson";
                    break;
                case "Pink":
                    color = "pink";
                    break;
                case "Cobalt":
                    color = "cabalt";
                    break;
                case "Sky Blue":
                    color = "sblue";
                    break;
                case "Burnt Sienna":
                    color = "sienna";
                    break;
                case "Saffron":
                    color = "saffron";
                    break;
                case "Lime":
                    color = "lime";
                    break;
                case "Forest Green":
                    color = "fgreen";
                    break;
                case "Orange":
                    color = "orange";
                    break;
                case "Purple":
                    color = "purple";
                    break;
                default:
                    color = "";
                    break;
            }
            userDataContent.inventory.push({"name":itemnameLabel.innerText, "color":color,"displayColor":colorbutton.innerText, "cssColor":colorbutton.style.backgroundColor, "itemImage":document.getElementById('itemimage').src, "lastCreditPrice":price});
            fs.writeFileSync(userDataPath, JSON.stringify(userDataContent, null, 4));
            console.log("Added item :\"" + itemnameLabel.innerText + "\" to inventory.");
            pageLoad();

            $(".aiw-container").animate({ top: "-50px" }, "fast");
            $("#additemwindow").animate({ opacity: 0 }, "fast", function() {
                setTimeout(function () {
                    document.getElementById('additemwindow').style.visibility = "hidden";
                    document.getElementById('colorpicker').style.visibility = "hidden";
                    document.getElementById('iteminfo').style.visibility = "hidden";
                }, 500);
            });

            document.getElementById('alertbox-span').innerHTML = "Item successfully added to your inventory";
            $('.alertbox').css("background-color", "#2ecc71");
            $('.alertbox').animate({ opacity: 1 }, "fast", function() {
                setTimeout(function () {
                    $('.alertbox').animate({ opacity: 0 }, "fast");
                }, 5000);
            });
        }
        else {
            colorbutton.style.color = "red";
        }
    }
}