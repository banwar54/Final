import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Queue.css";
import "../styles/Quiz.css";

const QUEUE_URL = "http://localhost:5000";

const Quiz1 = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [QuestionData, setQuestionData] = useState(null);
  const [TopicData, setTopicData] = useState(null);
  const [GameId, setGameId] = useState(null);
  
  const [ShowingTopic, setShowingTopic] = useState(false);
  const [TopicTime, setTopicTime] = useState(10);

  const [ShowingQuiz, setShowingQuiz] = useState(false);
  const [QuizTime, setQuizTime] = useState(50);
  const [QuizCompleted, setQuizCompletion] = useState(false);

  const [CurrentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [SelectedAnswers, setSelectedAnswers] = useState(new Array(5).fill(null));
  const [AnswersSubmitted, setAnswersSubmitted] = useState(false);

  const [Score, setScore] = useState(0);


  useEffect(() => {
    const start_game = async () =>{
      let response;
      try {
        response = await fetch(`${QUEUE_URL}/quiz1/start`,{
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setQuestionData(data.questions[0]);
        setTopicData(data.topic[0]);
        setGameId(data.gameId);

      } catch (error) {
        console.log("Error parsing data", error);
      }
    }
    start_game();
  },[] );


  useEffect(() => {
    if (TopicData) {
      setShowingTopic(true);
    };
  }, [TopicData]);

  useEffect(() =>{
    if(!ShowingTopic) return;

    if(TopicTime<=0){
      setShowingQuiz(true);
      setShowingTopic(false);
      return;
    }

    const timer = setInterval(() => {
      setTopicTime((prev) => prev-1);
    },1000);

    return () => clearInterval(timer);
  }, [TopicTime,ShowingTopic])

  useEffect(() => {
    if(!ShowingQuiz || QuizCompleted)  return;

    if(QuizTime <=0){
      handleGameEnd();
      return;
    }

    const timer = setInterval(() => {
      setQuizTime((prev) => prev-1);
    },1000);

    return () =>clearInterval(timer);
  }, [QuizTime, ShowingQuiz]);

  // Calculate score based on answers
  const calculateScore = () => {
    if (!QuestionData) return 0;

    let totalScore = 0;

    for (let i = 0; i < 5; i++) {
      const answerKey = `q${i + 1}ans`;
      if (SelectedAnswers[i] && SelectedAnswers[i] === QuestionData[answerKey]) {
        totalScore += 1;
      }
    }
    return totalScore;
  };

  // Submit score to backend
  const submitQuizScore = async (Score) => {
    if (AnswersSubmitted) return;

    if (!GameId) {
      console.error("No game ID found");
      return;
    }
    console.log(`Submitting score for ${GameId}`)

    // Create result payload
    const result = {
      gameId: GameId,
      score: Score,
    };

    // Send score to backend
    try{
      await fetch(`${QUEUE_URL}/quiz1/end`,{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(result)
      });
    } catch(error){
      console.log("Error Sending result to backend", error);
    }
    setAnswersSubmitted(true);
  };

  const handleGameEnd = async ()=>{
    setQuizCompletion(true);
    const finalScore = calculateScore();
    setScore(finalScore)
    submitQuizScore(finalScore);
  }

  if (ShowingQuiz ) {
    // Quiz content - original quiz implementation
    const questionKey = `q${CurrentQuestionIndex + 1}`;
    const options = [
      QuestionData[`${questionKey}o1`],
      QuestionData[`${questionKey}o2`],
      QuestionData[`${questionKey}o3`],
      QuestionData[`${questionKey}o4`],
    ];

    return (
      <div className="pageWrapper">
        <div className="container">
          <div className="overlay"></div>

          {QuizCompleted ? (
            <div className="modal">
              <h2 style={{ color: AnswersSubmitted ? "#28a745" : "red", fontSize: "24px", marginBottom: "20px" }}>
                {AnswersSubmitted ? "Quiz Complete!" : "Quiz Completed"}
              </h2>
              <p>You answered {SelectedAnswers.filter((answer) => answer !== null).length} out of 5 questions</p>
              <p>Your score: {Score} / 5</p>
              <p>Time remaining: {QuizTime} seconds</p>

              <button className="backButton" onClick={() => navigate("/arena")}>
                Back to Arena
              </button>
            </div>
          ) : (
            <div className="quizCard">
              <h2 className="heading">Quiz Time!</h2>

              {/* Circular Timer */}
              <div className="timerContainer">
                <svg width="100" height="100">
                  {/* Background Circle */}
                  <circle cx="50" cy="50" r="40" stroke="#555" strokeWidth="8" fill="none" />
                  {/* Progress Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={QuizTime < 15 ? "red" : "limegreen"}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray="251.2"
                    strokeDashoffset={(1 - QuizTime / 50) * 251.2}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                    style={{ transition: "stroke-dashoffset 1s linear" }}
                  />
                  {/* Timer Text */}
                  <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="18px" fill="white">
                    {QuizTime}s
                  </text>
                </svg>
              </div>

              <div className="progressBar">
                <div className="progressIndicator" style={{ width: `${((CurrentQuestionIndex + 1) / 5) * 100}%` }}></div>
                <span className="progressText">Question {CurrentQuestionIndex + 1} of 5</span>
              </div>

              <div className="questionContainer">
                <p className="question">{QuestionData[questionKey]}</p>
                <div className="optionsContainer">
                  {options.map((option, index) => (
                    <button
                      key={index}
                      className="option"
                      style={{
                        background: SelectedAnswers[CurrentQuestionIndex] === option ? "#ff416c" : "#6a11cb",
                      }}
                      onClick={() => {
                        const updatedAnswers = [...SelectedAnswers];
                        updatedAnswers[CurrentQuestionIndex] = option;
                        setSelectedAnswers(updatedAnswers);
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <div className="navButtons">
                <button
                  className="navButton"
                  style={{ visibility: CurrentQuestionIndex === 0 ? "hidden" : "visible" }}
                  onClick={() => setCurrentQuestionIndex(CurrentQuestionIndex - 1)}
                >
                  Prev
                </button>
                <button
                  className="navButton"
                  style={{ visibility: CurrentQuestionIndex === 4 ? "hidden" : "visible" }}
                  onClick={() => setCurrentQuestionIndex(CurrentQuestionIndex + 1)}
                >
                  Next
                </button>
              </div>
              {CurrentQuestionIndex === 4 && (
                <div style={{ marginTop: "20px" }}>
                  <button className="finishButton" onClick={handleGameEnd}>
                    Finish Quiz
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if(!ShowingTopic){
    return (
      <div className="main-pageWrapper-styles">
        <div className="container">
            <h1 className="title-styles">Solo Game</h1>
            <p className="spinner"></p>
            <p className="message-styles">Starting Game, please wait....</p>
        </div> 
      </div> 
    );
  }
  
  return (
    <div className="pageWrapper">
      <div className="container">
        <div className="overlay"></div>
          <div className="card">
            <h2 className="heading">{TopicData.topic_name}</h2>
            <p className="description">{TopicData.topic_description}</p>
            {/* Circular Timer */}
            <div className="timerContainer">
              <svg width="140" height="140">
                {/* Background Circle */}
                <circle cx="70" cy="70" r="60" stroke="#555" strokeWidth="10" fill="none" />
                {/* Progress Circle */}
                <circle
                  cx="70"
                  cy="70"
                  r="60"
                  stroke="limegreen"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray="377"
                  strokeDashoffset={(1 - TopicTime / 10) * 377}
                  strokeLinecap="round"
                  transform="rotate(-90 70 70)"
                  style={{ transition: "stroke-dashoffset 1s linear" }}
                />
                {/* Timer Text */}
                <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="24px" fill="white">
                  {TopicTime}s
                </text>
              </svg>
            </div>
            <p className="timerText">Quiz starts in {TopicTime} seconds...</p>
          </div>
      </div>
    </div>
  );
};

export default Quiz1;