// ===================================
// COLOURMIX - GUESS & CREATE
// ===================================


// SCREEN MANAGEMENT

const screens = document.querySelectorAll(".screen");

function showScreen(screenId) {

    screens.forEach(screen => {
        screen.classList.remove("active");
    });

    document.getElementById(screenId).classList.add("active");

    window.scrollTo(0, 0);
}


// GAME VARIABLES

let selectedCharacter = "";
let leftColor = null;
let rightColor = null;

let activeHand = "left";

let currentQuestion = null;
let score = 0;
let level = 1;
let attempts = 0;
let soundEnabled = true;

let correctAnswer = null;
let pointsThisRound = 0;


// BEST SCORE

let bestScore = Number(localStorage.getItem("colourMixBest")) || 0;

document.getElementById("bestScore").textContent =
    "🏆 Best: " + bestScore;


// COLOUR DATA

const colors = {

    Red: "#ff3333",
    Yellow: "#ffdf33",
    Blue: "#3185ff",
    White: "#ffffff",
    Black: "#333333",
    Green: "#22b573",
    Orange: "#ff922b",
    Purple: "#9b59b6",
    Pink: "#ff69b4",
    Brown: "#925c35"

};


// COLOUR MIXING RECIPES

const recipes = [

    {
        first: "Red",
        second: "Yellow",
        result: "Orange"
    },

    {
        first: "Blue",
        second: "Yellow",
        result: "Green"
    },

    {
        first: "Red",
        second: "Blue",
        result: "Purple"
    },

    {
        first: "Red",
        second: "White",
        result: "Pink"
    },

    {
        first: "Red",
        second: "Green",
        result: "Brown"
    },

    {
        first: "Blue",
        second: "White",
        result: "Pink"
    },

    {
        first: "Yellow",
        second: "Red",
        result: "Orange"
    },

    {
        first: "Yellow",
        second: "Blue",
        result: "Green"
    },

    {
        first: "Blue",
        second: "Red",
        result: "Purple"
    },

    {
        first: "Red",
        second: "Black",
        result: "Brown"
    }

];


// SOUND EFFECT

function playSound(frequency = 500) {

    if (!soundEnabled) return;

    try {

        const audioContext =
            new (window.AudioContext || window.webkitAudioContext)();

        const oscillator = audioContext.createOscillator();

        const gain = audioContext.createGain();

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.frequency.value = frequency;

        oscillator.type = "sine";

        gain.gain.setValueAtTime(0.15, audioContext.currentTime);

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + 0.25
        );

        oscillator.start();

        oscillator.stop(audioContext.currentTime + 0.25);

    } catch (error) {
        console.log("Sound unavailable");
    }

}


// SPEAK COLOUR NAME

function speak(text) {

    if (!soundEnabled) return;

    if ("speechSynthesis" in window) {

        window.speechSynthesis.cancel();

        const message = new SpeechSynthesisUtterance(text);

        message.rate = 0.85;
        message.pitch = 1.2;

        window.speechSynthesis.speak(message);

    }

}


// SOUND BUTTON

document.getElementById("soundBtn").addEventListener("click", function() {

    soundEnabled = !soundEnabled;

    this.textContent = soundEnabled ? "🔊" : "🔇";

    if (!soundEnabled && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }

    playSound(600);

});


// WELCOME SCREEN

document.getElementById("startBtn").addEventListener("click", function() {

    playSound(600);

    showScreen("characterScreen");

});


// HOW TO PLAY

document.getElementById("howBtn").addEventListener("click", function() {

    showScreen("howScreen");

});

document.getElementById("howBackBtn").addEventListener("click", function() {

    showScreen("welcomeScreen");

});


// CHARACTER SELECTION

const characterCards = document.querySelectorAll(".character-card");

const characterContinue =
    document.getElementById("characterContinue");


characterCards.forEach(card => {

    card.addEventListener("click", function() {

        characterCards.forEach(item => {
            item.classList.remove("selected");
        });

        this.classList.add("selected");

        selectedCharacter = this.dataset.character;

        document.getElementById("characterMessage").textContent =
            "🎉 Great! You selected " + selectedCharacter + "!";

        characterContinue.disabled = false;

        playSound(700);

    });

});


characterContinue.addEventListener("click", function() {

    if (!selectedCharacter) return;

    score = 0;
    level = 1;

    startLevel();

    showScreen("paintScreen");

});


document.getElementById("characterBack").addEventListener("click", function() {

    showScreen("welcomeScreen");

});


// CREATE COLOUR PALETTE

const palette = document.getElementById("palette");

Object.entries(colors).forEach(([name, hex]) => {

    const button = document.createElement("button");

    button.className = "color-btn";

    button.style.backgroundColor = hex;

    button.title = name;

    button.dataset.color = name;

    button.addEventListener("click", function() {

        selectColor(name, button);

    });

    palette.appendChild(button);

});
// SELECT WHICH HAND TO PAINT

const handBoxes = document.querySelectorAll(".hand-box");

function updateActiveHand() {

    handBoxes.forEach((box, index) => {

        box.classList.remove("active-hand");

        if (
            (index === 0 && activeHand === "left") ||
            (index === 1 && activeHand === "right")
        ) {
            box.classList.add("active-hand");
        }

    });

}

handBoxes.forEach((box, index) => {

    box.addEventListener("click", function() {

        activeHand = index === 0 ? "left" : "right";

        updateActiveHand();

        document.getElementById("paintMessage").textContent =
            activeHand === "left"
            ? "Choose a colour for the LEFT hand."
            : "Choose a colour for the RIGHT hand.";

        playSound(600);

    });

});

// SELECT COLOURS



   // SELECT OR CHANGE HAND COLOURS

function selectColor(colorName, button) {

    if (activeHand === "left") {

        leftColor = colorName;

        document.getElementById("leftHand").style.fill =
            colors[colorName];

        document.getElementById("leftColorName").textContent =
            colorName;

        activeHand = "right";

        document.getElementById("paintMessage").textContent =
            "Now choose a colour for the RIGHT hand.";

    }

    else {

        rightColor = colorName;

        document.getElementById("rightHand").style.fill =
            colors[colorName];

        document.getElementById("rightColorName").textContent =
            colorName;

        document.getElementById("paintMessage").textContent =
            "Both colours are selected! You can change either hand or mix.";

    }

    // Update the selected colour indicators

    document.querySelectorAll(".color-btn").forEach(item => {

        item.classList.remove("selected");

        if (
            item.dataset.color === leftColor ||
            item.dataset.color === rightColor
        ) {
            item.classList.add("selected");
        }

    });

    updateActiveHand();

    // Enable mixing only when both hands have colours

    document.getElementById("mixBtn").disabled =
        !(leftColor && rightColor);

    speak(colorName);

    playSound(650);

}


// START A LEVEL

function startLevel() {

    leftColor = null;
    rightColor = null;

    attempts = 0;

    document.getElementById("leftHand").style.fill = "#f4c9a8";

    document.getElementById("rightHand").style.fill = "#f4c9a8";

    document.getElementById("leftColorName").textContent =
        "Not selected";

    document.getElementById("rightColorName").textContent =
        "Not selected";

    document.getElementById("paintMessage").textContent =
        "First, select the LEFT hand colour.";

    document.getElementById("mixBtn").disabled = true;

    document.getElementById("scoreText").textContent =
        "⭐ Score: " + score;

    document.getElementById("levelText").textContent =
        "Level " + level;

    document.querySelectorAll(".color-btn").forEach(button => {
        button.classList.remove("selected");
    });

    // Select a random recipe

    currentQuestion =
        recipes[Math.floor(Math.random() * recipes.length)];

}


// MIX BUTTON


// MIX BUTTON WITH VISIBLE ANIMATION

document.getElementById("mixBtn").addEventListener("click", function() {

    if (!leftColor || !rightColor) return;

    const matchingRecipe = recipes.find(recipe => {

        return (
            (recipe.first === leftColor && recipe.second === rightColor) ||
            (recipe.first === rightColor && recipe.second === leftColor)
        );

    });

    if (!matchingRecipe) {
        showToast("Try another colour combination!");
        return;
    }

    correctAnswer = matchingRecipe.result;

    document.getElementById("equation").innerHTML = `
        <span style="color:${colors[leftColor]}">${leftColor}</span>
        <span>+</span>
        <span style="color:${colors[rightColor]}">${rightColor}</span>
    `;

    // Open countdown screen
    showScreen("countdownScreen");

    // Start both hand animations
    document.querySelectorAll(".hand-box").forEach(hand => {
        hand.classList.remove("mixing");

        void hand.offsetWidth;

        hand.classList.add("mixing");
    });

    // Start countdown
    runCountdown();

});


// COUNTDOWN

function runCountdown() {

    let number = 3;

    const countdown =
        document.getElementById("countdownNumber");

    countdown.textContent = number;

    const timer = setInterval(() => {

        number--;

        if (number > 0) {

            countdown.textContent = number;

            playSound(500);

        }

        else {

            clearInterval(timer);

            countdown.textContent = "🎨";

            playSound(850);

           setTimeout(() => {

    // Stop hand animations

    document.querySelectorAll(".hand-box").forEach(hand => {
        hand.classList.remove("mixing");
    });

    showGuessScreen();

}, 700);

        }

    }, 1000);

}


// GUESS SCREEN

function showGuessScreen() {

    attempts = 0;

    document.getElementById("attemptText").textContent =
        "Attempts: 0 / 3";

    document.getElementById("guessMessage").textContent =
        "Choose the correct answer!";

    const guessOptions =
        document.getElementById("guessOptions");

    guessOptions.innerHTML = "";

    // Correct answer plus three different wrong answers

    let options = [correctAnswer];

    const otherColors = Object.keys(colors).filter(color => {

        return color !== correctAnswer;

    });

    while (options.length < 4) {

        const randomColor =
            otherColors[Math.floor(Math.random() * otherColors.length)];

        if (!options.includes(randomColor)) {

            options.push(randomColor);

        }

    }

    // Shuffle options

    options.sort(() => Math.random() - 0.5);

    options.forEach(color => {

        const button = document.createElement("button");

        button.className = "guess-option";

        button.style.backgroundColor = colors[color];

        button.textContent = color;

        button.addEventListener("click", function() {

            checkAnswer(color, button);

        });

        guessOptions.appendChild(button);

    });

    showScreen("guessScreen");

}


// CHECK ANSWER

function checkAnswer(answer, button) {

    if (attempts >= 3) return;

    attempts++;

    document.getElementById("attemptText").textContent =
        "Attempts: " + attempts + " / 3";

    if (answer === correctAnswer) {

        document.getElementById("guessMessage").textContent =
            "🎉 Excellent! That's correct!";

        document.querySelectorAll(".guess-option").forEach(option => {
            option.disabled = true;
        });

        pointsThisRound = attempts === 1 ? 10 : attempts === 2 ? 7 : 5;

        score += pointsThisRound;

        playSound(900);

        speak(correctAnswer);

        setTimeout(() => {

            showResult(true);

        }, 900);

    }

    else {

        button.disabled = true;

        playSound(250);

        if (attempts < 3) {

            document.getElementById("guessMessage").textContent =
                "Not quite! Try again. 💪";

        }

        else {

            document.getElementById("guessMessage").textContent =
                "The correct answer is " + correctAnswer + "!";

            document.querySelectorAll(".guess-option").forEach(option => {
                option.disabled = true;
            });

            pointsThisRound = 0;

            setTimeout(() => {

                showResult(false);

            }, 1300);

        }

    }

}


// SHOW RESULT

function showResult(isCorrect) {

    showScreen("resultScreen");

    document.getElementById("resultColour").style.backgroundColor =
        colors[correctAnswer];

    document.getElementById("resultName").textContent =
        correctAnswer;

    document.getElementById("resultDescription").textContent =
        leftColor + " + " + rightColor + " = " + correctAnswer;

    if (isCorrect) {

        document.getElementById("resultEmoji").textContent = "🎉";

        document.getElementById("resultTitle").textContent =
            "Amazing Work!";

        document.getElementById("pointsEarned").textContent =
            "+" + pointsThisRound + " Points ⭐";

    }

    else {

        document.getElementById("resultEmoji").textContent = "🌟";

        document.getElementById("resultTitle").textContent =
            "Good Try!";

        document.getElementById("pointsEarned").textContent =
            "Keep Practising!";

    }

    // Save best score

    if (score > bestScore) {

        bestScore = score;

        localStorage.setItem("colourMixBest", bestScore);

        document.getElementById("bestScore").textContent =
            "🏆 Best: " + bestScore;

    }

    document.getElementById("nextBtn").textContent =
        "NEXT LEVEL →";

}


// NEXT LEVEL

document.getElementById("nextBtn").addEventListener("click", function() {

    level++;

    startLevel();

    showScreen("paintScreen");

    playSound(700);

});


// HOME BUTTON

document.getElementById("homeBtn").addEventListener("click", function() {

    score = 0;
    level = 1;

    showScreen("welcomeScreen");

});


// BACK TO PAINTING

document.getElementById("paintBack").addEventListener("click", function() {

    startLevel();

    showScreen("paintScreen");

});


// TOAST MESSAGE

function showToast(message) {

    const toast = document.getElementById("toast");

    toast.textContent = message;

    toast.style.display = "block";

    setTimeout(() => {

        toast.style.display = "none";

    }, 2500);

}


console.log("ColourMix Game Loaded Successfully! 🌈");

// ===== EYE COMFORT TOGGLE =====

const eyeComfortBtn =
    document.getElementById("eyeComfortBtn");

eyeComfortBtn.addEventListener("click", function() {

    document.body.classList.toggle("eye-comfort");

    const enabled =
        document.body.classList.contains("eye-comfort");

    this.textContent = enabled
        ? "☀️ Normal Mode"
        : "🌙 Eye Comfort";

    this.setAttribute("aria-pressed", enabled);

});