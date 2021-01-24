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
    var sw = document.getElementById("settingswindow");
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

async function editItemWindow(itemToLoad) {
    var eiw = document.getElementById("edititemwindow");
    var itemNameLabel = document.getElementById("edititem-name");
    var itemImage = document.getElementById("edititemimage");
    var priceLabel = document.getElementById("editprice");
    var colorpicker = document.getElementById("colorpicker1");

    if(eiw.style.visibility == "visible") {
        $("#edititemwindow").animate({ opacity: 0 }, "fast", function() {
            setTimeout(function () {
                eiw.style.visibility = "hidden";
                document.querySelector("footer").style.zIndex = 0;
            }, 100);
        });
        
        itemNameLabel.innerText = "Loading...";
        itemImage.src = "";

        var colorListItems = document.getElementsByClassName('editlistitem');
        for(var i = 0; i < colorListItems.length; i++) {
            colorListItems[i].style.display = "none";
        }

        colorpicker.style.visibility = "hidden";
        colorpicker.style.opacity = 0;

        editPriceType(1);
        document.getElementById("edit-pricespan1").value = "";
        document.getElementById("edit-pricespan2").value = "";

    } else { //hidden
        //loading item info
        var colorbutton = document.getElementById("editcolorbutton");

        var itemName = getKeyForItem(itemToLoad, "name");
        var itemSearch = itemName.replace(" : ", "_").replace("-", "_").replaceAll(" ", "_").replace(":", "")
        var cssColor = getKeyForItem(itemToLoad, "cssColor");
        var color = getKeyForItem(itemToLoad, "color")

        itemNameLabel.innerText = itemName;
        itemImage.src = getKeyForItem(itemToLoad, "itemImage");
        itemImage.setAttribute("draggable", "false");
        document.getElementById("edit-title").innerText = "Loading Available Colors...";
        
        colorbutton.style.background = cssColor;
        colorbutton.innerText = getKeyForItem(itemToLoad, "displayColor");
        if(color == "white") {
            colorbutton.style.background = "#dbdbdb";
            colorbutton.style.color = "black";
        }

        document.querySelector("footer").style.zIndex = -1;
        eiw.style.visibility = "visible";
        eiw.style.opacity = 0;
        $("#edititemwindow").animate({ opacity: 1 }, "fast");

        editPriceType(1);

        //gotta check for available colors
        var availableColors = "";
        availableColors = availableColors + " " + await doItemRequest(itemSearch, "/black");
        availableColors = availableColors + " " + await doItemRequest(itemSearch, "/white");
        availableColors = availableColors + " " + await doItemRequest(itemSearch, "/grey");
        availableColors = availableColors + " " + await doItemRequest(itemSearch, "/crimson");
        availableColors = availableColors + " " + await doItemRequest(itemSearch, "/pink");
        availableColors = availableColors + " " + await doItemRequest(itemSearch, "/cobalt");
        availableColors = availableColors + " " + await doItemRequest(itemSearch, "/sblue");
        availableColors = availableColors + " " + await doItemRequest(itemSearch, "/sienna");
        availableColors = availableColors + " " + await doItemRequest(itemSearch, "/saffron");
        availableColors = availableColors + " " + await doItemRequest(itemSearch, "/lime");
        availableColors = availableColors + " " + await doItemRequest(itemSearch, "/fgreen");
        availableColors = availableColors + " " + await doItemRequest(itemSearch, "/orange");
        availableColors = availableColors + " " + await doItemRequest(itemSearch, "/purple");
        availableColors = availableColors + " " + await doItemRequest(itemSearch, "");
        availableColors = availableColors.replaceAll(" no", ""); //we get all the colors that exists for that item

        availableColors.toLowerCase().replace("titanium white", "white").replace("forest green", "fgreen").replace("burnt sienna", "sienna").replace("sky blue", "sblue").substring(1).split(" ").forEach(e => {
            document.getElementById("cp1-" + e).style.display = "list-item";
            document.getElementById("cp1-" + e).setAttribute('onclick', 'selectColor("' + e + '", "edit")');
        });
        document.getElementById("edit-title").innerText = "Available Colors";
    }
}

function toggleToolbar() {
    var toolbar = document.querySelector("footer");
    if(toolbar.style.bottom == "23px") { //will hide
        $("footer").animate({ bottom: "-46px" });
        $(".bottom-gradient").animate({ opacity: 0 }, "slow");
        $(".toolbar-toggler").animate({ top: "-20px" }, "fast");
        $(".toolbar-toggler").animate({ opacity: 0 }, "fast", function() {
            $(".toolbar-toggler").parent().html("<i class=\"fas fa-chevron-up toolbar-toggler\" onclick=\"toggleToolbar()\"></i>");
            $(".toolbar-toggler").css("top", "-20px");
        });
        $(".toolbar-toggler").animate({ opacity: 1 }, "fast");

        $("#f-username").animate({ top: "-54px" }, "fast");
    } else { //will show
        $("footer").animate({ bottom: "23px" });
        $(".bottom-gradient").animate({ opacity: 1 }, "slow");
        $(".toolbar-toggler").animate({ top: "0px" }, "fast");
        $(".toolbar-toggler").animate({ opacity: 0 }, "fast", function() {
            $(".toolbar-toggler").parent().html("<i class=\"fas fa-chevron-down toolbar-toggler\" onclick=\"toggleToolbar()\"></i>");
            $(".toolbar-toggler").css("top", "0px");
        });
        $(".toolbar-toggler").animate({ opacity: 1 }, "fast");
        $("#f-username").animate({ top: "-34px" }, "fast");
    }
}