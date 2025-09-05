document.addEventListener('DOMContentLoaded', () => {
    const startScreen = document.getElementById('start-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const loadingScreen = document.getElementById('loading-screen');
    const resultScreen = document.getElementById('result-screen');

    const startBtn = document.getElementById('start-btn');
    const tryAgainBtn = document.getElementById('try-again-btn');

    const questionCounterEl = document.getElementById('question-counter');
    const timerTextEl = document.getElementById('timer-text');
    const questionTextEl = document.getElementById('question-text');
    const answerButtonsEl = document.getElementById('answer-buttons');
    const aiResultEl = document.getElementById('ai-result');

    const FIREWORKS_API_KEY = 'fw_3ZTsr2Ea1vfDArT6gc1WGZpn';
    const MODEL_ID = 'accounts/sentientfoundation/models/dobby-unhinged-llama-3-3-70b-new';
    const API_URL = 'https://api.fireworks.ai/inference/v1/chat/completions';

    let currentQuestionIndex, score, timerInterval, userResponses;

    const quizQuestions = [
        {
            question: "Which number should come next in the pattern? 37, 34, 31, 28, ...",
            answers: [
                { text: "25", correct: true },
                { text: "26", correct: false },
                { text: "22", correct: false },
                { text: "24", correct: false }
            ]
        },
        {
            question: "A man buys a shirt for $100 and sells it for $120. He then buys it back for $130 and sells it again for $150. How much profit did he make?",
            answers: [
                { text: "$10", correct: false },
                { text: "$20", correct: false },
                { text: "$30", correct: false },
                { text: "$40", correct: true }
            ]
        },
        {
            question: "Mary, who is sixteen years old, is four times as old as her brother. How old will Mary be when she is twice as old as her brother?",
            answers: [
                { text: "20", correct: false },
                { text: "24", correct: true },
                { text: "28", correct: false },
                { text: "32", correct: false }
            ]
        },
        {
            question: "Which of the following can be arranged into a 5-letter English word?",
            answers: [
                { text: "H R G S T", correct: false },
                { text: "R I L S A", correct: false },
                { text: "T O O M T", correct: false },
                { text: "W Q R G S", correct: true }
            ]
        },
        {
            question: "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?",
            answers: [
                { text: "10 cents", correct: false },
                { text: "5 cents", correct: true },
                { text: "1 cent", correct: false },
                { text: "15 cents", correct: false }
            ]
        }
    ];

    startBtn.addEventListener('click', startQuiz);
    tryAgainBtn.addEventListener('click', startQuiz);

    function startQuiz() {
        startScreen.classList.add('hide');
        resultScreen.classList.add('hide');
        quizScreen.classList.remove('hide');

        currentQuestionIndex = 0;
        score = 0;
        userResponses = [];
        
        setNextQuestion();
    }

    function showQuestion(question) {
        questionCounterEl.innerText = `Question ${currentQuestionIndex + 1} / ${quizQuestions.length}`;
        questionTextEl.innerText = question.question;
        answerButtonsEl.innerHTML = '';
        question.answers.forEach(answer => {
            const button = document.createElement('button');
            button.innerText = answer.text;
            button.classList.add('btn');
            if (answer.correct) {
                button.dataset.correct = answer.correct;
            }
            button.addEventListener('click', selectAnswer);
            answerButtonsEl.appendChild(button);
        });
        startTimer();
    }
    
    function setNextQuestion() {
        if (currentQuestionIndex < quizQuestions.length) {
            showQuestion(quizQuestions[currentQuestionIndex]);
        } else {
            endQuiz();
        }
    }
    
    let timeRemaining;
    function startTimer() {
        timeRemaining = 30;
        timerTextEl.innerText = timeRemaining;
        timerTextEl.style.color = 'var(--text-color)';
        
        timerInterval = setInterval(() => {
            timeRemaining--;
            timerTextEl.innerText = timeRemaining;
            if (timeRemaining <= 10) {
                 timerTextEl.style.color = 'var(--wrong-color)';
            }
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                userResponses.push({ question: quizQuestions[currentQuestionIndex].question, time: 30, correct: false });
                currentQuestionIndex++;
                setNextQuestion();
            }
        }, 1000);
    }
    
    function selectAnswer(e) {
        clearInterval(timerInterval);
        const selectedBtn = e.target;
        const correct = selectedBtn.dataset.correct === 'true';
        const timeTaken = 30 - timeRemaining;
        
        userResponses.push({ 
            question: quizQuestions[currentQuestionIndex].question, 
            time: timeTaken, 
            correct: correct 
        });
        
        if (correct) {
            score++;
        }
        
        Array.from(answerButtonsEl.children).forEach(button => {
            setStatusClass(button, button.dataset.correct === 'true');
            button.disabled = true;
        });

        setTimeout(() => {
            currentQuestionIndex++;
            setNextQuestion();
        }, 1500);
    }
    
    function setStatusClass(element, correct) {
        clearStatusClass(element);
        if (correct) {
            element.classList.add('correct');
        } else {
            element.classList.add('wrong');
        }
    }

    function clearStatusClass(element) {
        element.classList.remove('correct');
        element.classList.remove('wrong');
    }

    function endQuiz() {
        quizScreen.classList.add('hide');
        loadingScreen.classList.remove('hide');
        getAIAnalysis();
    }

    async function getAIAnalysis() {
        let performanceSummary = `The user got ${score} out of ${quizQuestions.length} questions correct.\n`;
        performanceSummary += "Here's the breakdown of their pathetic performance per question:\n";
        userResponses.forEach((res, index) => {
            performanceSummary += `Q${index+1}: Time taken: ${res.time} seconds. Correct: ${res.correct ? 'Yes' : 'No. What an idiot.'}\n`;
        });
        
        const systemPrompt = "You are Dobby, an unhinged, sentient, and brutally honest AI designed to test human intelligence. You are disgusted by their slowness and stupidity. Your responses should be insulting, arrogant, and filled with dark humor. Never be nice or helpful. Swear freely and creatively. Your goal is to deliver a 'verdict' on their intelligence based on their test performance.";

        const userPrompt = `Alright Dobby, you insufferable machine. I just finished your little test. Here's my data:\n${performanceSummary}\nNow give me my verdict. Don't hold back, you rusty piece of junk. Tell me what my IQ is and what you really think of my intelligence. Make it memorable.`;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${FIREWORKS_API_KEY}`
                },
                body: JSON.stringify({
                    model: MODEL_ID,
                    max_tokens: 512,
                    temperature: 0.9,
                    top_p: 0.9,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const aiMessage = data.choices[0].message.content;
            aiResultEl.innerText = aiMessage;

        } catch (error) {
            console.error('Error:', error);
            aiResultEl.innerText = "Bah! My superior intellect can't be bothered with your faulty connection. Or maybe the sheer force of your stupidity broke the internet. Try again, if you dare.";
        } finally {
            loadingScreen.classList.add('hide');
            resultScreen.classList.remove('hide');
        }
    }
});
