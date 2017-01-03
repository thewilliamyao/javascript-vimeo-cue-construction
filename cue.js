/**
 * Created by wyao on 2016-12-24.
 */

var iframe = document.querySelector('iframe');
var player = new Vimeo.Player(iframe);
var cueText;
var cueTime;
var cueId;
var videoDuration;
var cueNumber = 0;

player.getDuration().then(function(duration) {
    videoDuration = duration;
}).catch(function(error) {
    // an error occurred
});

player.on('play', function(data) {
    player.getCuePoints().then(function(cuePoints) {
        if (cuePoints[0].time == 0) {
            document.getElementById("cue-display").innerHTML = cuePoints[0].data.customKey;
        } else {
            document.getElementById("cue-display").style.display = "none";
        }
    });
});

player.on('cuepoint', function(data) {
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
    document.getElementById("cue-display").style.display = "block";
});

function addCue() {
    cueText = document.getElementById("input-text").value;
    cueTime = document.getElementById("input-time").value;

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

    console.log(isURL(cueText));

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

function addRemoveButton() {
    var removeId = cueId;
    var divId = cueNumber.toString();

    var remove = document.createElement("div");
    remove.className = "deleteButton";
    remove.innerHTML = "x";
    remove.onclick = function(){
        console.log(removeId);
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

function isURL(str) {
    if (/^www./.test(str)) {
        str = "http://" + str;
        cueText = str;
    }

    return /^http./.test(str);
}