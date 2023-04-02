'use strict';

import quizData from "./quiz-data.json" assert { type: "json" };
import servicesData from "./services.json" assert { type: "json" };


console.log(servicesData)
const services = servicesData.services;
let serviceCardsHTML = '';

services.forEach(service => {
  serviceCardsHTML += `
    <div class="service-card" id="${service.id}">
        <div>
            <img class="service-card__image" src="${service.image}" alt="${service.name}">
            <h3>${service.name}</h3>
            <p>Price: $${service.price}</p>
            <p>${service.description}</p>
        </div>
        <button class="button button--add">Add to calculator</button>
    </div>
  `;
});

console.log(serviceCardsHTML);

const serviceCardContainerElm = document.getElementById('service-card-container');
console.log(serviceCardContainerElm);
serviceCardContainerElm.innerHTML = serviceCardsHTML;





// QUIZ LOGIC

let displayAnswers = [];
let answerPoints = [ 0, 0, 0, 0, 0, 0, 0 ];
let currentQuestion = 0;
let userAnswers = [];

const formElm = document.getElementById('quiz');
const quizDataElm = document.getElementById('quiz-data');
const questionsArr = quizData.questions;
const nextBtn = document.getElementById('next');
const backBtn = document.getElementById('back');
const startQuizBtn = document.getElementById('start-quiz-btn');
const startQuizScreenElm = document.getElementById('start-quiz-screen');
const stepTextElm = document.getElementById('step-text');
const progressLineElm = document.querySelector('.progress-bar-line');

nextBtn.addEventListener("click", nextQuestion);
backBtn.addEventListener("click", previousQuestion);
startQuizBtn.addEventListener("click", startQuiz);


formElm.addEventListener('submit', e => {
    e.preventDefault();
});

quizDataElm.addEventListener('click', event => {
    const target = event.target;
    if (target.type === 'radio') {
      const userAnswer = target.value;
      userAnswers[currentQuestion] = userAnswer;
    }
});

function startQuiz() {
    startQuizScreenElm.style.opacity = 0;  
    setTimeout(() => {
        startQuizScreenElm.style.display = 'none';
        quizDataElm.style.height = '17rem';
        updateQuizState();
    }, 300);
}




function updateQuizState() {
    let output = [];
    if (currentQuestion <= 0) {
        backBtn.style.visibility = 'hidden';
    } else {
        backBtn.style.visibility = 'visible';
    }
    

    stepTextElm.innerHTML = `Step ${currentQuestion + 1} of ${questionsArr.length + 1}`;
    progressLineElm.style.width = `${(currentQuestion / questionsArr.length) * 100}%`;

    const questionObj = questionsArr[currentQuestion];

    questionObj.answers.forEach(answerObj => {
        displayAnswers.push(answerObj.answer);
    });

    output.push(`<h3>${questionObj.question}</h3>`);

    displayAnswers.forEach((answer, i) => {
        // if the user selected this answer previously, give that answer the checked attribute
        if (i == userAnswers[currentQuestion]) {
            output.push(`<input type="radio" id="${i}" name="answer" value="${i}" checked><label for="${i}">${answer}</label><br>`);
        } else {
            output.push(`<input type="radio" id="${i}" name="answer" value="${i}"><label for="${i}">${answer}</label><br>`);
        }
    });

    outputToHTML(output);
    // quizDataElm.innerHTML = output.join('');
}



function nextQuestion() {
    currentQuestion++;
    resetQuiz();

    if (currentQuestion >= questionsArr.length) {
        getQuizResult()
        nextBtn.style.visibility = 'hidden';
        backBtn.value = 'Reset Quiz';
    } else {
        updateQuizState();
    }
}

function previousQuestion() {
    if (currentQuestion >= questionsArr.length) {
        nextBtn.style.visibility = 'visible';
        backBtn.value = 'Back';
        currentQuestion = 0;
    } else {
        currentQuestion--;
    }

    resetQuiz();

    updateQuizState();
}


function resetQuiz() {
    quizDataElm.innerHTML = "";
    displayAnswers = [];
}


function calculatePoints() {
    userAnswers.forEach((answer, i) => {
        const answerPointsArr = questionsArr[i].answers[answer].points;
        answerPointsArr.forEach((answerPoint, i) => {
            answerPoints[i] += answerPoint;
        })
    })
}




function getQuizResult() {
    let output = [];
    console.log(userAnswers);
    stepTextElm.innerHTML = `Step ${questionsArr.length + 1} of ${questionsArr.length + 1}`;
    progressLineElm.style.width = '100%';

    calculatePoints();

    let largest = answerPoints[0];
    let largestIndex = 0;
    for (let i = 0; i < answerPoints.length; i++) {
        if (largest < answerPoints[i]) {
            largest = answerPoints[i];
            largestIndex = i;
        }
    }

    console.log(largestIndex);
    output.push(`<h3>${quizData.treatments[largestIndex].name}</h3>`)
    output.push(`<p>${quizData.treatments[largestIndex].description}</p>`);
    output.push(`<a href="#${servicesData.services[largestIndex].id}">Scroll to ${quizData.treatments[largestIndex].name}</a>`)
    outputToHTML(output);
}

function outputToHTML(output) {
    let delay = 0;

    output.forEach((element, index) => {
        const div = document.createElement('div');
        div.innerHTML = element;
        div.style.opacity = 0;
        div.style.transition = `opacity ${delay}ms linear`;
    
        quizDataElm.appendChild(div);
    
        setTimeout(() => {
        div.style.opacity = 1;
        }, delay);
    
        // Increase speed of transition for each element. I think it looks more pleasing
        delay += 80 * Math.pow(0.8, index);
    });
}