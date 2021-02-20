const electron = require("electron");
const fs = require("fs");
const { shell } = require('electron');

function pageLoad() {
    const dataFolderPath = (electron.app || electron.remote.app).getPath('userData');

    if(fs.existsSync(dataFolderPath + "/data/")) {
        var userDataPath = dataFolderPath + "/data/userdata.json";

        //GET INFO ERRORS FILE CREATION ------------------------------------
        var errorLogsPath = dataFolderPath + "/data/errorlogs.json";

        if(!fs.existsSync(errorLogsPath)) {
            console.log("File errorlogs.json not found, creating one..");

            var initialErrorContent = {errorlogs: []};
            fs.writeFileSync(errorLogsPath, JSON.stringify(initialErrorContent, null, 4),'utf-8');

        }
        // REMOVE AND NO MORE ERRORLOGS.JSON FILES ------------------------------------

        if(fs.existsSync(userDataPath)) {
            var userDataContent = JSON.parse(fs.readFileSync(userDataPath, 'utf-8').toString());

            document.getElementById("itemsearch").addEventListener("keyup", function(event) {
                if(event.key == 'Enter') {
                    event.preventDefault();
                    $(".search").click();
                } else if(event.key == 'Escape') {
                    addItemWindow();
                }
            });

            if(userDataContent.didFirstConnect != 1) {
                document.getElementById('welcome-screen').style.display = "block";
            }
            else {
                document.getElementById("f-username").innerText = userDataContent.username;
                var invContainer = document.getElementById("inv-container");
                invContainer.innerHTML = "";
                userDataContent.inventory.forEach(item => {
                    var itemDiv = document.createElement('div');
                    itemDiv.className = "item";
                    itemDiv.style.borderTop = "2px solid " + item.cssColor;
                    if(!userDataContent.settings.dashboardItemBorderColor) {
                        itemDiv.style.borderWidth = "0px";
                    }
                    itemDiv.align = "left";
                    itemDiv.id = "db-item" + item.id;
                    itemDiv.setAttribute("onclick", "selectItem(" + item.id + ")");
                    invContainer.appendChild(itemDiv);

                    var infoDiv = document.createElement('div');
                    infoDiv.className = "info";

                    var itemImage = document.createElement('img');
                    itemImage.src = item.itemImage;
                    itemImage.className = "itemimage";
                    itemImage.setAttribute("draggable", "false");
                    itemDiv.appendChild(itemImage);

                    var itemName = document.createElement('span');
                    itemName.innerHTML = item.name;
                    if(item.name.includes(":")) {
                        itemName.className = "bigitemname";
                    } else itemName.className = "itemname";
                    infoDiv.appendChild(itemName);

                    var itemColor = document.createElement('span');
                    itemColor.innerHTML = item.displayColor;
                    itemColor.className = "itemcolor";
                    itemColor.style.backgroundColor = item.cssColor;
                    if(item.color == "white" || item.color == "saffron") {
                        itemColor.style.color = "black";
                    }
                    infoDiv.appendChild(itemColor);

                    var itemPrice = document.createElement('span');
                    itemPrice.innerHTML = "Loading...";
                    itemPrice.className = "itemprice";
                    infoDiv.appendChild(itemPrice);

                    itemDiv.appendChild(infoDiv);

                    var selectContainer = document.createElement('div');
                    selectContainer.innerHTML = '<i class="far fa-square"></i>';
                    selectContainer.className = "selectcontainer";
                    selectContainer.id = "db-item-cb" + item.id;
                    itemDiv.appendChild(selectContainer);

                    setPriceForItemBubble(item.name, item.color, item.lastCreditPrice, itemPrice, item.id);
                
                });
                $("#inv-container").append("<br /><br /><br /><br />");

                new Sortable(invContainer, {
                    handle:'.item',
                    animation:200,
                    onUpdate: function() {
                        $('#inv-container').children('div').each(function () {
                            var itemId = $(this).attr('id');
                            if(document.getElementById(itemId).id.includes("db-item")) {
                                bringItemToFront(parseInt(itemId.replace("db-item", "")));
                            }
                        });
                        console.log("Saved order changes for inventory");
                    }
                });

                //some startup settings
                if(userDataContent.settings.hideToolbarAtStartupSetting) {
                    toggleToolbar();
                }
                if(!userDataContent.settings.headerAnimationSetting) {
                    document.getElementById("header-span-anim").style.opacity = 0;
                    document.getElementById("header-span-noanim").style.opacity = 1;
                }
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

function bringItemToFront(id) {
    var userDataPath = (electron.app || electron.remote.app).getPath('userData') + "/data/userdata.json";
    var userDataContent = JSON.parse(fs.readFileSync(userDataPath, 'utf-8').toString());

    var i = 0;
    var tempItem;
    userDataContent.inventory.forEach(item => {
        if(item.id == id) {
            tempItem = item;
            userDataContent.inventory.splice(i, 1);
        }
        i++;
    });

    if(tempItem) {
        userDataContent.inventory.push(tempItem);
    }

    fs.writeFileSync(userDataPath, JSON.stringify(userDataContent, null, 4));
}

var selectedItems = [];

function doItemAction(type) {
    if(selectedItems.length != 0) {
        var userDataPath = (electron.app || electron.remote.app).getPath('userData') + "/data/userdata.json";
        var userDataContent = JSON.parse(fs.readFileSync(userDataPath, 'utf-8').toString());
        switch(type) {
            case "fav":
                selectedItems.forEach(itemId => {
                    var isFav = getKeyForItem(itemId, "isFavorite");
                    if(isFav) modifyKeyForItem(itemId, "isFavorite", false);
                    else modifyKeyForItem(itemId, "isFavorite", true);
                    document.getElementById("db-item-cb" + itemId).innerHTML = '<i class="far fa-square"></i>';
                    document.getElementById("db-item-cb" + itemId).style.opacity = 0;
                });
                var isMult = "";
                if(selectedItems.length >= 2) isMult = "s";
                showAlert("Item" + isMult + " added/removed from favorites", "#2ecc71");
                selectItem("clear");
                break;
            case "del":
                selectedItems.forEach(itemId => {
                    var i = 0;
                    userDataContent.inventory.forEach(item => {
                        if(item.id == itemId) {
                            userDataContent.inventory.splice(i, 1);
                            $("#db-item" + itemId).fadeOut("fast", function() {
                                document.getElementById("db-item" + itemId).remove();
                            });
                        }
                        i++;
                   });
                });
                selectItem("clear");
                fs.writeFileSync(userDataPath, JSON.stringify(userDataContent, null, 4));
                showAlert("Item removed from your inventory", "#2ecc71");
                break;
            case "dup":
                
                break;
            case "edi":
                if(selectedItems.length == 1) { //can only edit one item at once
                    editItemWindow(selectedItems[0]);
                }
                break;
            default:
                break;
        }
    }
}

function selectItem(id) {
    var itemCheckbox = document.getElementById("db-item-cb" + id);
    var selectedTitle = document.getElementById("selectedtitle");
    var actionFav = document.getElementById("actionFav");
    var actionDel = document.getElementById("actionDel");
    var actionDup = document.getElementById("actionDup");
    var actionEdi = document.getElementById("actionEdi");

    if(id == "clear") {
        selectedItems = [];
        selectedTitle.innerHTML = "<i>No item selected</i>";
        selectedTitle.style.color = "rgb(201, 201, 201)";
        actionFav.style.color = "rgb(201, 201, 201)";
        actionDel.style.color = "rgb(201, 201, 201)";
        actionDup.style.color = "rgb(201, 201, 201)";
        actionEdi.style.color = "rgb(201, 201, 201)";
        actionFav.style.cursor = "not-allowed";
        actionDel.style.cursor = "not-allowed";
        actionDup.style.cursor = "not-allowed";
        actionEdi.style.cursor = "not-allowed";

        return;
    }

    if(itemCheckbox.innerHTML == '<i class="far fa-check-square"></i>') { //selected
        itemCheckbox.innerHTML = '<i class="far fa-square"></i>';
        itemCheckbox.style.removeProperty('opacity');
        selectedItems = selectedItems.filter(function(e) { return e !== id });
        if(selectedItems.length == 0) {
            selectedTitle.innerHTML = "<i>No item selected</i>";
            selectedTitle.style.color = "rgb(201, 201, 201)";
            actionFav.style.color = "rgb(201, 201, 201)";
            actionDel.style.color = "rgb(201, 201, 201)";
            actionDup.style.color = "rgb(201, 201, 201)";
            actionEdi.style.color = "rgb(201, 201, 201)";
            actionFav.style.cursor = "not-allowed";
            actionDel.style.cursor = "not-allowed";
            actionDup.style.cursor = "not-allowed";
            actionEdi.style.cursor = "not-allowed";
        }
        else if(selectedItems.length == 1) { 
            selectedTitle.innerHTML = selectedItems.length + " item selected";
            actionFav.style.color = "white";
            actionDel.style.color = "white";
            actionDup.style.color = "white";
            actionEdi.style.color = "white";
            actionFav.style.cursor = "pointer";
            actionDel.style.cursor = "pointer";
            actionDup.style.cursor = "pointer";
            actionEdi.style.cursor = "pointer";
        }
        else {
            selectedTitle.innerHTML = selectedItems.length + " items selected";
            actionFav.style.color = "white";
            actionDel.style.color = "white";
            actionDup.style.color = "white";
            actionEdi.style.color = "rgb(201, 201, 201)";
            actionFav.style.cursor = "pointer";
            actionDel.style.cursor = "pointer";
            actionDup.style.cursor = "pointer";
            actionEdi.style.cursor = "not-allowed";
        }
    } else {
        itemCheckbox.innerHTML = '<i class="far fa-check-square"></i>';
        itemCheckbox.style.opacity = 1;
        selectedItems.push(id);
        selectedTitle.style.color = "white";
        if(selectedItems.length == 1) {
            selectedTitle.innerHTML = selectedItems.length + " item selected";
            actionFav.style.color = "white";
            actionDel.style.color = "white";
            actionDup.style.color = "white";
            actionEdi.style.color = "white";
            actionFav.style.cursor = "pointer";
            actionDel.style.cursor = "pointer";
            actionDup.style.cursor = "pointer";
            actionEdi.style.cursor = "pointer";
        }
        else {
            selectedTitle.innerHTML = selectedItems.length + " items selected";
            actionFav.style.color = "white";
            actionDel.style.color = "white";
            actionDup.style.color = "white";
            actionEdi.style.color = "rgb(201, 201, 201)";
            actionFav.style.cursor = "pointer";
            actionDel.style.cursor = "pointer";
            actionDup.style.cursor = "pointer";
            actionEdi.style.cursor = "not-allowed";
        }
    }
}

async function setPriceForItemBubble(name, color, oldPrice, priceSpan, id) {
    var reqName = name.replace(" :", "").replaceAll(" ", "_").replace("-", "_").replace(":", "");
    var reqColor;
    if(color == "") {
        reqColor = "";
    } else {
        reqColor = "/" + color;
    }
    var price = await doItemRequest(reqName, reqColor, "currentPriceRange") + " Cr";
    if(price == "No price yet. Cr") { price = price.replace(" Cr", ""); }
    if(price == "no Cr") price = "Error";
    priceSpan.innerHTML = price;

    if(oldPrice.includes(' - ')) {
        oldPrice = oldPrice.replace(" - ", ":");
        oldPrice.split(':');
        oldPrice = oldPrice[0] + oldPrice[1];
        if(price.includes(' - ')) {
            price = price.replace(" - ", ":");
            price.split(':');
            if(price[0].includes("k")) {
                price[0].replace("k", "");
                price[0] = parseInt(price[0] * 1000);
            }
            if(price[1].includes("k")) {
                price[1].replace("k", "");
                price[1] = parseInt(price[1] * 1000);
            }
            price = price[0] + price[1];
            if(price > oldPrice) {
                priceSpan.style.color = "green";
            }
            else if(price < oldPrice) {
                priceSpan.style.color = "red";
            }
        }
    } else {
        if(price.includes(" - ")) {
            modifyKeyForItem(id, "lastCreditPrice", price);
        }
    }
}

function getKeyForItem(id, key) {
    var userDataPath = (electron.app || electron.remote.app).getPath('userData') + "/data/userdata.json";
    var userDataContent = JSON.parse(fs.readFileSync(userDataPath, 'utf-8').toString());

    var done;
    userDataContent.inventory.forEach(item => {
        if(item.id == id) {
            done = item[key];
        }
    });

    return done;
}


function modifyKeyForItem(id, key, value) {
    var userDataPath = (electron.app || electron.remote.app).getPath('userData') + "/data/userdata.json";
    var userDataContent = JSON.parse(fs.readFileSync(userDataPath, 'utf-8').toString());

    userDataContent.inventory.forEach(item => {
        if(item.id == id) {
            item[key] = value;
        }
    });
    
    fs.writeFileSync(userDataPath, JSON.stringify(userDataContent, null, 4));
}

function startConfig(type) {
    var online_btn = document.getElementById('online-btn');
    var offline_btn = document.getElementById('offline-btn');
    var question_teller = document.getElementById('questionteller');
    var username_field = document.getElementById('lc-username-field');
    if(type == "online") {
        online_btn.innerHTML = "Coming Soon";
    } else if(type == "offline") {
        $("#questionteller").animate({ opacity: 0 }, function() {
            question_teller.innerHTML = "Alright, how do you want us to call you?";
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
            userDataContent.settings = {};
            
            fs.writeFileSync(userDataPath, JSON.stringify(userDataContent, null, 4));

            setTimeout(function () {
                $("#welcome-screen").fadeOut("fast");
            }, 2000);
        }
    }
}

function saveEditItem(item) {
    var willBeFav;
    var newPrice = "";
    if(document.getElementById("editfav").style.backgroundColor == "rgb(0, 184, 148)") {
        willBeFav = true;
    } else {
        willBeFav = false;
    }

    modifyKeyForItem(item, "displayColor", document.getElementById("editcolorbutton").innerText);
    modifyKeyForItem(item, "itemImage", document.getElementById("edititemimage").src);
    modifyKeyForItem(item, "cssColor", document.getElementById("editcolorbutton").style.backgroundColor);
    
    switch(document.getElementById("editcolorbutton").innerText) {
        case "Black":
            modifyKeyForItem(item, "color", "black");
            break;
        case "Titanium White":
            modifyKeyForItem(item, "color", "white");
            break;
        case "Grey":
            modifyKeyForItem(item, "color", "grey");
            break;
        case "Crimson":
            modifyKeyForItem(item, "color", "crimson");
            break;
        case "Pink":
            modifyKeyForItem(item, "color", "pink");
            break;
        case "Cobalt":
            modifyKeyForItem(item, "color", "cobalt");
            break;
        case "Sky Blue":
            modifyKeyForItem(item, "color", "sblue");
            break;
        case "Burnt Sienna":
            modifyKeyForItem(item, "color", "sienna");
            break;
        case "Saffron":
            modifyKeyForItem(item, "color", "saffron");
            break;
        case "Lime":
            modifyKeyForItem(item, "color", "lime");
            break;
        case "Forest Green":
            modifyKeyForItem(item, "color", "fgreen");
            break;
        case "Orange":
            modifyKeyForItem(item, "color", "orange");
            break;
        case "Purple":
            modifyKeyForItem(item, "color", "purple");
            break;
        default:
            modifyKeyForItem(item, "color", "");
            break;
    }

    if(document.getElementById("editpricelabel").innerText.includes("Price will be changed to:")) {
        var editprice = document.getElementById("editprice");
        if(editprice.innerText.includes("Cr")) {
            if(!editprice.innerText.includes("-")) { //only one price
                newPrice = editprice.innerText.replace(" Cr", "") + " - " + editprice.innerText.replace(" Cr", "");
            } else {
                newPrice = editprice.innerText.replace(" Cr", "");
            }
        } else if(editprice.innerText == "Enter a complete span") {
            editprice.style.color = "red";
        }
    }

    modifyKeyForItem(item, "isFavorite", willBeFav);
    if(newPrice != "") modifyKeyForItem(item, "lastCreditPrice", newPrice);

    selectedItems.forEach(itemId => {
        document.getElementById("db-item-cb" + itemId).innerHTML = '<i class="far fa-square"></i>';
        document.getElementById("db-item-cb" + itemId).style.opacity = 0;
    });

    selectItem("clear");
    editItemWindow('');
    showAlert("Item successfully edited", "#2ecc71");
    pageLoad();
}

var editPriceOption = 1; //1 = dont do anything, 2 = reset to current, 3 = custom span

async function editPriceType(option) {
    var sameOption = false;
    for (var i = 1; i < 4 ; i++) {
        var radio = document.getElementById("price-radio" + i);
        if(i == option) { //this is the selected radio
            if(radio.innerHTML.includes("check") && option == 2) sameOption = true;
            radio.style.backgroundColor = "#00b894";
            radio.innerHTML = radio.innerHTML.replace('<i class="far fa-square"></i>', '<i class="far fa-check-square"></i>');
        } else {
            radio.style.backgroundColor = "#ff6b81";
            radio.innerHTML = radio.innerHTML.replace('<i class="far fa-check-square"></i>', '<i class="far fa-square"></i>');
        }
    }

    if(!sameOption) {
        switch(option) {
            case 1: //dont do anything
                document.getElementById("editpricelabel").innerHTML = document.getElementById("editpricelabel").innerHTML.replace("Price will be changed to: ", "Price will not be changed");
                document.getElementById("editprice").innerText = "";
                break;
            case 2: //reset to current price
                document.getElementById("editpricelabel").innerHTML = document.getElementById("editpricelabel").innerHTML.replace("Price will not be changed", "Price will be changed to: ");
                document.getElementById("editprice").innerText = "Loading...";               
                var color = document.getElementById("editcolorbutton").innerText.toLowerCase().replace("titanium white", "white").replace("forest green", "fgreen").replace("burnt sienna", "sienna").replace("sky blue", "sblue");

                if(color == "default") {
                    var itemPrice = await doItemRequest(document.getElementById("edititem-name").innerHTML.replaceAll(" ", "_").replace("-", "_").replace(":", "_").replace("__", "_"), "", "currentPriceRange") + " Cr";
                } else {
                    var itemPrice = await doItemRequest(document.getElementById("edititem-name").innerHTML.replaceAll(" ", "_").replace("-", "_").replace(":", "_").replace("__", "_"), "/" + color, "currentPriceRange") + " Cr";
                }

                document.getElementById("editprice").innerText = itemPrice;
                
                break;
            case 3: //custom price span
                document.getElementById("editpricelabel").innerHTML = document.getElementById("editpricelabel").innerHTML.replace("Price will not be changed", "Price will be changed to: ");
                document.getElementById("editprice").innerText = "Enter a complete span";
                break;
            default:
                break;
        }
    }

    if(option == 3) {
        document.getElementById("price-right").style.opacity = 1;
        document.getElementById("edit-pricespan1").disabled = false;
        document.getElementById("edit-pricespan2").disabled = false;
    } else {
        document.getElementById("price-right").style.opacity = 0.5;
        document.getElementById("edit-pricespan1").disabled = true;
        document.getElementById("edit-pricespan2").disabled = true;
    }

    editPriceOption = option;
}

function editPriceSpan() {
    var span1 = document.getElementById("edit-pricespan1");
    var span2 = document.getElementById("edit-pricespan2");
    var editPriceLabel = document.getElementById("editprice");

    var spanVal1 = Math.round(parseInt(span1.value) / 10) * 10;
    var spanVal2 = Math.round(parseInt(span2.value) / 10) * 10;

    if(spanVal1 == 0) spanVal1 = 10;
    if(spanVal2 == 0) spanVal2 = 10;

    if(span1.value == "" || span2.value == "") {
        editPriceLabel.innerText = "Enter a complete span";
    } else {
        if(spanVal1 == spanVal2) {
            editPriceLabel.innerText = spanVal1 + " Cr";
        } else if(spanVal1 > spanVal2) {
            editPriceLabel.innerText = spanVal2 + " - " + spanVal1 + " Cr";
        } else {
            editPriceLabel.innerText = spanVal1 + " - " + spanVal2 + " Cr";
        }
    }
}

function editFav() {
    if(document.getElementById("editfav").style.backgroundColor == "rgb(0, 184, 148)") { //yes
        document.getElementById("editfav").style.backgroundColor = "rgb(255, 107, 129)"; //red
        document.getElementById("editfav-indicator").innerHTML = '<i class="fas fa-times"></i>';
    } else { //no
        document.getElementById("editfav").style.backgroundColor = "rgb(0, 184, 148)"; //red
        document.getElementById("editfav-indicator").innerHTML = '<i class="fas fa-check"></i>';
    }

}

function colorPicker(number) {
    var cp = document.getElementById('colorpicker' + number); //cp iteminfo
    if(cp.style.visibility == "visible") {
        $("#colorpicker" + number).animate({ opacity: 0 }, "fast", function() {
            cp.style.visibility = "hidden";
        });
    } else { //hidden
        cp.style.visibility = "visible";
        cp.style.opacity = 0;
        $("#colorpicker" + number).animate({ opacity: 1 }, "fast");
    }
}

async function selectColor(color, alternate) {
    var colorbutton = document.getElementById(alternate + 'colorbutton');
    var priceLabel = document.getElementById(alternate + 'price');
    if(alternate != "") var colorpicker = document.getElementById('colorpicker1');
    else var colorpicker = document.getElementById('colorpicker');
    
    var itemnameLabel = document.getElementById(alternate + 'item-name');
    var itemImage = document.getElementById(alternate + 'itemimage');

    $("#" + alternate +"itemimage").animate({ opacity: 0 }, "fast");
    var itemNameSearch = itemnameLabel.innerText.replace(" : ", "_").replace("-", "_").replaceAll(" ", "_").replace(":", "");
    var itemImageURL = await doItemRequest(itemNameSearch, "/" + color.replace("default", ""), true);
    itemImageURL = itemImageURL.substring(itemImageURL.indexOf("<img src=\"https://img.rl.insider.gg/itemPics/large/") + 10);
    try {
        itemImage.src = itemImageURL.substring(0, itemImageURL.indexOf('"'));
    } catch (error) {
        var errorLogsPath = (electron.app || electron.remote.app).getPath('userData') + "/data/errorlogs.json";
        var errorLogsContent = JSON.parse(fs.readFileSync(errorLogsPath, 'utf-8').toString());
        errorLogsContent.errorlogs.push({"Function":"SelectColor","Reason":"Getting image src","Log":itemImageURL});
        fs.writeFileSync(userDataPath, JSON.stringify(errorLogsContent, null, 4));
    }

        $("#" + alternate +"itemimage").animate({ opacity: 1 }, "fast");
    switch(color) {
        case "black":
            colorbutton.innerHTML = "Black";
            colorbutton.style.background = "black";
            colorbutton.style.color = "white";
            break;
        case "white":
            colorbutton.innerHTML = "Titanium White";
            if(alternate != "") colorbutton.style.background = "#dbdbdb";
            else colorbutton.style.background = "white";
            colorbutton.style.color = "black";
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
            showAlert("An error hapenned, please restart RLTrader. Error code: WCSCF", "#e74c3c");
            return;
    }

    if(alternate != "") var colorpicker1 = "#colorpicker1";
    else var colorpicker1 = "#colorpicker";
    $(colorpicker1).animate({ opacity: 0 }, "fast", function() {
        colorpicker.style.visibility = "hidden";
    });
    if(color == "default") {
        var itemPrice = await doItemRequest(itemnameLabel.innerHTML.replaceAll(" ", "_").replace(":_", "").replace("-", "_").replace(":", "_").replace("__", "_"), "", "currentPriceRange") + " Cr";
    } else {
        var itemPrice = await doItemRequest(itemnameLabel.innerHTML.replaceAll(" ", "_").replace(":_", "").replace("-", "_").replace(":", "_").replace("__", "_"), "/" + color, "currentPriceRange") + " Cr";
    }
    if(alternate == "edit") {
        editPriceType(2);
    }
    if(alternate != "" && editPriceOption != 2) return;
    priceLabel.innerHTML = itemPrice.replace("yet. Cr", "yet.").replace("no Cr", "Error");
    if(priceLabel.innerHTML.includes("Error")) {
        var errorLogsPath = (electron.app || electron.remote.app).getPath('userData') + "/data/errorlogs.json";
        var errorLogsContent = JSON.parse(fs.readFileSync(errorLogsPath, 'utf-8').toString());
        errorLogsContent.errorlogs.push({"Function":"SelectColor","Reason":"Getting price","Log":itemPrice});
        fs.writeFileSync(errorLogsPath, JSON.stringify(errorLogsContent, null, 4));
    }
}

function addItemToInventory() {
    var itemnameLabel = document.getElementById('item-name');
    var colorbutton = document.getElementById('colorbutton');
    var priceLabel = document.getElementById('price');

    if(itemnameLabel.innerText != "An error happened") {
        if(colorbutton.innerText != "Choose a color") {
            if(priceLabel.innerText != "Please select a color" && priceLabel.innerText != "no Cr" && priceLabel.innerText != "Error") {
                var userDataPath = (electron.app || electron.remote.app).getPath('userData') + "/data/userdata.json";
                var userDataContent = JSON.parse(fs.readFileSync(userDataPath, 'utf-8').toString());

                var price;
                if(priceLabel.innerText == "No price yet.") { price = "/" } else { price = priceLabel.innerText.replace(" Cr", ""); }

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
                        color = "cobalt";
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

                userDataContent.inventory.push({"name":itemnameLabel.innerText, "id":userDataContent.idIncrement + 1, "color":color,"displayColor":colorbutton.innerText, "cssColor":colorbutton.style.backgroundColor, "itemImage":document.getElementById('itemimage').src, "lastCreditPrice":price, "isFavorite":false});
                userDataContent.idIncrement++;
                fs.writeFileSync(userDataPath, JSON.stringify(userDataContent, null, 4));
                console.log("Added item: \"" + itemnameLabel.innerText + "\" to inventory.");
                pageLoad();

                $(".aiw-container").animate({ top: "-50px" }, "fast");
                $("#additemwindow").animate({ opacity: 0 }, "fast", function() {
                    setTimeout(function () {
                        document.getElementById('additemwindow').style.visibility = "hidden";
                        document.getElementById('colorpicker').style.visibility = "hidden";
                        document.getElementById('iteminfo').style.visibility = "hidden";
                        document.querySelector("footer").style.zIndex = 0;
                    }, 500);
                });

                showAlert("Item added to your inventory", "#2ecc71");
            } else {
                showAlert("An error happened, please contact an administrator. Error code: NFPAI", "#e74c3c");
            }
        } else {
            showAlert("Please select a color", "#e74c3c");
        }
    }
}

function settingsCheckbox(id) {
    var checkbox = document.getElementById(id);

    if(checkbox.style.backgroundColor == "rgb(0, 184, 148)") {  //will be disabled
        checkbox.style.backgroundColor = "rgb(255, 107, 129)";
        checkbox.innerHTML = 'Disabled<i class="fas fa-times"></i>';
        setSettingValue(id, false);
    } else { //will be enabled
        checkbox.style.backgroundColor = "rgb(0, 184, 148)";
        checkbox.innerHTML = 'Enabled<i class="fas fa-check"></i>';
        setSettingValue(id, true);
    }
}

function getSettingValue(setting) {
    var userDataPath = (electron.app || electron.remote.app).getPath('userData') + "/data/userdata.json";
    var userDataContent = JSON.parse(fs.readFileSync(userDataPath, 'utf-8').toString());

    return userDataContent.settings[setting];
}

function setSettingValue(setting, value) {
    var userDataPath = (electron.app || electron.remote.app).getPath('userData') + "/data/userdata.json";
    var userDataContent = JSON.parse(fs.readFileSync(userDataPath, 'utf-8').toString());
    userDataContent.settings[setting] = value;
    fs.writeFileSync(userDataPath, JSON.stringify(userDataContent, null, 4));
    console.log("Settings updated.");

    //applying changes live
    switch(setting) {
        case "headerAnimationSetting":
            if(value) {
                $("#header-span-anim").animate({ opacity: 1 }, "fast", function() {
                    document.getElementById("header-span-noanim").style.opacity = 0;
                });
            } else {
                document.getElementById("header-span-anim").style.opacity = 0;
                document.getElementById("header-span-noanim").style.opacity = 1;
            }
            break;
        case "dashboardItemBorderColor":
            $('#inv-container').children('div').each(function () {
                var itemId = $(this).attr('id');
                if(document.getElementById(itemId).id.includes("db-item")) {
                    if(value) document.getElementById(itemId).style.borderWidth = "2px";
                    else document.getElementById(itemId).style.borderWidth = "0px";
                }
            });
            break;
        case "autoHideToolbarSetting":
            //TODO
            break;
        default:
            break;
    }
}

function changeInventorySortingType() { //GOTTA FINISH
    var sortingTypeIcon = document.getElementById("sorting-type-icon");

    if(sortingTypeIcon.className == "fas fa-th-large") { //bubbles mode
        $("#sorting-type-icon").animate({ opacity: 0 }, "fast", function() {
            sortingTypeIcon.className = "fas fa-th-list";
            $("#sorting-type-icon").animate({ opacity: 0.8 }, "fast");
        });
        
    } else { //list mode
        $("#sorting-type-icon").animate({ opacity: 0 }, "fast", function() {
            sortingTypeIcon.className = "fas fa-th-large";
            $("#sorting-type-icon").animate({ opacity: 0.8 }, "fast");
        });
    }
}

function resetInventory() {
    //USE CAREFULLY
    showDialog("close");
    //has we are in settings we have to close the window
    settingsWindow();
    var userDataPath = (electron.app || electron.remote.app).getPath('userData') + "/data/userdata.json";
    var userDataContent = JSON.parse(fs.readFileSync(userDataPath, 'utf-8').toString());
    userDataContent.inventory = [];
    fs.writeFileSync(userDataPath, JSON.stringify(userDataContent, null, 4));
    showAlert("Your inventory has been reset", "#2ecc71");
    pageLoad(); //reloading page
}

function showAlert(text, backgroundColor) {
    document.getElementById('alertbox-span').innerHTML = text;
    $('.alertbox').css("background-color", backgroundColor);
    $('.alertbox').animate({ opacity: 1 }, "fast", function() {
        setTimeout(function () {
            $('.alertbox').animate({ opacity: 0 }, "fast");
        }, 5000);
    });
}

function showDialog(action, title, subtitle, confirmAction) {
    var titleSpan = document.getElementById("dialog-titlespan");
    var subtitleDiv = document.getElementById("dialog-subtitle");
    var confirmButton = document.getElementById("dialog-confirm");
    switch(action) {
        case "close":
            confirmButton.removeAttribute("onclick");
            $('.dialogbox-container').animate({ opacity: 0 }, "fast", function() {
                titleSpan.innerText = "An error happened";
                subtitleDiv.innerText = "An error happened";
                $('.dialogbox-container').css("display", "none");
            });
            break;
        case "show":
            $('.dialogbox-container').css("display", "block");
            titleSpan.innerText = title;
            subtitleDiv.innerText = subtitle;
            confirmButton.setAttribute("onclick", confirmAction);
            $('.dialogbox-container').animate({ opacity: 1 }, "fast");
            break;
    }
}