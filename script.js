let clues = [];
let currentIndex = 0;
let initialViewportHeight = window.innerHeight;
let isKeypadOpen = false;

// Helper to get today's date in YYYY-MM-DD format
function getTodayDateString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// Keypad detection and button container positioning
function handleKeypadChange() {
    const buttonContainer = document.querySelector('.button-container');
    
    // Use visualViewport API if available, otherwise fall back to window.innerHeight
    let currentViewportHeight, viewportDifference;
    
    if (window.visualViewport) {
        currentViewportHeight = window.visualViewport.height;
        viewportDifference = initialViewportHeight - currentViewportHeight;
    } else {
        currentViewportHeight = window.innerHeight;
        viewportDifference = initialViewportHeight - currentViewportHeight;
    }
    
    // Consider keypad open if viewport height decreased significantly (more than 150px)
    const newKeypadState = viewportDifference > 150;
    
    if (newKeypadState !== isKeypadOpen) {
        isKeypadOpen = newKeypadState;
        
        if (isKeypadOpen) {
            // Keypad is open - move button container above keypad
            buttonContainer.style.position = 'fixed';
            buttonContainer.style.bottom = `${viewportDifference + 20}px`;
            buttonContainer.style.left = '0';
            buttonContainer.style.right = '0';
            buttonContainer.style.zIndex = '1000';
            buttonContainer.classList.add('keypad-open');
        } else {
            // Keypad is closed - restore original position
            buttonContainer.style.position = 'fixed';
            buttonContainer.style.bottom = 'env(safe-area-inset-bottom, 0)';
            buttonContainer.style.left = '0';
            buttonContainer.style.right = '0';
            buttonContainer.style.zIndex = '100';
            buttonContainer.classList.remove('keypad-open');
        }
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

    if (userAnswer === correctAnswer) {
        result.textContent = "You got it!";
        result.style.color = "#0F6326"; // green (matches .result-text in CSS)
        answerInput.classList.add("answer-correct");
    } else {
        result.textContent = "Wrong Answer. Try Again!";
        result.style.color = "red";
        answerInput.classList.remove("answer-correct");
    }
});

// Hint button functionality
document.getElementById("hintBtn").addEventListener("click", function() {    
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
    
    // Initialize viewport height
    initialViewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    
    // Add event listeners for keypad detection
    if (window.visualViewport) {
        // Use visualViewport API for more accurate detection
        window.visualViewport.addEventListener('resize', handleKeypadChange);
    } else {
        // Fallback to window resize
        window.addEventListener('resize', handleKeypadChange);
    }
    
    window.addEventListener('orientationchange', function() {
        // Reset initial height after orientation change
        setTimeout(() => {
            initialViewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
            handleKeypadChange();
        }, 100);
    });
    
    // Listen for input focus/blur events
    const answerInput = document.getElementById("answer");
    answerInput.addEventListener('focus', function() {
        // Small delay to allow keypad to open
        setTimeout(handleKeypadChange, 300);
    });
    
    answerInput.addEventListener('blur', function() {
        // Small delay to allow keypad to close
        setTimeout(handleKeypadChange, 300);
    });
});