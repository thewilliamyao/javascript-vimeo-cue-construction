/**
 * Created by wyao on 2016-12-24.
 */

var player;
var cueText;
var cueTime;
var cueId;
var videoDuration;
var cueNumber = 0;
var currentTime;
var currentCueTime;

function launchApp() {
    //Create a new video player div
    var div = document.createElement("div");
    div.id = "main-video";
    document.getElementById("video-wrapper").appendChild(div);

    var videoCode = document.getElementById("code-input").value;
    var options = {
        id: videoCode
    };

    player = new Vimeo.Player('main-video', options);

    //Switch scenes
    document.getElementById("menu").style.display = "none";
    document.getElementById("app").style.display = "block";

    //Set duration for error checking later
    player.getDuration().then(function(duration) {
        videoDuration = duration;
    }).catch(function(error) {
        // an error occurred
    });

    player.on('play', function(data) {
        player.getCurrentTime().then(function(seconds) {
            currentTime = seconds;
        });

        player.getCuePoints().then(function(cuePoints) {
            //Player wipes cue display when played unless the video is set at time = 0 and there is a cue
            if (cuePoints[0] && cuePoints[0].time == 0 && currentTime == 0) {
                document.getElementById("cue-p").innerHTML = cuePoints[0].data.customKey;
                document.getElementById("cue-p").style.display = "inline";
                document.getElementById("cue-link").style.display = "none";
            } else {
                document.getElementById("cue-display").style.display = "none";
            }
        });
    });

    player.on('cuepoint', function(data) {
        //cue is displayed differently depending on if it is a link
        if (isURL(data.data.customKey)) {
            document.getElementById("cue-p").style.display = "none";

            document.getElementById("cue-link").innerHTML = data.data.customKey;
            document.getElementById("cue-link").href = data.data.customKey;
            document.getElementById("cue-link").style.display = "inline";
        } else {
            document.getElementById("cue-link").style.display = "none";

            document.getElementById("cue-p").innerHTML = data.data.customKey;
            document.getElementById("cue-p").style.display = "inline";
        }

        //Set the current cue time to now
        currentCueTime = data.time;

        document.getElementById("cue-display").style.display = "block";
    });

    //Check if current time is too far after current cue's time
    player.on('timeupdate', function(data) {
        player.getCurrentTime().then(function(seconds) {
            currentTime = seconds;
        });

        if (currentTime > currentCueTime + 5) {
            document.getElementById("cue-display").style.display = "none";
        }
    });


}

function restartApp() {
    //Switches Scene
    document.getElementById("menu").style.display = "block";
    document.getElementById("app").style.display = "none";

    //Destroy current cues
    var toDelete = document.querySelectorAll(".cue-wrapper");
    for (var i = 0; i < toDelete.length; i++) {
        toDelete[i].parentNode.removeChild(toDelete[i]);
    }

    document.getElementById("main-video").remove();
    document.getElementById("cue-display").style.display = "none";
}


function addCue() {
    cueText = document.getElementById("input-text").value;
    cueTime = document.getElementById("input-time").value;

    //Splits time by ':' to get mm and ss
    var cueTimeSplit = cueTime.split(':');
    var cueTimeInt = (+cueTimeSplit[0]) * 60 + (+cueTimeSplit[1]);

    if (validCue(cueTimeInt)) {
        createCue(cueText, cueTime);

        player.addCuePoint(cueTimeInt, {
            customKey: cueText
        }).then(function(id) {
            console.log('cue point added');
            cueId = id;
            addRemoveButton();
            // cue point was added successfully
        });

        document.getElementById("input-text").value = "";
        document.getElementById("input-time").value = "";
    }
}

//Check if Cue is valid
function validCue(cueTimeInt) {
    if (cueText == "") {
        document.getElementById("error-message").innerHTML = "Please enter a message for the cue!";
        return false;
    } else if (!(/^\d{2}:\d{2}$/.test(cueTime))){
        document.getElementById("error-message").innerHTML = "Please make sure time is in mm:ss format!";
        return false;
    } else if (cueTimeInt < 0 || cueTimeInt > videoDuration) {
        document.getElementById("error-message").innerHTML = "Time can not be less than 0 or greater than the video's duration!";
        return false;
    }

    document.getElementById("error-message").innerHTML = "";
    return true;
}

function createCue() {
    var div = document.createElement("div");
    div.className = "cue-wrapper";
    div.id = cueNumber.toString();

    //Creates a 'a' tag for link and a 'p' else wise
    if (isURL(cueText)) {
        var cueLink = document.createElement("a");
        cueLink.className = "textBlock";
        cueLink.innerHTML = cueText;
        cueLink.href = cueText;
        cueLink.target = "_blank";
        div.appendChild(cueLink);
    } else {
        var cue = document.createElement("p");
        cue.className = "textBlock";
        cue.innerHTML = cueText;
        div.appendChild(cue);
    }

    var time = document.createElement("p");
    time.className = "timeBlock";
    time.innerHTML = cueTime;

    div.appendChild(time);

    document.getElementById("wrapper").appendChild(div);

}

//Attaches the cueId to the onclick function to help with player.removeCuePoint
function addRemoveButton() {
    var removeId = cueId;
    var divId = cueNumber.toString();

    var remove = document.createElement("div");
    remove.className = "deleteButton";
    remove.innerHTML = "x";
    remove.onclick = function(){
        removeCue(removeId);
        document.getElementById(divId).remove();

    };

    document.getElementById(divId).prepend(remove);
    cueNumber++;
}

function removeCue(removedCue) {
    player.removeCuePoint(removedCue).then(function(id) {
        console.log('cue removed');
        // cue point was removed successfully
    });
}

//Will return true if string starts with www or http
function isURL(str) {
    if (/^www./.test(str)) {
        str = "http://" + str;
        cueText = str;
    }

    return /^http./.test(str);
}