"use strict";

/* 
The code within the anonymous function is split into three sections
    || SERVICE CARD
    || FILTERING
    || QUIZ
*/


/* I'm not very familiar with async programming in javascript but I've done my best to implement it properly. 
As far as I can tell this method of making json available to the code has the most browser support */

// Fetches and parses the quiz json and returns a javascript object
function fetchQuizJson() {
    return fetch('./quiz.json')
        .then(response => response.json());
}

// Fetches and parses the services json and returns a javascript object
function fetchServicesJson() {
    return fetch('./services.json')
        .then(response => response.json());
}

/* The "promise.all" method fulfills its own promise when both fetch functions fulfill their respective promises (if they were successful).
If the promise is fulfilled the ".then" method calls an arrow function (containing the bulk of the code) passing it the results of fetch functions as arguments.
This means the code will only run after both fetch functions have successfully fetched and parsed the json */
Promise.all([fetchQuizJson(), fetchServicesJson()])
  .then(([quizData, servicesData]) => {

    // Global Variables used in all sections
    const services = servicesData.services;
    const quiz = quizData.questions;


    // || SERVICE CARDS
    // Global Variables
    const addBtnPhrase = "Add to invoice";
    const removeBtnPhrase = "Remove from invoice";
    const pricePrefix = "$"
    let servicesInCart = [];

    // Element References
    const invoiceDataElm = document.getElementById("invoice-data");
    const gstInvoiceElm = document.getElementById("gst");
    const pstInvoiceElm = document.getElementById("pst");
    const totalInvoiceElm = document.getElementById("total");

    // Add event listeners to invoice buttons (The buttons on the service cards that allow you to add and remove items from the invoice summary)
    function addlistenerToInvoiceBtns() {
        const addBtns = document.querySelectorAll('.button--invoice');
        addBtns.forEach(addBtn => {
            addBtn.addEventListener('click', manageInvoiceBtnClick);
        })
    }

    // Output the all the cards initially
    outputToHTML(buildServiceCards(services), serviceCardContainerElm);
    addlistenerToInvoiceBtns();

    // This function manages the behavior of invoice buttons when clicked. Depending on the state of the button a different action is taken. The button state is toggled
    function manageInvoiceBtnClick(e) {
        /* Gets the string contained in the clicked button elements data-index attribute. 
          This is the index of the associated service in the services array */
        const index = e.target.getAttribute("data-index");

        // Take the action indicated by the button state then toggles the content of the the button between two phrases to reflect the action it will take next
        if (e.target.classList.contains("button--remove")) {
            e.target.innerHTML = addBtnPhrase;
            removeServiceFromCalculator(index);
        } else {
            e.target.innerHTML = removeBtnPhrase;
            addServiceToCalculator(index);
        }

        // Toggle the "button-remove" class. (less code then adding / removing in the above step)
        e.target.classList.toggle("button--remove");
    }

    // Add the relevant information of the service in which the button was clicked on to the beginning of the "servicesInCart" Array
    function addServiceToCalculator(index) {
        servicesInCart.unshift({
            name: services[index].name,
            price: services[index].price,
            index: index,
        });
        outputToHTML(buildInvoiceItems(), invoiceDataElm);
    }

    // Remove the serviceInCart with the index of the service in which the button was clicked
    function removeServiceFromCalculator(index) {
        servicesInCart = servicesInCart.filter((item) => {
            return item.index !== index;
        });

        outputToHTML(buildInvoiceItems(), invoiceDataElm);
    }

    // Returns an array of strings containing HTML code. Builds the invoice items
    function buildInvoiceItems() {
        let output = [];

        updateInvoiceTotals();

        servicesInCart.forEach((item) => {
            output.push(
                `<div class="invoice-name-price">${item.name}<p></p><p>${pricePrefix + item.price}</p></div>`
            );
        });

        return output;
    }

    // Updates html for the invoice total, gst and pst
    function updateInvoiceTotals() {
        let total = 0;
        for (const item of servicesInCart) {
            total += item.price;
        }

        const gst = roundMoney(total * 0.05);
        const pst = roundMoney(total * 0.07);
        const taxTotal = roundMoney(total + gst + pst);

        totalInvoiceElm.innerHTML = pricePrefix + taxTotal;
        gstInvoiceElm.innerHTML = pricePrefix + gst;
        pstInvoiceElm.innerHTML = pricePrefix + pst;
    }

    // Returns a number to the nearest hundredth
    function roundMoney(num) {
        return Math.ceil(num * 100) / 100;
    }


    // || FILTERING
    // Element References
    const filterBtns = document.querySelectorAll("button.filter-chips__button");
    const serviceCardContainerElm = document.getElementById("service-card-container");

    // Add event listeners to filter buttons
    filterBtns.forEach((filterBtn) => {
        filterBtn.addEventListener("click", manageFilterBtnClick);
    });

    // This function manages the behavior of filter buttons when clicked
    function manageFilterBtnClick(e) {
        // The currently active button is deactivated and the clicked button is given the active class
        const activeBtn = document.querySelector(".filter-chips__button--active");
        activeBtn.classList.remove("filter-chips__button--active");
        e.target.classList.add("filter-chips__button--active");
        // Get the filter tag from the target buttons data-filter attribute
        const filterStr = e.target.getAttribute("data-filter");
        // If the filter tag is "all" build all the services, if it isn't then build only the services that have tags match the filter tag
        if (filterStr == "all") {
            outputToHTML(buildServiceCards(services), serviceCardContainerElm);
            addlistenerToInvoiceBtns();
        } else {
            const filteredServices = services.filter((service) =>
                service.tags.includes(filterStr)
            );
            outputToHTML(buildServiceCards(filteredServices), serviceCardContainerElm);
            addlistenerToInvoiceBtns();
        }
    }

    // Returns an array of strings containing HTML code. Builds the service cards
    function buildServiceCards(filteredServices) {
        let output = [];

        filteredServices.forEach((service) => {
            const isInCart = servicesInCart.find((serviceInCart) => {
                return serviceInCart.index == service.index;
            });

            output.push(`
            <div class="service-card" id="${service.id}">
                <div>
                    <img class="service-card__image" src="${service.image
                }" alt="${service.name}">
                    <p class="service-card__price">Price: ${pricePrefix + service.price}</p>
                    <h3>${service.name}</h3>
                    <p>${service.description}</p>
                </div>
                <button class="button button--invoice ${isInCart ? "button--remove" : ""
                }" data-index="${service.index}">${isInCart ? removeBtnPhrase : addBtnPhrase
                }</button>
            </div>
        `);
        });

        return output;
    }


    // || QUIZ
    // Global Variables
    let answerPoints = [0, 0, 0, 0, 0, 0, 0];
    let currentQuestion = 0;
    let userAnswers = [];
    const totalQuestions = quiz.length;

    // Element References
    const formElm = document.getElementById("quiz");
    const quizDataElm = document.getElementById("quiz-data");
    const startQuizScreenElm = document.getElementById("start-quiz-screen");
    const stepTextElm = document.getElementById("step-text");
    const progressLineElm = document.querySelector(".progress-bar-line");

    // Button Element References
    const nextBtn = document.getElementById("next");
    const backBtn = document.getElementById("back");
    const startQuizBtn = document.getElementById("start-quiz-btn");

    // Add event listeners to buttons
    nextBtn.addEventListener("click", nextQuestion);
    backBtn.addEventListener("click", previousQuestion);
    startQuizBtn.addEventListener("click", startQuiz);

    // Prevent default form behavior
    formElm.addEventListener("submit", (e) => {
        e.preventDefault();
    });

    // Add event listener to quiz data container which updates the userAnswer variable to the currently checked radio input
    quizDataElm.addEventListener("click", (event) => {
        const target = event.target;
        if (target.type === "radio") {
            const userAnswer = target.value;
            userAnswers[currentQuestion] = userAnswer;
        }
    });

    // Transitions away from start quiz screen and updates the quizzes state.
    function startQuiz() {
        startQuizScreenElm.style.opacity = 0;
        formElm.style.height = "520px";

        setTimeout(() => {
            startQuizScreenElm.style.display = "none";
            formElm.style.overflow = "auto";
            outputToHTML(buildQuiz(), quizDataElm);
        }, 300);
    }

    // Increment current question, get results, update quiz state
    function nextQuestion() {
        currentQuestion++;

        if (currentQuestion >= totalQuestions) {
            outputToHTML(buildQuizResult(), quizDataElm);
            nextBtn.style.visibility = "hidden";
            backBtn.value = "Reset Quiz";
        } else {
            outputToHTML(buildQuiz(), quizDataElm);
        }
    }

    // Decrement current question, reset, update quiz state
    function previousQuestion() {
        // If current step is the final then Reset variables to default
        if (currentQuestion >= totalQuestions) {
            nextBtn.style.visibility = "visible";
            backBtn.value = "Back";

            answerPoints = [0, 0, 0, 0, 0, 0, 0];
            currentQuestion = 0;
            userAnswers = [];
        } else {
            currentQuestion--;
        }

        outputToHTML(buildQuiz(), quizDataElm);
    }

    // Returns an array of strings containing HTML code. Updates the step info, generates the quiz question heading and radio inputs
    function buildQuiz() {
        let output = [];
        let currentAnswers = [];

        // If one the first step, hide the back button
        if (currentQuestion <= 0) {
            backBtn.style.visibility = "hidden";
        } else {
            backBtn.style.visibility = "visible";
        }

        // Update the step text and the progress bar
        stepTextElm.innerHTML = `Step ${currentQuestion + 1} of ${totalQuestions + 1
            }`;
        progressLineElm.style.width = `${(currentQuestion / totalQuestions) * 100}%`;

        // Instantiate the question variable with the current question object
        const question = quiz[currentQuestion];

        // Push the question string onto the output array
        output.push(`<h3>${question.question}</h3>`);

        // Pushes the answer strings onto the currentAnswers array
        question.answers.forEach((answer) => {
            currentAnswers.push(answer.answer);
        });

        // Push the HTML code for elements using the available answer data onto the output array
        currentAnswers.forEach((answer, i) => {
            // If the user selected this answer previously, give that answer the checked attribute
            if (i == userAnswers[currentQuestion]) {
                output.push(
                    `<input type="radio" id="${i}" name="answer" value="${i}" checked><label for="${i}">${answer}</label><br>`
                );
            } else {
                output.push(
                    `<input type="radio" id="${i}" name="answer" value="${i}"><label for="${i}">${answer}</label><br>`
                );
            }
        });

        return output;
    }

    // Returns an array of strings containing HTML code. Calculate winning diagnosis and change quiz to reflect
    function buildQuizResult() {
        let output = [];

        stepTextElm.innerHTML = `Step ${totalQuestions + 1} of ${totalQuestions + 1}`;
        progressLineElm.style.width = "100%";

        const winningServiceIndex = getWinningIndex();

        // Separating the code for each html element is more readable and looks nice when put through the outputToHTML method
        output.push(`<h3>${services[winningServiceIndex].name}</h3>`);
        output.push(`<p>${services[winningServiceIndex].description}</p>`);
        output.push(
            `<a href="#${services[winningServiceIndex].id}">Scroll to ${services[winningServiceIndex].name}</a>`
        );

        return output;
    }

    // Calculate the points based on the userAnswers array
    function getWinningIndex() {
        userAnswers.forEach((answer, i) => {
            const answerPointsArr = quiz[i].answers[answer].points;
            answerPointsArr.forEach((answerPoint, i) => {
                answerPoints[i] += answerPoint;
            });
        });

        // "..." Spreads the answerPoints array into separate arguments which the Math.max function requires
        let largest = Math.max(...answerPoints);
        return answerPoints.indexOf(largest);
    }

    // Given an array of strings containing code for html elements and a reference to a parent in which to append the output. Each element of the output array is added consecutively with a delay and transition (because it looks good)
    function outputToHTML(output, parentElem) {
        // Remove children in parent before adding the new elements
        removeAllChildNodes(parentElem);
        let delay = 150;

        output.forEach((element, index) => {
            const div = document.createElement("div");
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
});