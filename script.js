let clues = [];
let currentIndex = 0;

// Streak management functions
function getStreak() {
    const streak = localStorage.getItem('cryptickles_streak');
    return streak ? parseInt(streak) : 0;
}

function saveStreak(streakValue) {
    localStorage.setItem('cryptickles_streak', streakValue.toString());
}

function getLastSolvedDate() {
    return localStorage.getItem('cryptickles_last_solved_date');
}

function saveLastSolvedDate(dateString) {
    localStorage.setItem('cryptickles_last_solved_date', dateString);
}

function updateStreak() {
    const todayDate = getTodayDateString();
    const lastSolvedDate = getLastSolvedDate();
    const currentStreak = getStreak();
    
    // Check if today is already completed
    if (lastSolvedDate === todayDate) {
        return currentStreak; // Already completed today, no change
    }
    
    let newStreak = 1; // At least 1 since we're solving today
    
    if (lastSolvedDate) {
        // Calculate days between last solved and today
        const lastDate = new Date(lastSolvedDate);
        const today = new Date(todayDate);
        const diffTime = today - lastDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            // Consecutive day - increment streak
            newStreak = currentStreak + 1;
        } else if (diffDays > 1) {
            // Gap in days - reset streak to 1
            newStreak = 1;
        }
        // If diffDays === 0, it means same day (already handled above)
    }
    
    // Save the new values
    saveStreak(newStreak);
    saveLastSolvedDate(todayDate);
    
    return newStreak;
}

function displayStreak() {
    const streak = getStreak();
    const streakElement = document.getElementById('streak');
    const streakContainer = document.querySelector('.streak-container');
    
    // Always show streak when this function is called (only called on correct answer)
    streakElement.innerHTML = `${streak} <span class="fire-wiggle">🔥</span>`;
    streakContainer.style.display = 'flex';
    
    // Remove the fire-wiggle class after animation completes to allow re-triggering
    setTimeout(() => {
        const fireEmoji = streakElement.querySelector('.fire-wiggle');
        if (fireEmoji) {
            fireEmoji.classList.remove('fire-wiggle');
        }
    }, 800); // Match the animation duration
}

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
        
        // Display setter name if available
        const setterNameElement = document.querySelector('.setter-name');
        if (data.setter_name && setterNameElement) {
            setterNameElement.textContent = `By ${data.setter_name}`;
        } else if (setterNameElement) {
            setterNameElement.textContent = "By Anonymous";
        }
        
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
            
            // Hide setter name when clue is missing
            const setterNameElement = document.querySelector('.setter-name');
            if (setterNameElement) {
                setterNameElement.textContent = "";
            }
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
    document.querySelector('.submit-clue-simple').style.display = 'none';
    
    // Hide share container when new clue loads
    document.querySelector('.share-container').style.display = 'none';
    
    // Hide streak container when new clue loads
    document.querySelector('.streak-container').style.display = 'none';
    
    // Re-enable buttons for new clue
    document.getElementById('submit').disabled = false;
    document.getElementById('hintBtn').disabled = false;
    
    // Show button container again (in case it was hidden on mobile)
    document.querySelector('.button-container').style.display = 'flex';
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
        
        // Update and display streak
        const newStreak = updateStreak();
        displayStreak();
        
        // Hide hint container when answer is correct
        document.querySelector('.hint-container').style.display = 'none';
        
        // Disable check button and hint button
        document.getElementById('submit').disabled = true;
        document.getElementById('hintBtn').disabled = true;
        
        // Hide button container on both mobile and desktop when answer is correct
        document.querySelector('.button-container').style.display = 'none';
        
        // Show confetti animation
        const confetti = document.getElementById('confetti');
        if (confetti) {
            confetti.style.display = 'block';
            // Hide confetti after 3 seconds
            setTimeout(() => {
                confetti.style.display = 'none';
            }, 3000);
        }
        
        // Show submit clue simple on mobile only when answer is correct
        if (window.innerWidth <= 600) {
            const submitSimple = document.querySelector('.submit-clue-simple');
            submitSimple.style.display = 'block';
        }
        
        // Show share container when answer is correct
        const shareContainer = document.querySelector('.share-container');
        shareContainer.style.display = 'flex';
        
        // Add wiggle animation to share container to draw attention
        setTimeout(() => {
            shareContainer.classList.add('wiggle');
            // Remove wiggle class after animation completes
            setTimeout(() => {
                shareContainer.classList.remove('wiggle');
            }, 1800);
        }, 500);
        
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
        
        // Hide submit clue simple when answer is wrong
        document.querySelector('.submit-clue-simple').style.display = 'none';
        
        // Hide share container when answer is wrong
        document.querySelector('.share-container').style.display = 'none';
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

// Share button functionality
document.getElementById("shareBtn").addEventListener("click", function() {
    // Track share button click
    gtag('event', 'share_button_click', {
        'event_category': 'user_interaction',
        'event_label': 'share_puzzle'
    });
    
    // Get current clue data for sharing
    const currentClue = clues[currentIndex];
    const todayDate = getTodayDateString();
    const formattedDate = new Date(todayDate + 'T00:00:00').toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    // Create share text
    const shareText = `Cryptickles - ${formattedDate}
✅ I got today's Cryptickle, did you try?

${currentClue.clue}

${window.location.href}`;

    // Check if we're on mobile and Web Share API is available
    if (navigator.share && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        // Mobile: Use native share tray
        navigator.share({
            // title: 'Cryptickles - ${formattedDate}',
            text: shareText,
            // url: window.location.href
        }).catch(err => {
            console.log('Error sharing:', err);
            // Fallback to clipboard copy if share fails
            copyToClipboard(shareText);
        });
    } else {
        // Web: Copy to clipboard
        copyToClipboard(shareText);
    }
});

// Helper function to copy text to clipboard
function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        // Use modern clipboard API
        navigator.clipboard.writeText(text).then(() => {
            showCopySuccessMessage();
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            fallbackCopyTextToClipboard(text);
        });
    } else {
        // Fallback for older browsers
        fallbackCopyTextToClipboard(text);
    }
}

// Fallback copy method for older browsers
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showCopySuccessMessage();
        } else {
            console.error('Fallback: Unable to copy');
        }
    } catch (err) {
        console.error('Fallback: Unable to copy', err);
    }
    
    document.body.removeChild(textArea);
}

// Show success message when text is copied
function showCopySuccessMessage() {
    const shareBtn = document.getElementById('shareBtn');
    const originalText = shareBtn.textContent;
    
    shareBtn.textContent = 'Copied!';
    shareBtn.style.backgroundColor = '#0F6326';
    
    setTimeout(() => {
        shareBtn.textContent = originalText;
        shareBtn.style.backgroundColor = '#996308';
    }, 2000);
}

// Note: Enter key handling is now done within each letter input's event listener

document.addEventListener("DOMContentLoaded", function() {
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById("today").textContent = today.toLocaleDateString('en-US', options);
    
    loadTodayClue(); // <-- Load today's clue on page load
});