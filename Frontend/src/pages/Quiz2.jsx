import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import "../styles/Queue.css";
import "../styles/Quiz.css";

const QUEUE_URL = "http://localhost:5000";

const Quiz2 = () => {
  const navigate = useNavigate();
  const [Socket, setSocket] = useState(null);
  const [InQueue, setInQueue] = useState(false);

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
    const newSocket = io(`${QUEUE_URL}`, {
      transports: ["websocket"],
      withCredentials: true,
    });

    // Log after connection attempt
    newSocket.on("connect", () => {
      setSocket(newSocket);
      console.log("Connected to socket:", newSocket.id);
    });

    newSocket.on("queued", () => {
      setInQueue(true);
      console.log("Added to queue:", newSocket.id);
    });

    newSocket.on("game_start", async (data) => {
      try {
        setQuestionData(data.questions[0]);
        setTopicData(data.topic[0]);
        setGameId(data.gameId);
      } catch (error) {
        console.log("Error parsing data", error);
      }
    });

    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    if (TopicData) setShowingTopic(true);
  }, [TopicData]);

  useEffect(() => {
    if (Socket) {
      const token = localStorage.getItem("token");

      fetch(`${QUEUE_URL}/quiz2/join/?socketId=${Socket.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Queue Response:", data);
        })
        .catch((error) => console.error("Error joining queue:", error));
    }
  }, [Socket]);

  const leaveQueue = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${QUEUE_URL}/quiz2/leave?socketId=${Socket.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response);
      Socket.disconnect();
    } catch (error) {
      console.error("Error leaving queue:", error);
      console.log("Failed to leave queue. Please try again.");
    }
  };

  // Topic timer countdown
  useEffect(() => {
    if (!ShowingTopic) return;

    if (TopicTime <= 0) {
      setShowingTopic(false);
      setShowingQuiz(true);
      return;
    }

    const Timer = setInterval(() => {
      setTopicTime((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(Timer);
  }, [TopicTime, ShowingTopic, TopicData]);

  // Quiz timer countdown - only start after topic is done showing
  useEffect(() => {
    if (!ShowingQuiz || QuizCompleted) return;

    if (QuizTime <= 0) {
      handleQuizEnd();
      return;
    }

    const timer = setInterval(() => {
      setQuizTime((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [QuizTime, ShowingQuiz, QuestionData]);

  // Calculate score based on answers
  const calculateScore = () => {
    if (!QuestionData) return 0;

    let totalScore = 0;

    // Loop through each question and check if the selected answer is correct
    for (let i = 0; i < 5; i++) {
      const answerKey = `q${i + 1}ans`;
      // If the user selected an answer and it matches the correct answer
      if (SelectedAnswers[i] && SelectedAnswers[i] === QuestionData[answerKey]) {
        totalScore += 1;
      }
    }
    return totalScore;
  };

  // Handle quiz completion - submit score and show results
  const handleQuizEnd = () => {
    setQuizCompletion(true);
    const finalScore = calculateScore();
    setScore(finalScore);
    submitScore(finalScore);
  };
  
  // Submit score to backend via socket
  const submitScore = (finalScore) => {
    if (AnswersSubmitted || !Socket) return;

    if (!GameId) {
      console.error("No game ID found");
      return;
    }

    // Create score payload
    const payload = {
      gameId: GameId,
      score: finalScore,
      completionTime: 50 - QuizTime, // Time taken to complete in seconds
    };

    // Emit the game_end event with score
    Socket.emit("game_end", payload);
    console.log("Submitting score:", payload);

    setAnswersSubmitted(true);
  };

  if (ShowingTopic && TopicData) {
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
  }

  if (ShowingQuiz && QuestionData) {
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
                  <button className="finishButton" onClick={handleQuizEnd}>
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

  return (
    <div className="pageWrapper">
      <div className="container">
      <div className="overlay"></div>
        <div className="quizCard">
          <h1 className="title-styles">THE ARENA AWAITS ..</h1>
    
          {InQueue && <div className="spinner"></div>}
          {InQueue && <p className="message-styles">You are in queue, please wait....</p>}
    
          <div className="button-container">
            {
              <button
                className="exit-queue-button"
                onClick={() => {
                  leaveQueue();
                  navigate("/arena");
                }}
              >
                Exit Queue
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz2;