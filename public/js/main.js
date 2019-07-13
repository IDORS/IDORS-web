/* eslint-disable no-undef */

let $star;
let $homeContent;
let $tweet;
let $hatefulTweet;
let $hatefulTweetModal;
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
let $skip;
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
let index = 0;
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
    $hatefulTweetModal = $('#hate-modal');
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
    $skip = $('#skip');
    $isOffensive = $('#is-offensive');
}

function showTweet() {
    if (tweets.length === 0 || tweets[index] === null) {
        console.error("No hay tweets para mostrar.");
    } else {
        $tweet.fadeOut(200, function () {
            $tweet.html(tweets[index].text.replace(/\n/mg, '<br/>'));
            $tweet.fadeIn(200);
        });
    }
}

function showTweetModal() {
    if (classifiedTweet !== null) {
        $hatefulTweet.fadeOut(200, function () {
            $hatefulTweet.html(classifiedTweet.text.replace(/\n/mg, '<br/>'));
            $hatefulTweet.fadeIn(200);
        });
        $hatefulTweetModal.modal({
            show: 'true'
        });
    }
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
        tweets = data;
        showTweet();
    });
}

function getClassifiedTweet() {
    $.getJSON('tweets/classified/random', function (data) {
        if(!$.isEmptyObject(data)) {
            classifiedTweet = data;
            showTweetModal();
        }
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

    $skip.click(function () {
        vote('2', true);
    });

    $('button').mouseup(function () {
        $(this).blur();
    });
}

function vote(voteOption, skip=false) {
    const oldIndex = index;
    index = (index + 1) % tweets.length;

    const otherIndex = (index + 1) % tweets.length;

    $.post('vote', {
        tweetId: tweets[oldIndex].id,
        isHateful: voteOption,
        skip,
        ignoreTweetIds: [tweets[index] ? tweets[index].id : '', tweets[otherIndex] ? tweets[otherIndex].id : ''],
        isOffensive: ($isOffensive.prop('checked') == true) ? '1' : '0',
    }, function (tweet) {
        tweets[oldIndex] = $.isEmptyObject(tweet) ? null : tweet;

        if (voteCount == 2) {
            getClassifiedTweet();
            voteCount = 0;
        } else {
            voteCount++;
        }
    }, 'json');

    showTweet();

    $.mdtoast(toastText(voteOption), {duration: 3000});

    $isOffensive.prop('checked', false);
}

function voteType(voteOption) {
    
    $.post('vote/hateType', {
        tweetId: classifiedTweet.id,
        hateType: voteOption,
    }, function (tweet) {
        classifiedTweet = tweet;
    }, 'json');

    $hatefulTweetModal.modal('hide');

    $.mdtoast(toastText(voteOption), {duration: 3000});
}

function toastText(voteOption) {
    if (voteOption === '1') {
        return "Clasificado como odioso. ¡Gracias!";
    } else if (voteOption === '0') {
        return "Clasificado como no odioso. ¡Gracias!";
    } else if (voteOption === '2') {
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
