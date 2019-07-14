/* eslint-disable no-undef */

let $star;
let $homeContent;
let $tweet;
let $hatefulTweet;
let $hate;
/* let $votesAndToolbox;
let $toolbox;
let $voteClass; 
let $legendVote; */
let $voteH;
let $voteR;
let $voteM;
let $voteP;
let $voteO;
let $notHate;
let $skipHate;
let $skipSubclass;
let $isOffensive;

// let legendsShownForFirstTime = false;

const voteCodeToText = {
    'homophobia': "Homofóbico",
    'racism': "Racista",
    'misoginy': "Misógino",
    'political': "Ideológico",
    'other': "Otro"
};

let tweets = [];
let classifiedTweet = null;
let classifiedAvailable = false;
let voteCount = 0;

$(document).ready(function () {
    setupElements();
    setupPlaceload();
    getRandomTweets();
    setUiListeners();
    //moveToolboxIfOutside();
});

function setupElements() {
    $star = $('*');
    $homeContent = $('#home-content');
    $tweet = $('#unk-tweet-text');
    $hatefulTweet = $('#hateful-tweet-text');
    $hate = $('#hate');
    /* $votesAndToolbox = $('#votes,#toolbox');
    $toolbox = $('#toolbox');
    $voteClass = $('.vote');
    $legendVote = $('.legend-vote'); */
    $voteH = $('#homophobia');
    $voteR = $('#racism');
    $voteM = $('#misoginy');
    $voteP = $('#political');
    $voteO = $('#other');
    $notHate = $('#not-hate');
    $skipHate = $('#answers .btn-skip');
    $skipSubclass = $('#answers-subclass .btn-skip');
    $isOffensive = $('#is-offensive');
}

function showTweet(tweet) {
    $tweet.fadeOut(200, function () {
        $tweet.html(tweet.text.replace(/\n/mg, '<br/>'));
        $tweet.fadeIn(200);
    });
}

function setupPlaceload() {
    Placeload
        .$('#tweet-text')
        .config({speed: '1s'})
        .line(function (element) {
            return element.width(100).height(15);
        })
        .config({spaceBetween: '7px'})
        .line(function (element) {
            return element.width(100).height(15);
        })
        .config({spaceBetween: '7px'})
        .line(function (element) {
            return element.width(40).height(15);
        }).fold(function () {
    }, function () {
    });
}

function getRandomTweets() {
    $.getJSON('tweets/random', function (data) {
        if(data.length === 0) {
            getClassifiedTweet(() => {
                if(classifiedAvailable)
                    changeMode('subclass');
                else
                    changeMode('end');
            });
        }
        else {
            tweets = data;
            changeMode('hate');
        }
    });
}

function getClassifiedTweet(callback) {
    $.getJSON('tweets/classified/random', function (data) {
        if(!$.isEmptyObject(data)) {
            classifiedTweet = data;
            classifiedAvailable = true;
        }
        else {
            classifiedAvailable = false;
        }
        if(typeof callback !== 'undefined')
            callback();
    });
}

function setUiListeners() {
    /* $humor.click(function () {
        if (!legendsShownForFirstTime) {
            $legendVote.stop().fadeTo('slow', 1, function () {
                setTimeout(function () {
                    $legendVote.stop().fadeTo('slow', 0, function () {
                        $legendVote.css('opacity', '');
                    });
                }, 1000);
            });
            legendsShownForFirstTime = true;
        }
    });

    $humor.hover(function () {
        $votesAndToolbox.css('display', '');
    }); */

    $hate.click(function () {
        vote('1');
        $hate.addClass('no-hover');
    });

    $hate.on('mousemove mouswdown', function () {
        $hate.removeClass('no-hover');
    });

    $notHate.click(function () {
        vote('0');
        $notHate.addClass('no-hover');
    });

    $notHate.on('mousemove mouswdown', function () {
        $notHate.removeClass('no-hover');
    });

    $voteM.click(function () {
        voteType('misoginy');
    });

    $voteR.click(function () {
        voteType('racism');
    });

    $voteH.click(function () {
        voteType('homophobia');
    });

    $voteP.click(function () {
        voteType('political');
    });

    $voteO.click(function () {
        voteType('other');
    });

    $skipHate.click(function () {
        vote('2', true);
    });

    $skipSubclass.click(function () {
        voteType('skip');
    });

    $('button').mouseup(function () {
        $(this).blur();
    });
}

function changeMode(mode) {
    if(mode === 'hate') {
        $('#answers-subclass').fadeOut(200, () => {
            $('#answers-subclass').css("display", "flex").hide();
            $('#answers').fadeIn(200);
        });
        $('.question').fadeOut(200, () => {
            $('.question').text("¿El tweet contiene discurso de odio?");
            $('.question').fadeIn(200);
        });
        showTweet(tweets[0]);
    }
    else if(mode === 'subclass') {
        $('#answers').fadeOut(200, () => {
            $('#answers-subclass').css("display", "flex").hide();
            $('#answers-subclass').fadeIn(200);
        });
        $('.question').fadeOut(200, () => {
            $('.question').text("¡Ya clasificaste este Tweet! ¿Podés identificar que tipo de discurso de odio contiene?");
            $('.question').fadeIn(200);
        });
        showTweet(classifiedTweet);
    }
    else if(mode === 'end') {
        $('#answers').fadeOut(200);
        $('#answers-subclass').fadeOut(200);
        $('.question').fadeOut(200);
        showTweet({text: 'Wow! Clasificaste todos los tweets <br />Gracias por tu ayuda!'});
    }
}

function vote(voteOption, skip=false) {
    const currentTweet = tweets.shift();
    
    if(tweets.length > 0 && !classifiedAvailable) {
        showTweet(tweets[0]);
    } else if(voteCount >= 1 && classifiedAvailable) {
        changeMode('subclass');
    }
    
    $.post('vote', {
        tweetId: currentTweet.id,
        isHateful: voteOption,
        skip,
        ignoreTweetIds: [tweets.length > 0 ? tweets[0].id : '', tweets.length > 1 ? tweets[1].id : ''],
        isOffensive: ($isOffensive.prop('checked') == true) ? '1' : '0',
    }, function (tweet) {        
        if(!$.isEmptyObject(tweet))
            tweets.push(tweet);

        if(!skip)
            voteCount++;

        if(tweets.length === 0 && !classifiedAvailable) {            
            getClassifiedTweet(() => {
                if(classifiedAvailable)
                    changeMode('subclass');
                else
                    changeMode('end');
            });
        }
        else if(voteCount >= 2) {
            if(classifiedAvailable)
                voteCount = 0;
            else
                getClassifiedTweet();
        }
        
        
    }, 'json');

    $.mdtoast(toastText(voteOption), {duration: 3000});

    $isOffensive.prop('checked', false);
}

function voteType(voteOption) {
    
    if(tweets.length > 0) {
        classifiedAvailable = false;
        changeMode('hate');
    }
    
    $.post('vote/hateType', {
        tweetId: classifiedTweet.id,
        skip: voteOption === 'skip',
        hateType: voteOption,
    }, function (tweet) {
        if(tweets.length === 0) {
            if(!$.isEmptyObject(tweet)) {
                classifiedTweet = tweet;
                showTweet(classifiedTweet);
            } else
                changeMode('end');
        }
    }, 'json');

    $.mdtoast(toastText(voteOption), {duration: 3000});
}

function toastText(voteOption) {
    if (voteOption === '1') {
        return "Clasificado como odioso. ¡Gracias!";
    } else if (voteOption === '0') {
        return "Clasificado como no odioso. ¡Gracias!";
    } else if (voteOption === '2' || voteOption === 'skip') {
        return "Tweet salteado. ¡Gracias!";
    } else {
        return "Clasificado como "
            + removeNonWords(voteCodeToText[voteOption]).toLowerCase()
            + ". ¡Gracias!";
    }
}

function removeNonWords(text) {
    return text.replace(/[^\w\sáéíóúÁÉÍÓÚüÜñÑ]/g, "");
}

/* function moveToolboxIfOutside() {
    const x = $toolbox[0].getBoundingClientRect().x;
    if (x < 0) {
        const translation = -x + 10;
        addPxToLeft($toolbox, translation);
        addPxToLeft($vote1, translation);
        addPxToLeft($vote2, translation);
        addPxToLeft($vote3, translation);
        addPxToLeft($vote4, translation);
        addPxToLeft($vote5, translation);
    }
} */

/* function addPxToLeft(element, translation) {
    element.css('left', (parseInt(element.css('left')) + translation).toString() + "px");
} */
