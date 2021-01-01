function pageLoad() {
    console.log("Loading userdata...")

    var xmlContent = "";
    fetch('data/userdata.xml').then((response) => {
        response.text().then((xml) => {
            xmlContent = xml;

            var parser = new DOMParser();
            var xmlDOM = parser.parseFromString(xmlContent, 'application/xml');

            var didFirstConnnect = xmlDOM.getElementsByTagName('didFirstConnect')[0].textContent;
            if(didFirstConnnect == "0") {
                document.getElementById('welcome-screen').style.display = "block";
            }
        });
    });
    console.log("Userdata loaded.")
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
    }
    else if(type == "o-continue") {
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
            var xmlContent = "";
            fetch('data/userdata.xml').then((response) => {
                response.text().then((xml) => {
                    xmlContent = xml;

                    var parser = new DOMParser();
                    var xmlDOM = parser.parseFromString(xmlContent, 'application/xml');
                    console.log(xmlDOM.getElementsByTagName('didFirstConnect')[0].textContent);
                    xmlDOM.getElementsByTagName('didFirstConnect')[0].textContent = "1";
                    console.log(xmlDOM.getElementsByTagName('didFirstConnect')[0].textContent);
                });
            });
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
            }, 500);
        });
    } else { //hidden
        aiw.style.visibility = "visible";
        aiw.style.opacity = 0;
        $("#additemwindow").animate({ opacity: 1 }, "fast");
        $(".aiw-container").animate({ top: "10px" }, "fast");
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
    var stop = false;

    switch(color) {
        case "black":
            colorbutton.innerHTML = "Black";
            colorbutton.style.background = "black";
            colorbutton.style.color = "white";
            break;
        case "white":
            colorbutton.innerHTML = "Titanium White";
            colorbutton.style.background = "#dbdbdb";
            break;
        case "grey":
            colorbutton.innerHTML = "Grey";
            colorbutton.style.background = "grey";
            break;
        case "crimson":
            colorbutton.innerHTML = "Crimson";
            colorbutton.style.background = "#de1b1b";
            break;
        case "pink":
            colorbutton.innerHTML = "Pink";
            colorbutton.style.background = "pink";
            break;
        case "cobalt":
            colorbutton.innerHTML = "Cobalt";
            colorbutton.style.background = "#1b5cde";
            break;
        case "sblue":
            colorbutton.innerHTML = "Sky Blue";
            colorbutton.style.background = "#09e9ed";
            break;
        case "sienna":
            colorbutton.innerHTML = "Burnt Sienna";
            colorbutton.style.background = "brown";
            break;
        case "saffron":
            colorbutton.innerHTML = "Saffron";
            colorbutton.style.background = "yellow";
            colorbutton.style.color = "black";
            break;
        case "lime":
            colorbutton.innerHTML = "Lime";
            colorbutton.style.background = "#07eb12";
            break;
        case "fgreen":
            colorbutton.innerHTML = "Forest Green";
            colorbutton.style.background = "#0d7522";
            break;
        case "orange":
            colorbutton.innerHTML = "Orange";
            colorbutton.style.background = "orange";
            break;
        case "purple":
            colorbutton.innerHTML = "Purple";
            colorbutton.style.background = "purple";
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
            priceLabel.innerHTML = await doItemRequest(itemnameLabel.innerHTML, "", "currentPriceRange") + " Cr";
        } else {
            priceLabel.innerHTML = await doItemRequest(itemnameLabel.innerHTML, "/" + color, "currentPriceRange") + " Cr";
        }
        
    }
}