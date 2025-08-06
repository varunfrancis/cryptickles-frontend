let clues = [];
let currentIndex = 0;

// Helper to get today's date in YYYY-MM-DD format
function getTodayDateString() {
    const today = new Date();
    // Add 5.5 hours to convert UTC to IST (India Standard Time)
    const istDate = new Date(today.getTime() + (5.5 * 60 * 60 * 1000));
    return istDate.toISOString().split('T')[0];
}

// Create letter input fields based on answer length
function createLetterInputs(answerLength) {
    const container = document.getElementById("letter-inputs");
    container.innerHTML = ""; // Clear existing inputs
    
    for (let i = 0; i < answerLength; i++) {
        const input = document.createElement("input");
        input.type = "text";
        input.className = "letter-input";
        input.maxLength = "1";
        input.dataset.index = i;
        
        // Add input event listeners for navigation
        input.addEventListener("input", function(e) {
            const value = e.target.value.toUpperCase();
            e.target.value = value;
            
            // Move to next input if character entered
            if (value && i < answerLength - 1) {
                const nextInput = container.children[i + 1];
                nextInput.focus();
            }
        });
        
        // Handle backspace navigation
        input.addEventListener("keydown", function(e) {
            if (e.key === "Backspace" && !e.target.value && i > 0) {
                const prevInput = container.children[i - 1];
                prevInput.focus();
            } else if (e.key === "Enter") {
                document.getElementById("submit").click();
            }
        });
        
        container.appendChild(input);
    }
    
    // Focus first input
    if (container.children.length > 0) {
        container.children[0].focus();
    }
}

// Get concatenated answer from all letter inputs
function getFullAnswer() {
    const container = document.getElementById("letter-inputs");
    let answer = "";
    for (let i = 0; i < container.children.length; i++) {
        answer += container.children[i].value || "";
    }
    return answer.trim().toLowerCase();
}

// Clear all letter inputs
function clearLetterInputs() {
    const container = document.getElementById("letter-inputs");
    for (let i = 0; i < container.children.length; i++) {
        container.children[i].value = "";
        container.children[i].classList.remove("answer-correct");
        container.children[i].disabled = false;
    }
    if (container.children.length > 0) {
        container.children[0].focus();
    }
}

// Apply correct answer styling to all inputs and disable them
function applyCorrectStyling() {
    const container = document.getElementById("letter-inputs");
    for (let i = 0; i < container.children.length; i++) {
        container.children[i].classList.remove("answer-incorrect");
        container.children[i].classList.add("answer-correct");
        container.children[i].disabled = true;
    }
}

// Remove correct answer styling from all inputs and enable them
function removeCorrectStyling() {
    const container = document.getElementById("letter-inputs");
    for (let i = 0; i < container.children.length; i++) {
        container.children[i].classList.remove("answer-correct");
        container.children[i].classList.remove("answer-incorrect");
        container.children[i].disabled = false;
    }
}

// Apply incorrect answer styling to all inputs
function applyIncorrectStyling() {
    const container = document.getElementById("letter-inputs");
    for (let i = 0; i < container.children.length; i++) {
        container.children[i].classList.add("answer-incorrect");
    }
}

// Fetch and load today's clue
function loadTodayClue() {
    const todayDate = getTodayDateString();
    fetch(`https://cryptickles-backend.onrender.com/clue?date=${todayDate}`)
        .then(res => {
            if (!res.ok) throw new Error("missing");
            return res.json();
        })
            .then(data => {
        clues = [data];
        currentIndex = 0;
        loadClue();
        // Show input/buttons in case they were hidden before
        document.getElementById("letter-inputs").style.display = "";
        document.getElementById("submit").style.display = "";
        document.getElementById("hintBtn").style.display = "";
        
        // Create letter inputs based on answer length
        const answerLength = data.answer_length || data.answer.length;
        createLetterInputs(answerLength);
        
        // Log answer length for debugging (optional)
        if (data.answer_length) {
            console.log(`Answer length: ${data.answer_length}`);
        }
    })
        .catch(err => {
            document.getElementById("clue").textContent = "Today's clue missing";
            document.getElementById("letter-inputs").style.display = "none";
            document.getElementById("submit").style.display = "none";
            document.getElementById("hintBtn").style.display = "none";
            document.getElementById("hint").textContent = "";
            document.getElementById("result").textContent = "";
            document.getElementById("next-clue-text").textContent = "New clue every midnight.";
        });
}

// Loads the current clue onto the page, resets input fields and hides hint/result messages.
// This function is called when a new clue needs to be displayed (e.g., on page load or after fetching a new clue).
function loadClue() {    
    document.getElementById("clue").textContent = clues[currentIndex].clue;
    clearLetterInputs();
    document.getElementById("hint").textContent = "";
    document.getElementById("result").textContent = "";
    document.getElementById("next-clue-text").textContent = "";
    document.querySelector('.hint-container').style.display = 'none';
}

document.getElementById("submit").addEventListener("click", function() {
    const userAnswer = getFullAnswer();
    const correctAnswer = clues[currentIndex].answer.toLowerCase();
    const result = document.getElementById("result");
    const nextClueText = document.getElementById("next-clue-text");

    // Track check button click
    gtag('event', 'check_button_click', {
        'event_category': 'user_interaction',
        'event_label': 'check_answer'
    });

    if (userAnswer === correctAnswer) {
        result.innerHTML = "You got it! 🎉";
        nextClueText.textContent = "New clue every midnight.";
        result.style.color = "#0F6326"; // green (matches .result-text in CSS)
        result.className = "result-text";
        applyCorrectStyling();
        
        // Track correct answer
        gtag('event', 'correct_answer', {
            'event_category': 'gameplay',
            'event_label': 'correct_answer'
        });
    } else {
        result.textContent = "Mistakes are fun! Keep trying 👍🏼";
        nextClueText.textContent = "";
        result.className = "result-text result-text-incorrect";
        removeCorrectStyling();
        applyIncorrectStyling();
        
        // Track wrong answer
        gtag('event', 'wrong_answer', {
            'event_category': 'gameplay',
            'event_label': 'wrong_answer'
        });
    }
});

// Hint button functionality
document.getElementById("hintBtn").addEventListener("click", function() {    
    // Track hint button click
    gtag('event', 'hint_button_click', {
        'event_category': 'user_interaction',
        'event_label': 'show_hint'
    });
    
    const hintElement = document.getElementById("hint");
    const hintContainer = document.querySelector('.hint-container');
    if (clues[currentIndex].hint) {
        hintElement.textContent = clues[currentIndex].hint;
        // hintElement.style.color = "blue";
        hintContainer.style.display = 'flex';
    } else {
        hintElement.textContent = "No hint available for this clue.";
        hintElement.style.color = "gray";
        hintContainer.style.display = 'flex';
    }
});

// Note: Enter key handling is now done within each letter input's event listener

document.addEventListener("DOMContentLoaded", function() {
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById("today").textContent = today.toLocaleDateString('en-US', options);
    loadTodayClue(); // <-- Load today's clue on page load
});