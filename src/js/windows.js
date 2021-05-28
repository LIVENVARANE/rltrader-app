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
        document.getElementById("itemsearch").value = "";
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
        navSettings('general');
        var userDataPath = (electron.app || electron.remote.app).getPath('userData') + "/data/userdata.json";
        var userDataContent = JSON.parse(fs.readFileSync(userDataPath, 'utf-8').toString());
        if(Object.keys(userDataContent.settings).length == 0) { //set default settings here
            setSettingValue("language", "eng");
            setSettingValue("dashboardItemStyle", "bubbles");
            setSettingValue("isShowingOnlyFavorites", false);
            setSettingValue("headerAnimationSetting", true);
            setSettingValue("dashboardItemBorderColor", true);
            setSettingValue("hideToolbarAtStartupSetting", false);
            setSettingValue("autoHideToolbarSetting", false);
        }

        var userDataContent = JSON.parse(fs.readFileSync(userDataPath, 'utf-8').toString()); //reloads userdata.json
        Object.keys(userDataContent.settings).forEach(setting => {
            var value = getSettingValue(setting);
            //every checkboxes
            if(setting == "hideToolbarAtStartupSetting" || setting == "autoHideToolbarSetting" || setting == "headerAnimationSetting" || setting == "dashboardItemBorderColor") {
                var settingObj = document.getElementById(setting);
                if(value) {
                    settingObj.style.backgroundColor = "rgb(0, 184, 148)";
                    settingObj.innerHTML = 'Enabled<i class="fas fa-check"></i>';
                } else {
                    settingObj.style.backgroundColor = "rgb(255, 107, 129)";
                    settingObj.innerHTML = 'Disabled<i class="fas fa-times"></i>';
                }
            }
        });
        document.querySelector("footer").style.zIndex = -1;
        sw.style.visibility = "visible";
        sw.style.opacity = 0;
        $("#settingswindow").animate({ opacity: 1 }, "fast");
    }
}

async function itemInfoWindow(itemToLoad) {
    var iiw = document.getElementById("infowindow");
    var itemImage = document.getElementById("infoimage");
    var itemNameLabel = document.getElementById("infoname");
    var colorLabel = document.getElementById("infocolor");
    var rarityLabel = document.getElementById("inforarity");
    var numberLabel = document.getElementById("infonumber");
    var timeLabel = document.getElementById("infotime");
    var favorite = document.getElementById("infofavorite");
    var priceLabel = document.getElementById('infoprice');

    if(iiw.style.visibility == "visible") {
        $("#infowindow").animate({ opacity: 0 }, "fast", function() {
            setTimeout(function () {
                iiw.style.visibility = "hidden";
                document.querySelector("footer").style.zIndex = 0;
            }, 100);
        });
    } else {
        var itemName = getKeyForItem(itemToLoad, "name");
        var itemSearch = itemName.replace(" : ", "_").replace("-", "_").replaceAll(" ", "_").replace(":", "");
        var cssColor = getKeyForItem(itemToLoad, "cssColor");
        var color = getKeyForItem(itemToLoad, "color");
        var typerarity = getKeyForItem(itemToLoad, 'itemType');
        var isFav = getKeyForItem(itemToLoad, "isFavorite");
        var isBM = getKeyForItem(itemToLoad, "itemType").includes("Black Market");
        var emptyReq = JSON.parse(await doItemRequest(itemSearch, "/" + color, "empty"));

        if(isBM) { //if item is a bm, rlinsider now only has mp4 videos of the item
            var videoElement = document.createElement('video');
            videoElement.id = "infoimage";
            itemImage.parentNode.replaceChild(videoElement, itemImage);
            videoElement.src = getKeyForItem(itemToLoad, "itemImage");
            videoElement.setAttribute("autoplay", "");
            videoElement.setAttribute("loop", "");
            videoElement.style.opacity = 1;
            videoElement.setAttribute("draggable", "false");
        } else {
            var imageElement = document.createElement('img');
            imageElement.id = "infoimage";
            itemImage.parentNode.replaceChild(imageElement, itemImage);
            imageElement.src = getKeyForItem(itemToLoad, "itemImage");
            imageElement.style.opacity = 1;
            imageElement.setAttribute("draggable", "false");
        }

        if(isFav) favorite.className = 'fas fa-star';
        else favorite.className = '';

        itemNameLabel.innerHTML = itemName;
        if(itemName.includes(":")) {
            itemNameLabel.style.fontSize = "22px";
            favorite.style.fontSize = "17px";
        } else {
            itemNameLabel.style.fontSize = "2em";
            favorite.style.fontSize = "22px";
        }

        colorLabel.innerHTML = getKeyForItem(itemToLoad, 'displayColor');
        colorLabel.style.backgroundColor = cssColor;
        if(color == "white") colorLabel.style.color = 'black';
        else colorLabel.style.color = 'white';

        rarityLabel.innerHTML = typerarity;
        numberLabel.innerHTML = itemToLoad;
        priceLabel.innerHTML = emptyReq['currentPriceRange'] + " Credits";
        timeLabel.innerHTML = new Date(getKeyForItem(itemToLoad, 'addedTimestamp')).toLocaleDateString('en-US');

        document.querySelector("footer").style.zIndex = -1;
        iiw.style.visibility = "visible";
        iiw.style.opacity = 0;
        $("#infowindow").animate({ opacity: 1 }, "fast");

        loadItemWindowChart(itemToLoad, emptyReq, 2);
    }
}

async function loadItemWindowChart(itemToLoad, emptyReq, timeSpan) { //timeSpan 3 is all time, 2 is 3 months, 1 is 2 weeks and 0 is 3 days
    if(itemToLoad == null || emptyReq == null) {
        itemToLoad = document.getElementById("infonumber").innerText;
        var itemName = getKeyForItem(itemToLoad, "name");
        var itemSearch = itemName.replace(" : ", "_").replace("-", "_").replaceAll(" ", "_").replace(":", "");
        var color = getKeyForItem(itemToLoad, "color");
        emptyReq = JSON.parse(await doItemRequest(itemSearch, "/" + color, "empty"));
    }

    var infoAllData = document.getElementById('info-ad');
    var infoThreeMonths = document.getElementById('info-tm');
    var infoTwoWeeks = document.getElementById('info-tw');
    var infoThreeDays = document.getElementById('info-td');

    infoAllData.removeAttribute('style');
    infoThreeMonths.removeAttribute('style');
    infoTwoWeeks.removeAttribute('style');
    infoThreeDays.removeAttribute('style');
    timeFormat = 'dd MMMM yyyy';
    switch(timeSpan) {
        case 3:
            infoAllData.style.backgroundColor = '#3B3B58';
            break;
        case 2:
            infoThreeMonths.style.backgroundColor = '#3B3B58';
            break;
        case 1:
            infoTwoWeeks.style.backgroundColor = '#3B3B58';
            timeFormat = 'dd MMMM yyyy, HH:mm';
            break;
        case 0:
            infoThreeDays.style.backgroundColor = '#3B3B58';
            timeFormat = 'dd MMMM yyyy, HH:mm';
            break;
    }

    document.getElementById('itemchart').innerHTML = '';

    var options = {
        series: [
            {
                name: 'Max Credits',
                data: getPricesHistory(2, emptyReq, timeSpan)
            },
            {
                name: 'Min Credits',
                data: getPricesHistory(0, emptyReq, timeSpan)
            }
        ],
        chart: {
            id: 'area-datetime',
            type: 'area',
            height: 300,
            width: 550,
            toolbar: {
                show: true,
                tools: {
                    download: false
                }
            },
            zoom: {
                enabled: true,
                autoScaleYaxis: false
            },
        },
        colors: ['#ADADAD', '#BC7C9C'],
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'straight'
        },
        fill: {
            type: 'gradient',
            gradient: {
                opacityFrom: 0.6,
                opacityTo: 0.8,
            }
        },
        xaxis: {
            type: 'datetime',
            labels: {
                show: false
            }
        },
        yaxis: {
            labels: {
                show: false
            }
        },
        tooltip: {
            x: {
                format: timeFormat
            }
        },
        annotations: {
            xaxis: [{
                x: new Date(getKeyForItem(itemToLoad, 'addedTimestamp')).getTime(),
                borderColor: '#999',
                yAxisIndex: 0,
                label: {
                    show: true,
                    text: 'Item added',
                    style: {
                        color: '#fff',
                        background: '#BC7C9C'
                    }
                }
            }]
        },
      };
    
    var chart = new ApexCharts(document.querySelector("#itemchart"), options);
    chart.render();
}

async function editItemWindow(itemToLoad) {
    var eiw = document.getElementById("edititemwindow");
    var itemNameLabel = document.getElementById("edititem-name");
    var itemImage = document.getElementById("edititemimage");
    var colorpicker = document.getElementById("colorpicker1");

    if(eiw.style.visibility == "visible") {
        $("#edititemwindow").animate({ opacity: 0 }, "fast", function() {
            setTimeout(function () {
                eiw.style.visibility = "hidden";
                document.querySelector("footer").style.zIndex = 0;
                itemNameLabel.innerText = "Loading...";
                itemImage.style.opacity = 0;
                itemImage.src = "";
                document.getElementById("editprice").style.color = "black";
                editPriceType(1);
                document.getElementById("edit-pricespan1").value = "";
                document.getElementById("edit-pricespan2").value = "";
            }, 100);
        });

        var colorListItems = document.getElementsByClassName('editlistitem');
        for(var i = 0; i < colorListItems.length; i++) {
            colorListItems[i].style.display = "none";
        }
        colorpicker.style.visibility = "hidden";
        colorpicker.style.opacity = 0;
        document.getElementById("edititembutton").removeAttribute("onclick");
    } else { //hidden
        //loading item info
        var colorbutton = document.getElementById("editcolorbutton");

        var itemName = getKeyForItem(itemToLoad, "name");
        var itemSearch = itemName.replace(" : ", "_").replace("-", "_").replaceAll(" ", "_").replace(":", "");
        var cssColor = getKeyForItem(itemToLoad, "cssColor");
        var color = getKeyForItem(itemToLoad, "color"); 
        var isFav = getKeyForItem(itemToLoad, "isFavorite");
        var isBM = getKeyForItem(itemToLoad, "itemType").includes("Black Market");

        itemNameLabel.innerText = itemName;
        itemNameLabel.setAttribute("isBM", isBM); //will help when changeInventorySortingTypeing item color
        
        if(isBM) { //if item is a bm, rlinsider now only has mp4 videos of the item
            var videoElement = document.createElement('video');
            videoElement.id = "edititemimage";
            itemImage.parentNode.replaceChild(videoElement, itemImage);
            videoElement.src = getKeyForItem(itemToLoad, "itemImage");
            videoElement.setAttribute("autoplay", "");
            videoElement.setAttribute("loop", "");
            videoElement.style.opacity = 1;
            videoElement.setAttribute("draggable", "false");
        } else {
            var imageElement = document.createElement('img');
            imageElement.id = "edititemimage";
            itemImage.parentNode.replaceChild(imageElement, itemImage);
            imageElement.src = getKeyForItem(itemToLoad, "itemImage");
            imageElement.style.opacity = 1;
            imageElement.setAttribute("draggable", "false");
        }
        document.getElementById("edit-title").innerText = "Loading Available Colors...";
        
        colorbutton.style.background = cssColor;
        colorbutton.innerText = getKeyForItem(itemToLoad, "displayColor");
        if(color == "white") {
            colorbutton.style.background = "#dbdbdb";
            colorbutton.style.color = "black";
        } else if(color == "saffron") {
            colorbutton.style.color = "black";
        } else {
            colorbutton.style.color = "white";
        }

        if(isFav) {
            document.getElementById("editfav").style.backgroundColor = "rgb(0, 184, 148)";
            document.getElementById("editfav-indicator").innerHTML = '<i class="fas fa-check"></i>';
        } else {
            document.getElementById("editfav").style.backgroundColor = "rgb(255, 107, 129)";
            document.getElementById("editfav-indicator").innerHTML = '<i class="fas fa-times"></i>';

        }

        document.getElementById("edititembutton").setAttribute("onclick", "saveEditItem(" + itemToLoad + ")");

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

function toggleToolbar(action) {
    var toolbar = document.querySelector("footer");
    if(toolbar.style.bottom == "23px" || action == "hide") { //will hide
        $("footer").animate({ bottom: "-46px" });
        $(".bottom-gradient").animate({ opacity: 0 }, "fast");
        $(".toolbar-toggler").animate({ top: "-20px" }, "fast");
        $(".toolbar-toggler").css("transform", "rotate(180deg)");
        $("#f-username").animate({ top: "-54px" }, "fast");
    } else { //will show
        $("footer").animate({ bottom: "23px" });
        $(".bottom-gradient").animate({ opacity: 1 }, "fast");
        $(".toolbar-toggler").animate({ top: "0px" }, "fast");
        $(".toolbar-toggler").css("transform", "rotate(0deg)");
        $("#f-username").animate({ top: "-34px" }, "fast");
    }
}

function navSettings(page) {
    if(document.getElementById("s-" + page).style.display != "block") {
        $("#settings-content").children('div').each(function () {
            var item = document.getElementById($(this).attr('id'));
            if(item.id.includes("s-")) {
                item.style.display = "none";
                item.style.opacity = 0;
            }
        });
        document.getElementById("s-" + page).style.display = "block";
        $("#s-" + page).animate({ opacity: 1 }, "fast");
    }
}