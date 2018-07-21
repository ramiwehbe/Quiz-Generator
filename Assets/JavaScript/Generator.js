$(document).ready(function () {
  var config = {
    apiKey: "AIzaSyC8QDi1kwLlQ9a1F5c5M7iMlSF8Sbpu-FQ",
    authDomain: "quiz-generator-4536b.firebaseapp.com",
    databaseURL: "https://quiz-generator-4536b.firebaseio.com",
    projectId: "quiz-generator-4536b",
    storageBucket: "quiz-generator-4536b.appspot.com",
    messagingSenderId: "557598213958"
  };
  firebase.initializeApp(config);
  const database = firebase.database();
  //let quizCount = 1;
  // on page load check to see if the url has a key at the end and load that
  // particular quiz if it does
  let quizKey = window.location.href.split('=')[1]
  if (quizKey) {
    retreiveSingleQuiz(quizKey, function (quiz) {
      if (quiz) { display(quiz) }
    })
  }
  
  let currentQuiz = {
    questions: []
  }

  function Quiz(title, questions) {
    this.title = title;
    this.questions = questions;
  }

  $('#submit').on('click', function (e) {
    e.preventDefault();
    let questionTitle = $('#input-question').val().trim();

    let options = [
      $('#answer-1').val().trim(),
      $('#answer-2').val().trim(),
      $('#answer-3').val().trim(),
      $('#answer-4').val().trim()
    ].filter(option => option)

    // maybe add a dropdown to set the correct answer index
    correctOptionIndex = 0;

    generateQuestion(questionTitle, options, correctOptionIndex);
  })

  // ajax call to generate a function
  $('#generateSports').on('click', function (e) {
    e.preventDefault();

    // don't touch this stuff works!
    let category = $('#category').val().trim();
    let difficulty = $('#difficulty').val().trim();
    let type = $('#type').val().trim();
    let catArray = ['generalKnowledge', 'books', 'film', 'music', 'musicals', 'tv', 'videoGames', 'boardGames', 'scienceNature', 'computers',
      'maths', 'mythology', 'sports', 'geography', 'history', 'politics', 'art', 'celebs', 'animals', 'comics', 'gadgets', 'japanese', 'cartoons'
    ];
    let catIndex = '';
    for (let i = 0; i < catArray.length; i++) {
      if (category === catArray[i]) {
        catIndex = i + 9;
      }
    }

    // make the request
    let queryURL = `https://opentdb.com/api.php?amount=1&category=${catIndex}&difficulty=${difficulty}&type=${type}`;
    $.ajax({
      url: queryURL,
      method: 'GET'
    }).then(function (response) {

      let results = response.results;
      let questionTitle = results[0].question;
      let correctAnswer = results[0].correct_answer;
      let incorrectAnswers = results[0].incorrect_answers;
      let options = [
        correctAnswer,
        ...incorrectAnswers
      ]

      options = shuffle(options)

      let correctOptionIndex = options.indexOf(correctAnswer)

      generateQuestion(questionTitle, options, correctOptionIndex)

    })
  })

  // click handler for creating a new quiz and pushing it to firebase
  $('.submit-quiz').click(submitQuiz)

  function submitQuiz() {
    database
      .ref()
      .push(
        new Quiz($('#quizTitle').val(), currentQuiz.questions)
      );
  }

  // show the quiz buttons on the left side
  database.ref().on('child_added', function (snapshot) {
    const quiz = snapshot.val();
    $('.quizes').append(`<button value="${snapshot.key}">${quiz.title}</button>`)
    $('.deleteQuiz').append(`<button value="${snapshot.key}"> Delete ${quiz.title}</button>`)
  })

  // click handler for selecting a quiz from the left side,
  $(document).on('click', '.quizes > button', function (e) {
    e.preventDefault();
    $('#question-table').empty()
    let key = $(this).val();
    retreiveSingleQuiz(key, function (quiz) {
      display(quiz);
    })
  })
  
  $(document).on('click', '.deleteQuiz > button', delQuiz)

  $('.remove-quiz').click(removeQuiz)



  /* UTILS
  ===============================================*/
  function delQuiz(e) {
    e.preventDefault();
    console.log('value', $(this).val())
    database.ref($(this).val()).remove().then(function () {
      console.log("remove succeeded.");
    }).catch(function (error) {
      console.log("remove failed: " + error.message);
    });
    reload();
  }
  function removeQuiz(e) {
    e.preventDefault();
    database.ref($(this).currentQuiz).remove().then(function () {
      console.log("remove succeeded.");
    }).catch(function (error) {
      console.log("remove failed: " + error.message);
    });
    reload();
  }

  function reload() { location.reload(); }

  function retreiveSingleQuiz(key, callback) {
    database.ref(key).once('value', function (snapshot) {
      callback(snapshot.val())
    })
  }

  function generateQuestion(question, options, correctOptionIndex) {
    currentQuiz.questions.push({
      question,
      options,
      correctOptionIndex
    })
    display(currentQuiz)
  }

  function display(quiz) {
    if (!quiz) return;

    $('#question-table').empty();

    $("#question-table").append(`<thead>${quiz.title}</thead>`)

    let count = 0;

    // loops through the questions first
    quiz.questions.forEach((question, index) => {

      count++;

      $("#question-table").append(`<tr><th>${count}. ${question.question} </th></tr>`);

      // maps through the options of the question
      let questionHtml = question.options.map((option, index) => {
        return (
          `<tr><td><input type='radio' name = 'option${count}' />${option}</td></tr>`
        )
      }).join('\n')

      $("#question-table").append(questionHtml)
    })
  }

  function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
    }
    return a;
  }
})      