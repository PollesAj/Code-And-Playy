
    let lessonCompleted = false;
    let passedQuiz = false;

    // Detect if user scrolled through the lesson
    window.addEventListener("scroll", () => {
        const scrollPosition = window.innerHeight + window.scrollY;
        const pageHeight = document.body.offsetHeight - 200;

        if (scrollPosition >= pageHeight) {
            lessonCompleted = true;
        }
    });

    function checkQuiz() {
        const form = document.getElementById('cssQuiz');
        const resultDiv = document.getElementById('quizResult');
        let score = 0;

        // Correct CSS answers
        const answers = {
            q1: 'b', // Cascading Style Sheets
            q2: 'c', // #hero
            q3: 'a', // background-color
            q4: 'b', // Margin
            q5: 'a'  // font-weight: bold;
        };

        // Check answers
        if (form.q1.value === answers.q1) score++;
        if (form.q2.value === answers.q2) score++;
        if (form.q3.value === answers.q3) score++;
        if (form.q4.value === answers.q4) score++;
        if (form.q5.value === answers.q5) score++;

        // PERFECT SCORE
        if (score === 5) {
            passedQuiz = true;
            const proceedBtn = document.getElementById("proceedBtn");

            // Unlock button if lesson was studied
            if (passedQuiz) {
                proceedBtn.classList.remove("locked");
                proceedBtn.classList.add("unlocked");
            }

            resultDiv.style.color = "#76ffa9";
            resultDiv.innerHTML = "Perfect score! 5/5.";
        } 
        // FAILED QUIZ
        else {
            passedQuiz = false;
            resultDiv.style.color = "#ff5555";
            resultDiv.innerHTML = `FAILED. You scored ${score}/5. Please review the lesson and try again.<br>Restarting lesson... `;
            resultDiv.style.display = "block";

            // Restart lesson from the top after 1 second
            setTimeout(() => {
                form.reset();
                passedQuiz = false;
                lessonCompleted = false;
                resultDiv.innerHTML = "";
                resultDiv.style.display = "none";
                document.getElementById("requirementMessage").innerHTML = "";

                const proceedBtn = document.getElementById("proceedBtn");
                proceedBtn.classList.remove("unlocked");
                proceedBtn.classList.add("locked");

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            }, 1000);
            return;
        }
        resultDiv.style.display = "block";
    }

    function proceedToGame() {
        const requirementMessage = document.getElementById("requirementMessage");

        if (passedQuiz) {
            // Update this link to whatever your next game page is
            window.location.href = "../game-pages/css.html";
        } else if (!passedQuiz) {
            requirementMessage.style.color = "#ff8b56";
            requirementMessage.innerHTML = "⚠ You must first complete the lesson to proceed to the storyline.";
        }
    }
 