'use strict';

import quizData from "./quiz-data.json" assert { type: "json" };
import servicesData from "./services.json" assert { type: "json" };



// SERVICE FEATURES 
const invoiceDataElm = document.getElementById('invoice-data')
const gstInvoiceElm = document.getElementById('gst');
const pstInvoiceElm = document.getElementById('pst')
const totalInvoiceElm = document.getElementById('total');


const services = servicesData.services;
const addBtnPhrase = 'Add to invoice';
const removeBtnPhrase = 'Remove from invoice';

let servicesInCart = [];


function manageAddBtnClick(e) {
    const index = e.target.getAttribute('data-index');
    if (e.target.classList.contains('button--remove')) {
        e.target.innerHTML = addBtnPhrase;
        removeServiceFromCalculator(index);
    } else {
        e.target.innerHTML = removeBtnPhrase;
        addServiceToCalculator(index);
    }
    e.target.classList.toggle('button--remove')
}


function addServiceToCalculator(index) {
    servicesInCart.unshift({ name: services[index].name, price: services[index].price, index: index });
    // Use this structure for other thing as well
    outputToHTML(buildInvoiceItems(), invoiceDataElm);
}

function removeServiceFromCalculator(index) {
    servicesInCart = servicesInCart.filter(item => {
        return item.index !== index;
    });

    outputToHTML(buildInvoiceItems(), invoiceDataElm);
}

function buildInvoiceItems() {
    updateInvoice()
    let output = [];

    servicesInCart.forEach(item => {
        output.push(`<div class="invoice-name-price">${item.name}<p></p><p>${item.price}</p></div>`);
    })

    return output;
}

function updateInvoice() {
    let total = 0;
    for (const item of servicesInCart) {
        total += item.price;
    }


    const gst = roundMoney(total * 0.05);
    const pst = roundMoney(total * 0.07);
    const taxTotal = roundMoney(total + gst + pst);

    totalInvoiceElm.innerHTML = taxTotal;
    gstInvoiceElm.innerHTML = gst;
    pstInvoiceElm.innerHTML = pst;
}

function roundMoney(num) {
    return Math.ceil(num * 100) / 100;
}

// FILTER BUTTONS
const filterBtns = document.querySelectorAll('button.filter-chips__button');
const serviceCardContainerElm = document.getElementById('service-card-container');

// Initial cards
outputToHTML(buildServiceCards(services), serviceCardContainerElm);
addlistenerToBtns();

filterBtns.forEach(filterBtn => {
    filterBtn.addEventListener('click', manageFilterBtnClick);
})

function manageFilterBtnClick(e) {
    const activeBtn = document.querySelector('.filter-chips__button--active')
    activeBtn.classList.remove('filter-chips__button--active')
    e.target.classList.add('filter-chips__button--active');

    const filterStr = e.target.getAttribute('data-filter');
    if (filterStr == 'all') {
        outputToHTML(buildServiceCards(services), serviceCardContainerElm);
        addlistenerToBtns();
    } else {
        const filteredServices = services.filter(service => service.tags.includes(filterStr));
        outputToHTML(buildServiceCards(filteredServices), serviceCardContainerElm);
        addlistenerToBtns();
    }
}

function buildServiceCards(filteredServices) {
    let output = [];

    filteredServices.forEach(service => {
        const isInCart = servicesInCart.find(serviceInCart => {
            return serviceInCart.index == service.index;
        });

        output.push(`
            <div class="service-card" id="${service.id}">
                <div>
                    <img class="service-card__image" src="${service.image}" alt="${service.name}">
                    <p class="service-card__price">Price: $${service.price}</p>
                    <h3>${service.name}</h3>
                    <p>${service.description}</p>
                </div>
                <button class="button button--invoice ${isInCart ? 'button--remove' : ''}" data-index="${service.index}">${isInCart ? removeBtnPhrase : addBtnPhrase}</button>
            </div>
        `);
    });    

    return output;
}

function addlistenerToBtns() {
    const addBtns = document.querySelectorAll('.button--invoice');
    addBtns.forEach(addBtn => {
        addBtn.addEventListener('click', manageAddBtnClick);
    })
}





// QUIZ LOGIC

// Global Variables
let answerPoints = [ 0, 0, 0, 0, 0, 0, 0 ];
let currentQuestion = 0;
let userAnswers = [];
const totalQuestions = quizData.questions.length;

// Get reference to elements
const formElm = document.getElementById('quiz');
const quizDataElm = document.getElementById('quiz-data');
const startQuizScreenElm = document.getElementById('start-quiz-screen');
const stepTextElm = document.getElementById('step-text');
const progressLineElm = document.querySelector('.progress-bar-line');

// Get reference to button elements
const nextBtn = document.getElementById('next');
const backBtn = document.getElementById('back');
const startQuizBtn = document.getElementById('start-quiz-btn');

// Add event listeners to buttons
nextBtn.addEventListener("click", nextQuestion);
backBtn.addEventListener("click", previousQuestion);
startQuizBtn.addEventListener("click", startQuiz);

// Prevent default form behavior
formElm.addEventListener('submit', e => {
    e.preventDefault();
});

// Add event listener to quiz data container which updates the userAnswer variable to the currently checked radio input
quizDataElm.addEventListener('click', event => {
    const target = event.target;
    if (target.type === 'radio') {
      const userAnswer = target.value;
      userAnswers[currentQuestion] = userAnswer;
    }
});


// Transitions away from start quiz screen and updates the quizzes state.
function startQuiz() {
    startQuizScreenElm.style.opacity = 0;  
    formElm.style.height = '520px';

    setTimeout(() => {
        startQuizScreenElm.style.display = 'none';
        formElm.style.overflow = 'auto';
        updateQuizState();
    }, 300);
}

// Updates the quiz state to reflect the various variables that control the quiz
function updateQuizState() {
    let output = [];
    let currentAnswers = [];

    // If one the first step, hide the back button
    if (currentQuestion <= 0) {
        backBtn.style.visibility = 'hidden';
    } else {
        backBtn.style.visibility = 'visible';
    }
    
    // Update the step text and the progress bar
    stepTextElm.innerHTML = `Step ${currentQuestion + 1} of ${totalQuestions + 1}`;
    progressLineElm.style.width = `${(currentQuestion / totalQuestions) * 100}%`;

    // Instantiate the question variable with the current question object
    const question = quizData.questions[currentQuestion];

    // Push the question string onto the output array
    output.push(`<h3>${question.question}</h3>`);

    // Pushes the answer strings onto the currentAnswers array
    question.answers.forEach(answer => {
        currentAnswers.push(answer.answer);
    });

    // Push the HTML code for elements using the available answer data onto the output array
    currentAnswers.forEach((answer, i) => {
        // If the user selected this answer previously, give that answer the checked attribute
        if (i == userAnswers[currentQuestion]) {
            output.push(`<input type="radio" id="${i}" name="answer" value="${i}" checked><label for="${i}">${answer}</label><br>`);
        } else {
            output.push(`<input type="radio" id="${i}" name="answer" value="${i}"><label for="${i}">${answer}</label><br>`);
        }
    });

    outputToHTML(output, quizDataElm);
}

// Increment current question, get results, update quiz state
function nextQuestion() {
    currentQuestion++;

    if (currentQuestion >= totalQuestions) {
        getQuizResult()
        nextBtn.style.visibility = 'hidden';
        backBtn.value = 'Reset Quiz';
    } else {
        updateQuizState();
    }
}

// Decrement current question, reset, update quiz state
function previousQuestion() {
    // If current step is the final then Reset variables to default
    if (currentQuestion >= totalQuestions) {
        nextBtn.style.visibility = 'visible';
        backBtn.value = 'Back';

        answerPoints = [ 0, 0, 0, 0, 0, 0, 0 ];
        currentQuestion = 0;
        userAnswers = [];
    } else {
        currentQuestion--;
    }

    updateQuizState();
}

// Calculate winning diagnosis and change quiz to reflect
function getQuizResult() {
    let output = [];

    stepTextElm.innerHTML = `Step ${totalQuestions + 1} of ${totalQuestions + 1}`;
    progressLineElm.style.width = '100%';

    calculatePoints();

    // "..." Spreads the answerPoints array into separate arguments which the Math.max function requires
    let largest =  Math.max(...answerPoints);
    let largestIndex = answerPoints.indexOf(largest);

    // Separating the code for each html element is more readable and looks nice when put through the outputToHTML method
    output.push(`<h3>${quizData.treatments[largestIndex].name}</h3>`)
    output.push(`<p>${quizData.treatments[largestIndex].description}</p>`);
    output.push(`<a href="#${servicesData.services[largestIndex].id}">Scroll to ${quizData.treatments[largestIndex].name}</a>`)

    outputToHTML(output, quizDataElm);
}

// Calculate the points based on the userAnswers array
function calculatePoints() {
    userAnswers.forEach((answer, i) => {
        const answerPointsArr = quizData.questions[i].answers[answer].points;
        answerPointsArr.forEach((answerPoint, i) => {
            answerPoints[i] += answerPoint;
        })
    })
}

// Given the an array of strings containing code for html elements and a reference to a parent in which to append the output. Each element of the output array is added consecutively with a delay and transition (because it looks good)
function outputToHTML(output, parentElem) {
    // Remove children in parent before adding the new elements
    removeAllChildNodes(parentElem);
    let delay = 150;

    output.forEach((element, index) => {
        const div = document.createElement('div');
        div.innerHTML = element;
        div.style.opacity = 0;
        div.style.transition = `opacity ${delay}ms linear`;
    
        parentElem.appendChild(div);
    
        setTimeout(() => {
        div.style.opacity = 1;
        }, delay);
    
        // Increase speed of transition for each element. I think it looks more pleasing
        delay += 80 * Math.pow(0.8, index);
    });
}

// Removes all child nodes of a parent
function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}