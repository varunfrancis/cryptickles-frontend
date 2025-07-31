let clues = [];
let currentIndex = 0;

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
}

document.getElementById("submit").addEventListener("click", function() {
    const userAnswer = document.getElementById("answer").value.trim().toLowerCase();
    const correctAnswer = clues[currentIndex].answer.toLowerCase();
    const result = document.getElementById("result");

    if (userAnswer === correctAnswer) {
        result.textContent = "Correct Answer!";
        result.style.color = "green";
    } else {
        result.textContent = "Wrong Answer. Try Again!";
        result.style.color = "red";
    }
});

// Hint button functionality
document.getElementById("hintBtn").addEventListener("click", function() {    
    const hintElement = document.getElementById("hint");
    if (clues[currentIndex].hint) {
        hintElement.textContent = "Hint: " + clues[currentIndex].hint;
        hintElement.style.color = "blue";
    } else {
        hintElement.textContent = "No hint available for this clue.";
        hintElement.style.color = "gray";
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