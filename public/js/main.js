/* eslint-disable no-undef */

//let $star;
//let $homeContent;
let $tweet;
let $hatefulTweet;
let $odio;
/* let $votesAndToolbox;
let $toolbox;
let $voteClass;
let $vote1;
let $vote2;
let $vote3;
let $vote4;
let $vote5; 
let $legendVote; */
let $notOdio;
let $skip;
let $isOffensive;

// let legendsShownForFirstTime = false;

/* const voteCodeToText = {
    1: "Nada gracioso",
    2: "Poco gracioso",
    3: "Regular",
    4: "Bueno",
    5: "¡Buenísimo!"
}; */

let tweets = [];
let classifiedTweet = {};
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
    $tweet = $('#tweet-text');
    $hatefulTweet = $('#hateful-tweet-text');
    $hatefulTweetModal = $('#hate');
    $odio = $('#odio');
    /* $votesAndToolbox = $('#votes,#toolbox');
    $toolbox = $('#toolbox');
    $voteClass = $('.vote');
    $vote1 = $('#vote-1');
    $vote2 = $('#vote-2');
    $vote3 = $('#vote-3');
    $vote4 = $('#vote-4');
    $vote5 = $('#vote-5');
    $legendVote = $('.legend-vote'); */
    $notOdio = $('#not-odio');
    $skip = $('#skip');
    $isOffensive = $('#is-offensive');
}

function showTweet() {
    if (tweets.length === 0) {
        console.error("No hay tweets para mostrar.");
    } else {
        $tweet.fadeOut(200, function () {
            $tweet.html(tweets[index].text.replace(/\n/mg, '<br/>'));
            $tweet.fadeIn(200);
        });
    }
}

function showTweetModal() {
    if (classifiedTweet.length === 0) {
        showTweet();
    } else {
        $hatefulTweet.fadeOut(200, function () {
            $hatefulTweet.html(classifiedTweet[0].text.replace(/\n/mg, '<br/>'));
            $hatefulTweet.fadeIn(200);
        });
        $hatefulTweetModal.modal({
            show: 'true'
        });
        showTweet();
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
        classifiedTweet = data;
        showTweetModal();
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

    $odio.click(function () {
        vote('1');
        $odio.addClass('no-hover');
    });

    $odio.on('mousemove mouswdown', function () {
        $odio.removeClass('no-hover');
    });

    $notOdio.click(function () {
        vote('0');
        $notOdio.addClass('no-hover');
    });

    $notOdio.on('mousemove mouswdown', function () {
        $notOdio.removeClass('no-hover');
    });

    /* $vote1.click(function () {
        vote('1');
    });

    $vote2.click(function () {
        vote('2');
    });

    $vote3.click(function () {
        vote('3');
    });

    $vote4.click(function () {
        vote('4');
    });

    $vote5.click(function () {
        vote('5');
    }); */

    $skip.click(function () {
        vote(2);
    });

    $('button').mouseup(function () {
        $(this).blur();
    });
}

function vote(voteOption) {
    const oldIndex = index;
    index = (index + 1) % tweets.length;

    const otherIndex = (index + 1) % tweets.length;

    $.post('vote', {
        tweetId: tweets[oldIndex].id,
        isHateful: voteOption,
        ignore_tweet_ids: [tweets[index].id, tweets[otherIndex].id],
        isOffensive: ($isOffensive.prop('checked') == true) ? '1' : '0',
    }, function (tweet) {
        tweets[oldIndex] = tweet;
    }, 'json');

    if (voteCount == 2) {
        getClassifiedTweet();
        voteCount = 0;
    } else {
        showTweet();
        voteCount++;
    }

    $.mdtoast(toastText(voteOption), {duration: 3000});

    //$votesAndToolbox.fadeOut();

    $isOffensive.prop('checked', false);
}

function toastText(voteOption) {
    if (voteOption === '1') {
        return "Clasificado como odioso. ¡Gracias!";
    } else if (voteOption === '0') {
        return "Clasificado como no odioso. ¡Gracias!";
    } else if (voteOption === '2') {
        return "Tweet salteado. ¡Gracias!";
        /* return "Clasificado como "
            + removeNonWords(voteCodeToText[Number(voteOption)]).toLowerCase()
            + ". ¡Gracias!"; */
    }
}

/* function removeNonWords(text) {
    return text.replace(/[^\w\sáéíóúÁÉÍÓÚüÜñÑ]/g, "");
} */

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
