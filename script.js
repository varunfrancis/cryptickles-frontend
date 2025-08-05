let clues = [];
let currentIndex = 0;

// Safe gtag wrapper that handles blocked/disabled Google Analytics
function safeGtag(eventName, parameters) {
    console.log(`Attempting to track: ${eventName}`, parameters);
    
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, parameters);
        console.log(`✅ Successfully tracked: ${eventName}`);
    } else {
        console.warn(`⚠️ Google Analytics blocked or not loaded. Event not tracked: ${eventName}`);
        // Store event locally for debugging
        const localEvents = JSON.parse(localStorage.getItem('cryptickles_events') || '[]');
        localEvents.push({
            event: eventName,
            parameters: parameters,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('cryptickles_events', JSON.stringify(localEvents));
        console.log(`📊 Event stored locally: ${eventName}`);
    }
}

// Debug function to test Google Analytics
function testGtag() {
    console.log("Testing gtag function...");
    if (typeof gtag !== 'undefined') {
        console.log("✅ gtag is available");
        safeGtag('test_event', {
            'event_category': 'debug',
            'event_label': 'test_tracking'
        });
    } else {
        console.error("❌ gtag is not available - Google Analytics may be blocked");
        console.log("💡 Try disabling your ad blocker for this site");
    }
}

// Helper to get today's date in YYYY-MM-DD format
function getTodayDateString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
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
            document.getElementById("answer").style.display = "";
            document.getElementById("submit").style.display = "";
            document.getElementById("hintBtn").style.display = "";
        })
        .catch(err => {
            document.getElementById("clue").textContent = "Today's clue missing";
            document.getElementById("answer").style.display = "none";
            document.getElementById("submit").style.display = "none";
            document.getElementById("hintBtn").style.display = "none";
            document.getElementById("hint").textContent = "";
            document.getElementById("result").textContent = "";
        });
}

function loadClue() {    
    document.getElementById("clue").textContent = clues[currentIndex].clue;
    document.getElementById("answer").value = "";
    document.getElementById("hint").textContent = "";
    document.getElementById("result").textContent = "";
    document.querySelector('.hint-container').style.display = 'none';
}

document.getElementById("submit").addEventListener("click", function() {
    const answerInput = document.getElementById("answer");
    const userAnswer = answerInput.value.trim().toLowerCase();
    const correctAnswer = clues[currentIndex].answer.toLowerCase();
    const result = document.getElementById("result");

    // Track check button click
    console.log("Tracking check button click event");
    safeGtag('check_button_click', {
        'event_category': 'user_interaction',
        'event_label': 'check_answer'
    });

    if (userAnswer === correctAnswer) {
        result.innerHTML = "You got it!<br>Come back here tomorrow for the next clue.";
        result.style.color = "#0F6326"; // green (matches .result-text in CSS)
        answerInput.classList.add("answer-correct");
        
        // Track correct answer
        console.log("Tracking correct answer event");
        safeGtag('correct_answer', {
            'event_category': 'gameplay',
            'event_label': 'correct_answer'
        });
    } else {
        result.textContent = "Wrong Answer. Try Again!";
        result.style.color = "red";
        answerInput.classList.remove("answer-correct");
        
        // Track wrong answer
        console.log("Tracking wrong answer event");
        safeGtag('wrong_answer', {
            'event_category': 'gameplay',
            'event_label': 'wrong_answer'
        });
    }
});

// Hint button functionality
document.getElementById("hintBtn").addEventListener("click", function() {    
    // Track hint button click
    console.log("Tracking hint button click event");
    safeGtag('hint_button_click', {
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

// Allow pressing Enter to submit
document.getElementById("answer").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        document.getElementById("submit").click();
    }
});

document.addEventListener("DOMContentLoaded", function() {
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById("today").textContent = today.toLocaleDateString('en-US', options);
    loadTodayClue(); // <-- Load today's clue on page load
});