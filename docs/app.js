'use strict';

import data from "./normalized_data.json" assert { type: "json" };



// - Manual and Manipulative Therapy
// Intramuscular Stimulation (IMS)
// Acupuncture
// Treatment for TMJ Dysfunction
// Sports Therapy


let availableAnswers = [];
let output = [];
let currentQuestion = 0;
let answerPoints = [ 0, 0, 0, 0, 0, 0, 0 ];

const quizContainer = document.getElementById('quiz-questions');
const questionsArr = data.questions;
const nextBtn = document.querySelector('#next');
nextBtn.addEventListener("click", nextQuestion);


populateQuiz();

function populateQuiz() {
    const questionObj = questionsArr[currentQuestion];

    questionObj.answers.forEach(answerObj => {
        availableAnswers.push(answerObj.answer);
    });

    output.push(`<h3>${questionObj.question}</h3>`);

    availableAnswers.forEach((answer, i) => {
        output.push(`<input type="radio" id="${i}" name="answer" value="${i}"><label for="${i}">${answer}</label><br>`);
    });

    quizContainer.innerHTML = output.join('');
}

console.log(questionsArr.length);

function nextQuestion() {

    console.log(document.querySelector('input[name="answer"]:checked'));
    const userAnswer = document.querySelector('input[name="answer"]:checked').value;

    questionsArr[currentQuestion].answers[userAnswer].points.forEach((answerPoint, i) => {
        console.log(typeof answerPoint)
        answerPoints[i] += answerPoint;
    })

    console.log(answerPoints)
    console.log(currentQuestion);
    quizContainer.innerHTML = "";
    availableAnswers = [];
    output = [];

    if (currentQuestion >= questionsArr.length -1) {
        console.log("final result");
        getFinalResult()
    } else {
        currentQuestion ++;
        populateQuiz();
    }
}

function getFinalResult() {
    let largest = answerPoints[0];
    let largestIndex = 0;
    for (let i = 0; i < answerPoints.length; i++) {
        if (largest < answerPoints[i]) {
            largest = answerPoints[i];
            largestIndex = i;
        }
    }

    console.log(largestIndex);
    quizContainer.innerHTML = data.treatments[largestIndex].name + "\n \n" + data.treatments[largestIndex].description;
}













function getAnswers(question) {
    return question.answers.map(answer => {return "\n" + answer.answer});
}

function runPromptQuiz() {
    questionsArr.forEach(question =>{
        let answerIndex;
        // Convert to int
        answerIndex = (prompt(question.question + getAnswers(question)));
        console.log(answerIndex);
        console.log(question.answers[answerIndex]);
        question.answers[answerIndex].points.forEach((answerPoint, index) => {
            console.log(typeof answerPoint)
            answerPoints[index] += answerPoint;
        })
        console.log(answerPoints)
    })



    console.log(largestIndex);
    alert(data.treatments[largestIndex].name + "\n \n" + data.treatments[largestIndex].description);
}