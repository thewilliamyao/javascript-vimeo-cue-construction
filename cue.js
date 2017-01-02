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

// player.addCuePoint(3, {
//     customKey: 'Calvin is watching TV'
// }).then(function(id) {
//     console.log('cue point added');
//     // cue point was added successfully
// }).catch(function(error) {
//     switch (error.name) {
//         case 'UnsupportedError':
//             // cue points are not supported with the current player or browser
//             break;
//
//         case 'RangeError':
//             // the time was less than 0 or greater than the video’s duration
//             break;
//
//         default:
//             // some other error occurred
//             break;
//     }
// });

player.getDuration().then(function(duration) {
    videoDuration = duration;
}).catch(function(error) {
    // an error occurred
});

player.getCuePoints().then(function(cuePoints) {
    console.log(cuePoints);
    // cuePoints = an array of cue point objects
}).catch(function(error) {
    switch (error.name) {
        case 'UnsupportedError':
            // cue points are not supported with the current player or browser
            break;

        default:
            // some other error occurred
            break;
    }
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
    console.log(data.data.customKey);
    document.getElementById("cue-display").innerHTML = data.data.customKey;
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
            console.log(cueId);
            addRemoveButton();
            // cue point was added successfully
        });

        player.getCuePoints().then(function (cuePoints) {
            console.log(cuePoints);
            // cuePoints = an array of cue point objects
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

// function addCueHelper(cueTimeInt) {
//
//     player.addCuePoint(cueTimeInt, {
//         customKey: cueText
//     }).then(function(id) {
//         console.log('cue point added');
//         cueId = id;
//         // cue point was added successfully
//     }).catch(function(error) {
//         switch (error.name) {
//             case 'UnsupportedError':
//                 // cue points are not supported with the current player or browser
//                 break;
//
//             case 'RangeError':
//                 // the time was less than 0 or greater than the video’s duration
//                 break;
//
//             default:
//                 // some other error occurred
//                 break;
//         }
//     });
//
// }

function createCue() {
    console.log(cueTime + " " + cueText);

    var div = document.createElement("div");
    div.className = "cue-wrapper";
    div.id = cueNumber.toString();

    var cue = document.createElement("p");
    cue.className = "textBlock";
    cue.innerHTML = cueText;

    var time = document.createElement("p");
    time.className = "timeBlock";
    time.innerHTML = cueTime;

    //div.appendChild(remove);
    div.appendChild(cue);
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

    player.getCuePoints().then(function (cuePoints) {
        console.log(cuePoints);
        // cuePoints = an array of cue point objects
    });

}
