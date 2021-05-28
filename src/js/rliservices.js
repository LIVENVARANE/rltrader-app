async function searchForItem() {
    var itemsearch = document.getElementById('itemsearch').value.toLowerCase();
    if(itemsearch == "") { return; }

    var iteminfo = document.getElementById('iteminfo');
    var itemnameLabel = document.getElementById('item-name');
    var itemimage = document.getElementById('itemimage');
    var colorbutton = document.getElementById('colorbutton');
    var colorpicker = document.getElementById('colorpicker');
    var typeRarityLabel = document.getElementById('typerarity');
    var aiwLoadingWheel = document.getElementById('aiw-loading');
    var priceLabel = document.getElementById('price');

    colorpicker.style.visibility = "hidden";
    iteminfo.style.visibility = "hidden";
    aiwLoadingWheel.style.visibility = "visible";

    //determining what color the user specifies (if he specifies one)
    itemsearch = itemsearch.replaceAll(" ", "_");
    itemsearch = itemsearch.replaceAll(":", "");
    if(itemsearch.includes('/')) {
        var itemcolor = itemsearch.substring(itemsearch.indexOf("/") + 1).toLowerCase();
        switch(itemcolor) {
            case "black":
                itemcolor = "/" + itemcolor;
                break;
            case "white":
                itemcolor = "/" + itemcolor;
                break;
            case "tw":
                itemcolor = "/white";
                break;
            case "titanium_white":
                itemcolor = "/white";
                break;
            case "grey":
                itemcolor = "/" + itemcolor;
                break;
            case "gray":
                itemcolor = "/grey";
                break;
            case "crimson":
                itemcolor = "/" + itemcolor;
                break;
            case "pink":
                itemcolor = "/" + itemcolor;
                break;
            case "cobalt":
                itemcolor = "/" + itemcolor;
                break;
            case "sblue":
                itemcolor = "/" + itemcolor;
                break;
            case "sb":
                itemcolor = "/sblue";
                break;
            case "sky_blue":
                itemcolor = "/sblue";
                break;
            case "sienna":
                itemcolor = "/" + itemcolor;
                break;
            case "bs":
                itemcolor = "/sienna";
                break;
            case "burnt_sienna":
                itemcolor = "/sienna";
                break;
            case "saffron":
                itemcolor = "/" + itemcolor;
                break;
            case "lime":
                itemcolor = "/" + itemcolor;
                break;
            case "fgreen":
                itemcolor = "/" + itemcolor;
                break;
            case "fg":
                itemcolor = "/fgreen";
                break;
            case "forest_green":
                itemcolor = "/fgreen";
                break;
            case "orange":
                itemcolor = "/" + itemcolor;
                break;
            case "purple":
                itemcolor = "/" + itemcolor;
                break;
            case "default":
                itemcolor = "/default";
                break;
            default:
                itemcolor = "";
                break;
        }
        itemsearch = itemsearch.replace(/\/.*/,'');
    }
    else { itemcolor = ""; }
    //now we have the users wanted color
    //checking every color availability

    var availableColors = "";
    availableColors = availableColors + " " + await doItemRequest(itemsearch, "/black");
    availableColors = availableColors + " " + await doItemRequest(itemsearch, "/white");
    availableColors = availableColors + " " + await doItemRequest(itemsearch, "/grey");
    availableColors = availableColors + " " + await doItemRequest(itemsearch, "/crimson");
    availableColors = availableColors + " " + await doItemRequest(itemsearch, "/pink");
    availableColors = availableColors + " " + await doItemRequest(itemsearch, "/cobalt");
    availableColors = availableColors + " " + await doItemRequest(itemsearch, "/sblue");
    availableColors = availableColors + " " + await doItemRequest(itemsearch, "/sienna");
    availableColors = availableColors + " " + await doItemRequest(itemsearch, "/saffron");
    availableColors = availableColors + " " + await doItemRequest(itemsearch, "/lime");
    availableColors = availableColors + " " + await doItemRequest(itemsearch, "/fgreen");
    availableColors = availableColors + " " + await doItemRequest(itemsearch, "/orange");
    availableColors = availableColors + " " + await doItemRequest(itemsearch, "/purple");
    availableColors = availableColors + " " + await doItemRequest(itemsearch, "");
    availableColors = availableColors.replaceAll(" no", ""); //we get all the colors that exists for that item

    if(availableColors == "") {
        showAlert("This item does not exist or it is not tradeable, make sure you typed the name correctly.", "#e74c3c");
        aiwLoadingWheel.style.visibility = "hidden";
    } else {
        var stockAC = availableColors.toLowerCase().replace("titanium white", "white").replace("forest green", "fgreen").replace("burnt sienna", "sienna").replace("sky blue", "sblue").substring(1);
        var stockAC_withDefault = stockAC; //before removing default
        if(stockAC == " default") {
            var emptyReq = JSON.parse(await doItemRequest(itemsearch, "", "empty"));
        } else {
            stockAC = stockAC.replace("default", "");
            var emptyReq = JSON.parse(await doItemRequest(itemsearch, "/" + stockAC.split(" ")[0], "empty"));
        }

        itemname = emptyReq['itemName'];

        //decalCar gives the car the decal is made for (if applicable, otherwise its an empty string)
        var decalCar = emptyReq['itemNameTranslated_base'];
        if(decalCar == null) decalCar = '';
        else decalCar = decalCar + ': ';

        if(itemcolor == "") {
            if(stockAC_withDefault.includes("default")) {
                var blankRequest = await doItemRequest(itemsearch, "", true);
            } else {
                var blankRequest = await doItemRequest(itemsearch, "/" + stockAC.split(" ")[0], true);
            }
        } else if(stockAC.includes(itemcolor.replace("/", ""))) {
            var blankRequest = await doItemRequest(itemsearch, itemcolor, true);
        } else {
            var blankRequest = await doItemRequest(itemsearch, "/" + stockAC.split(" ")[0], true);
        }

        var rarity = blankRequest;
        var type = blankRequest;
        var specialEditionName = emptyReq['itemNameTranslated_edition'];
        if(specialEditionName == null) specialEditionName = '';
        else specialEditionName = ' : ' + specialEditionName;
        
        rarity = rarity.substring(rarity.indexOf("<td>Rarity</td><td>") + 19);
        rarity = rarity.substring(0, rarity.indexOf('</td></tr><tr><td>Type</td>'));
        type = type.substring(type.indexOf("<td>Type</td><td>") + 17)
        type = type.substring(0, type.indexOf('</td></tr><tr><td>Series</td>'));
        if(rarity.includes("Black Market")) {
            itemPicURL = blankRequest.substring(blankRequest.indexOf("<video src=\"https://img.rl.insider.gg/itemPics/mp4/") + 12);
            itemPicURL = itemPicURL.substring(0, itemPicURL.indexOf('"'));
        } else {
            itemPicURL = blankRequest.substring(blankRequest.indexOf("<img src=\"https://img.rl.insider.gg/itemPics/large/") + 10);
            itemPicURL = itemPicURL.substring(0, itemPicURL.indexOf('"'));
        }

        //SHOWING WINDOW OF ITEM
        aiwLoadingWheel.style.visibility = "hidden";
        iteminfo.style.visibility = "visible";
        iteminfo.style.opacity = 0;
        $("#iteminfo").animate({ opacity: 1 }, "fast");
        if(rarity.includes("Black Market")) { //if item is a bm, rlinsider now only has mp4 videos of the item
            var videoElement = document.createElement('video');
            videoElement.id = "itemimage";
            itemimage.parentNode.replaceChild(videoElement, itemimage);
            videoElement.src = itemPicURL;
            videoElement.style.opacity = 1;
            videoElement.setAttribute("autoplay", "");
            videoElement.setAttribute("loop", "");
            videoElement.setAttribute("draggable", "false");
        } else {
            var imageElement = document.createElement('img');
            imageElement.id = "itemimage";
            itemimage.parentNode.replaceChild(imageElement, itemimage);
            imageElement.src = itemPicURL;
            imageElement.style.opacity = 1;
            imageElement.setAttribute("draggable", "false");
        }

        itemnameLabel.innerHTML = decalCar + itemname + specialEditionName;
        if(itemnameLabel.innerHTML.includes(":")) {
            itemnameLabel.style.fontSize = "25px";
        } else {
            itemnameLabel.style.fontSize = "40px";
        }
        switch(rarity) {
            case "Uncommon":
                typeRarityLabel.style.background = "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(62,110,125,1) 100%)";
                break;
            case "Rare":
                typeRarityLabel.style.background = "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(63,84,131,1) 100%)";
                break;
            case "Very Rare":
                typeRarityLabel.style.background = "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(84,67,133,1) 100%)";
                break;
            case "Import":
                typeRarityLabel.style.background = "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(164,61,54,1) 100%)";
                rarity = "Imported";
                break;
            case "Exotic":
                typeRarityLabel.style.background = "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(163,151,71,1) 100%)";
                break;
            case "Black Market":
                typeRarityLabel.style.background = "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(152,0,150,1) 100%)";
                break;
            case "Limited":
                typeRarityLabel.style.background = "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(156,71,34,1) 100%)";
                break;
            default:
                typeRarityLabel.style.background = "#e2e2e2";
                break;
        }
        typeRarityLabel.innerHTML = rarity + " " + type;
        document.getElementById('itemsearch').value = "";
        if(availableColors.toLowerCase().includes(itemcolor.replace("sblue", "sky blue").replace("white", "titanium white").replace("fgreen", "forest green").replace("sienna", "burnt sienna").replace("/", "")) && itemcolor != "") {
            switch(itemcolor) { //we know that the color the user has choosen exists, now we check what it is to select it
                case "/black":
                    colorbutton.innerHTML = "Black";
                    colorbutton.style.background = "black";
                    colorbutton.style.color = "white";
                    break;
                case "/white":
                    colorbutton.innerHTML = "Titanium White";
                    colorbutton.style.background = "white";
                    break;
                case "/grey":
                    colorbutton.innerHTML = "Grey";
                    colorbutton.style.background = "grey";
                    break;
                case "/crimson":
                    colorbutton.innerHTML = "Crimson";
                    colorbutton.style.background = "#de1b1b";
                    break;
                case "/pink":
                    colorbutton.innerHTML = "Pink";
                    colorbutton.style.background = "pink";
                    break;
                case "/cobalt":
                    colorbutton.innerHTML = "Cobalt";
                    colorbutton.style.background = "#1b5cde";
                    break;
                case "/sblue":
                    colorbutton.innerHTML = "Sky Blue";
                    colorbutton.style.background = "#09e9ed";
                    break;
                case "/sienna":
                    colorbutton.innerHTML = "Burnt Sienna";
                    colorbutton.style.background = "brown";
                    break;
                case "/saffron":
                    colorbutton.innerHTML = "Saffron";
                    colorbutton.style.background = "yellow";
                    colorbutton.style.color = "black";
                    break;
                case "/lime":
                    colorbutton.innerHTML = "Lime";
                    colorbutton.style.background = "#07eb12";
                    break;
                case "/fgreen":
                    colorbutton.innerHTML = "Forest Green";
                    colorbutton.style.background = "#0d7522";
                    break;
                case "/orange":
                    colorbutton.innerHTML = "Orange";
                    colorbutton.style.background = "orange";
                    break;
                case "/purple":
                    colorbutton.innerHTML = "Purple";
                    colorbutton.style.background = "purple";
                    break;
                case "/default":
                    colorbutton.innerHTML = "Default";
                    colorbutton.style.background = "#313131";
                    colorbutton.style.color = "white";
                    itemcolor = ""; //for the price var just under
            }

            var price = emptyReq['currentPriceRange']; //will set the price for the color the user has specified
            if(price == "No price yet. Cr") { price = price.replace(" Cr", ""); }
        }
        else {
            if(availableColors == " Default") { //the does not have any colors available (only default)
                colorbutton.innerHTML = "Default";
                colorbutton.style.background = "#313131";
                colorbutton.style.color = "white";
                var price = JSON.parse(await doItemRequest(itemsearch, '', 'empty'));
                price = price['currentPriceRange'] + ' Cr'; //getting the price for the default color
                if(price == "No price yet. Cr") { price = price.replace(" Cr", ""); }
            } else {
                colorbutton.innerHTML = "Choose a color";
                colorbutton.style.background = "linear-gradient(to right, #4776E6, #8e54e9)";
                colorbutton.style.color = "white";
                var price = "Please select a color";
                if(itemcolor != "") { //the user specified a color but it does not exists
                    showAlert("The color you specified does not exists for this item." , "#e74c3c");
                }
            }
        }

        priceLabel.innerHTML = price;

        //removing colors in the colorpicker that does not exist for this item
        var colorListItems = document.getElementsByClassName("listitem");
        for(var i = 0; i < colorListItems.length; i++) {
            colorListItems[i].style.display = "none";
        }

        stockAC_withDefault.split(" ").forEach(color => {
            document.getElementById("cp-" + color).style.display = "list-item";
            document.getElementById("cp-" + color).setAttribute('onclick', 'selectColor("' + color + '", "")');
        });
    }
}
                                                 //IF SPECIFIER = TRUE => WILL RETURN RAW RESPONSE
function doItemRequest(item, color, specifier) { //item found, will output color name (default if no color specified), item not found, will output no AND if specifier is defined, will output the specifier for the item
    return new Promise(resolve => {
        const http = new XMLHttpRequest();
        const url='https://rl.insider.gg/en/pc/' + item + color;
        http.open("GET", url, !(!this));
        http.setRequestHeader("upgrade-insecure-requests", "1");
        http.setRequestHeader("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9");
        http.setRequestHeader("accept-language", "en-US;q=0.9,en;q=0.8");
        http.send();
        
        http.onerror = function() {
            showAlert("There where an error while getting item info, please verify your internet connection.", "#e74c3c");
            return;
        }

        http.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200) {
                var resp = http.responseText;
                if(specifier == true) {
                    resolve(resp);
                } else {
                    if(resp.includes("var itemData = {\"itemName\":\"")) { //this item with this color exists
                        if(specifier === undefined) {
                            if(color == "") { //no color were specified
                                resolve("Default");
                            } else {
                                resp = resp.substring(resp.lastIndexOf(",\"itemColor\":\"") + 14);
                                resolve(resp.substring(0, resp.indexOf('"')));
                            }
                        }
                        else if(specifier == "empty") {
                            resp = resp.substring(resp.indexOf("var itemData = {") + 15);
                            resolve(resp.substring(0, resp.indexOf("};")) + "}");
                        }
                    } else { //this item with this color does not exists
                        resolve("no");
                    }
                }
            }
        }
    });
}