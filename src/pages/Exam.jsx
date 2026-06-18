import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "animate.css";
import * as faceapi from "face-api.js";
import "../styles/exam.css";

function Exam() {
  const navigate = useNavigate();
  const videoRef = useRef();
  const intervalRef = useRef(null);
  const streamRef = useRef(null);
  const lastCenterRef = useRef(null);
  const autoSubmittedRef = useRef(false);
  const blockedRef = useRef(false);
  const detectorReadyRef = useRef(false);
  const answersRef = useRef({});
  const currentExamRef = useRef(null);
  const detectionLockRef = useRef(false);
  const faceMissStreakRef = useRef(0);
  const movementStreakRef = useRef(0);
  const cameraOffStreakRef = useRef(0);
  const faceDetectorRef = useRef(null);
  const detectorEngineRef = useRef("pending");

  const [loading, setLoading] = useState(false);
  const [currentExam, setCurrentExam] = useState(null);
  const [timeLeft, setTimeLeft] = useState(120);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [warningCount, setWarningCount] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [detectorReady, setDetectorReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const [status, setStatus] = useState({
    camera: "pending",
    face: "pending",
    tab: "ok",
    fullscreen: "pending",
  });
  const [queueMessage, setQueueMessage] = useState("");
  const [proctorMessage, setProctorMessage] = useState("Initializing camera and face detection...");
  const [detectorEngine, setDetectorEngine] = useState("Starting...");

  const getQuestionMarkup = (question) => {
    if (question?.question) return { __html: question.question };
    if (question?.text) return { __html: question.text };
    return { __html: "Question" };
  };

  useEffect(() => {
    blockedRef.current = blocked;
  }, [blocked]);

  useEffect(() => {
    detectorReadyRef.current = detectorReady;
  }, [detectorReady]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    currentExamRef.current = currentExam;
  }, [currentExam]);

  useEffect(() => {
    const examData = localStorage.getItem("currentExam");
    if (examData) {
      const exam = JSON.parse(examData);
      const qList = Array.isArray(exam.questions) ? exam.questions : [];
      setCurrentExam({ ...exam, questions: qList });
      currentExamRef.current = { ...exam, questions: qList };
      setTimeLeft(exam.duration ? exam.duration * 60 : 120);

      const initialAnswers = {};
      qList.forEach((q, idx) => {
        const key = `q${q.id ?? idx}`;
        initialAnswers[key] = "";
      });
      setAnswers(initialAnswers);
      answersRef.current = initialAnswers;
    } else {
      navigate("/dashboard");
    }
  }, [navigate]);

  useEffect(() => {
    let mounted = true;

    const setup = async () => {
      try {
        await initializeDetector();
        await startVideo();
        await waitForVideoReady();
        await requestExamFullscreen();

        if (!mounted) return;
        intervalRef.current = setInterval(detectFace, 1000);
        setDetectorReady(true);
        detectorReadyRef.current = true;
        setProctorMessage("Camera ready. Keep your face centered and visible.");
      } catch (e) {
        console.error("Face detection setup error:", e);
        setError("Face detection setup failed");
        setDetectorReady(false);
        detectorReadyRef.current = false;
        setProctorMessage("Face detection could not start.");
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        setStatus((prev) => ({ ...prev, tab: "alert" }));
        triggerBlock("Tab switch detected");
      }
    };

    const handleWindowBlur = () => {
      setStatus((prev) => ({ ...prev, tab: "alert" }));
      triggerBlock("Window focus lost");
    };

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    const handleFullscreenChange = () => {
      const isFullscreen = Boolean(document.fullscreenElement);
      setStatus((prev) => ({ ...prev, fullscreen: isFullscreen ? "ok" : "alert" }));
      if (!isFullscreen && mounted) {
        triggerBlock("Fullscreen exited during exam");
      }
    };

    const handleContextMenu = (event) => {
      event.preventDefault();
    };

    const handleClipboard = (event) => {
      event.preventDefault();
    };

    const handleSelectStart = (event) => {
      const tagName = event.target?.tagName;
      if (tagName !== "INPUT" && tagName !== "TEXTAREA") {
        event.preventDefault();
      }
    };

    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      const blockedShortcut =
        key === "f12" ||
        key === "escape" ||
        (event.ctrlKey && ["t", "n", "w", "r", "l", "c", "v", "x", "u", "p", "s"].includes(key)) ||
        (event.ctrlKey && event.shiftKey && ["i", "j", "c", "n", "t"].includes(key)) ||
        (event.altKey && key === "tab");

      if (blockedShortcut) {
        event.preventDefault();
        event.stopPropagation();
        registerStrike("Restricted shortcut attempted.", "Restricted shortcut used");
      }
    };

    setup();
    flushPending();
    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleClipboard);
    document.addEventListener("cut", handleClipboard);
    document.addEventListener("paste", handleClipboard);
    document.addEventListener("selectstart", handleSelectStart);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("online", flushPending);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      mounted = false;
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleClipboard);
      document.removeEventListener("cut", handleClipboard);
      document.removeEventListener("paste", handleClipboard);
      document.removeEventListener("selectstart", handleSelectStart);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("online", flushPending);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("keydown", handleKeyDown, true);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const initializeDetector = async () => {
    if ("FaceDetector" in window) {
      try {
        faceDetectorRef.current = new window.FaceDetector({
          fastMode: true,
          maxDetectedFaces: 1,
        });
        detectorEngineRef.current = "Browser FaceDetector";
        setDetectorEngine("Browser FaceDetector");
        return;
      } catch (nativeError) {
        console.error("Native FaceDetector init failed:", nativeError);
      }
    }

    await loadModels();
    detectorEngineRef.current = "face-api.js";
    setDetectorEngine("face-api.js");
  };

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 24, max: 30 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch {
          // Some browsers require a user gesture before playback resolves.
        }
      }
    } catch (err) {
      console.error("Camera error", err);
      setCameraError("Camera permission needed. Allow camera and reload.");
      setStatus((prev) => ({ ...prev, camera: "alert" }));
      throw err;
    }
  };

  const waitForVideoReady = () => {
    const video = videoRef.current;
    if (!video) return Promise.resolve();

    if (video.readyState >= 2 && video.videoWidth > 0) return Promise.resolve();

    return new Promise((resolve) => {
      const onReady = () => {
        video.removeEventListener("loadeddata", onReady);
        video.removeEventListener("loadedmetadata", onReady);
        resolve();
      };

      video.addEventListener("loadeddata", onReady);
      video.addEventListener("loadedmetadata", onReady);
    });
  };

  const requestExamFullscreen = async () => {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
        setStatus((prev) => ({ ...prev, fullscreen: "ok" }));
      } catch (fullscreenError) {
        console.error("Fullscreen request failed:", fullscreenError);
        setStatus((prev) => ({ ...prev, fullscreen: "alert" }));
        setWarning("Fullscreen permission denied.");
        setProctorMessage("Allow fullscreen to continue exam safely.");
      }
      return;
    }

    setStatus((prev) => ({ ...prev, fullscreen: "ok" }));
  };

  const checkCameraActive = () => {
    const video = videoRef.current;
    if (!video || !video.srcObject) return false;

    const tracks = video.srcObject.getVideoTracks();
    return tracks.length > 0 && tracks[0].readyState === "live";
  };

  const loadModels = async () => {
    const MODEL_URL = "/models";
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  };

  const queueResult = (payload) => {
    const pending = JSON.parse(localStorage.getItem("pendingResults") || "[]");
    pending.push({ ...payload, pending: true });
    localStorage.setItem("pendingResults", JSON.stringify(pending));
    setQueueMessage("Result queued; will sync when online.");
  };

  const submitResult = async (payload, isRetry = false) => {
    try {
      const res = await fetch("http://127.0.0.1:5000/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("API error");
      return true;
    } catch (e) {
      if (!isRetry) queueResult(payload);
      return false;
    }
  };

  const recordMembershipUsage = async () => {
    if (!storedUser?._id) return;

    try {
      await fetch("http://127.0.0.1:5000/api/membership/record-exam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": storedUser._id,
        },
        body: JSON.stringify({
          timeSpent: currentExamRef.current?.duration ? Number(currentExamRef.current.duration) : 0,
        }),
      });
    } catch (membershipError) {
      console.error("Failed to record membership usage:", membershipError);
    }
  };

  const flushPending = async () => {
    const pending = JSON.parse(localStorage.getItem("pendingResults") || "[]");
    if (!pending.length) return;

    const remaining = [];
    for (const item of pending) {
      const ok = await submitResult(item, true);
      if (!ok) remaining.push(item);
    }

    localStorage.setItem("pendingResults", JSON.stringify(remaining));
    if (!remaining.length) setQueueMessage("");
  };

  const triggerBlock = (reason) => {
    if (blocked || autoSubmittedRef.current) return;
    setBlocked(true);
    blockedRef.current = true;
    setWarning(reason);
    setProctorMessage(reason);
    handleAutoSubmit(reason);
  };

  const registerStrike = (message, blocker) => {
    setWarning(message);
    setProctorMessage(message);
    setWarningCount((prev) => {
      const count = prev + 1;
      if (count >= 4) {
        triggerBlock(blocker);
      }
      return count;
    });
  };

  const clearDetectionWarnings = () => {
    cameraOffStreakRef.current = 0;
    faceMissStreakRef.current = 0;
    movementStreakRef.current = 0;
    setWarning("");
    setProctorMessage("Face detected clearly. You are good to continue.");
  };

  const normalizeDetection = (rawDetection) => {
    if (!rawDetection) return null;

    if (rawDetection.box) {
      return rawDetection.box;
    }

    if (rawDetection.boundingBox) {
      return {
        x: rawDetection.boundingBox.x,
        y: rawDetection.boundingBox.y,
        width: rawDetection.boundingBox.width,
        height: rawDetection.boundingBox.height,
      };
    }

    return null;
  };

  const runDetection = async () => {
    const video = videoRef.current;
    if (!video) return null;

    if (faceDetectorRef.current) {
      const nativeDetections = await faceDetectorRef.current.detect(video);
      return nativeDetections?.[0] || null;
    }

    return faceapi.detectSingleFace(
      video,
      new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.2 })
    );
  };

  const detectFace = async () => {
    if (!videoRef.current || blockedRef.current || !detectorReadyRef.current || detectionLockRef.current) return;

    const MAX_CAMERA_OFF = 2;
    const MAX_FACE_MISS = 2;
    const MAX_MOVEMENT_STREAK = 4;

    detectionLockRef.current = true;

    try {
      if (!checkCameraActive()) {
        cameraOffStreakRef.current += 1;
        setStatus((prev) => ({ ...prev, camera: "alert" }));
        setWarning("Camera feed is unavailable.");
        setProctorMessage("Camera feed is unavailable. Turn it back on to continue.");
        if (cameraOffStreakRef.current >= MAX_CAMERA_OFF) {
          registerStrike("Camera is off.", "Camera turned off repeatedly");
          cameraOffStreakRef.current = 0;
        }
        return;
      }

      cameraOffStreakRef.current = 0;
      setStatus((prev) => ({ ...prev, camera: "ok" }));

      const rawDetection = await runDetection();
      const box = normalizeDetection(rawDetection);

      if (!box) {
        setStatus((prev) => ({ ...prev, face: "alert" }));
        faceMissStreakRef.current += 1;
        setWarning("Face not detected clearly.");
        setProctorMessage(`No face detected by ${detectorEngineRef.current}. Sit closer and face the camera.`);
        if (faceMissStreakRef.current >= MAX_FACE_MISS) {
          registerStrike("Face not detected clearly.", "Face not detected repeatedly");
          faceMissStreakRef.current = 0;
        }
        return;
      }

      faceMissStreakRef.current = 0;
      setStatus((prev) => ({ ...prev, face: "ok" }));

      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;
      const previousCenter = lastCenterRef.current;
      lastCenterRef.current = { x: centerX, y: centerY };

      const videoWidth = videoRef.current.videoWidth || 640;
      const leftThreshold = videoWidth * 0.15;
      const rightThreshold = videoWidth * 0.85;
      const faceCoverage = box.width / videoWidth;

      let driftFlag = false;
      let driftMessage = "";

      if (centerX < leftThreshold || centerX > rightThreshold) {
        driftFlag = true;
        driftMessage = "Stay centered in front of the camera.";
      } else if (faceCoverage < 0.1) {
        driftFlag = true;
        driftMessage = "Move a bit closer to the camera.";
      }

      if (previousCenter) {
        const delta = Math.hypot(centerX - previousCenter.x, centerY - previousCenter.y);
        if (delta > 180) {
          driftFlag = true;
          driftMessage = "Too much movement detected.";
        }
      }

      if (driftFlag) {
        movementStreakRef.current += 1;
        setWarning(driftMessage);
        setProctorMessage(driftMessage);
        if (movementStreakRef.current >= MAX_MOVEMENT_STREAK) {
          registerStrike(driftMessage, "Excessive movement detected");
          movementStreakRef.current = 0;
        }
        return;
      }

      movementStreakRef.current = 0;
      clearDetectionWarnings();
    } catch (e) {
      console.error("Face detection error:", e);
      setStatus((prev) => ({ ...prev, face: "alert" }));
      setWarning("Face detector error.");
      setProctorMessage(`${detectorEngineRef.current} failed while checking the frame.`);
    } finally {
      detectionLockRef.current = false;
    }
  };

  const persistLocalResult = (payload) => {
    const local = JSON.parse(localStorage.getItem("results") || "[]");
    local.push(payload);
    localStorage.setItem("results", JSON.stringify(local));
  };

  const handleAutoSubmit = async (reason = "Auto submit") => {
    if (autoSubmittedRef.current) return;
    autoSubmittedRef.current = true;

    let correct = 0;
    const liveExam = currentExamRef.current;
    const liveAnswers = answersRef.current;
    const liveQuestionList = Array.isArray(liveExam?.questions) ? liveExam.questions : [];

    if (liveExam) {
      liveQuestionList.forEach((q, idx) => {
        const key = `q${q.id ?? idx}`;
        const correctOpt = Array.isArray(q.options) ? q.options[q.correctAnswer] : undefined;
        if (correctOpt && liveAnswers[key] === correctOpt) {
          correct++;
        }
      });
    }

    const payload = {
      correct,
      total: liveQuestionList.length,
      score: correct,
      time: new Date().toLocaleString(),
      subject: liveExam?.subject || "",
      examTitle: liveExam?.title || "",
      userId: storedUser?._id || "",
      studentName: storedUser?.name || "Unknown student",
      studentEmail: storedUser?.email || "",
      note: reason,
    };

    try {
      const sent = await submitResult(payload);
      await recordMembershipUsage();
      persistLocalResult(payload);
      if (!sent) setQueueMessage("Result saved locally; will sync when online.");
      navigate("/result");
    } catch {
      setError("Auto submit failed");
    }
  };

  useEffect(() => {
    if (timeLeft <= 0 && currentExam) {
      handleAutoSubmit("Time over");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, currentExam]);

  const handleChange = (e) => {
    if (blockedRef.current) return;
    const nextAnswers = { ...answersRef.current, [e.target.name]: e.target.value };
    answersRef.current = nextAnswers;
    setAnswers(nextAnswers);
  };

  const handleSubmit = async () => {
    if (blocked) {
      setError("Exam blocked due to cheating!");
      return;
    }

    const unanswered = questionList.some((q, idx) => !answers[`q${q.id ?? idx}`]);
    if (unanswered) {
      setError("Answer all questions");
      return;
    }

    setLoading(true);

    let correct = 0;
    questionList.forEach((q, idx) => {
      const key = `q${q.id ?? idx}`;
      const correctOpt = Array.isArray(q.options) ? q.options[q.correctAnswer] : undefined;
      if (correctOpt && answers[key] === correctOpt) {
        correct++;
      }
    });

    const payload = {
      correct,
      total: questionList.length,
      score: correct,
      time: new Date().toLocaleString(),
      subject: currentExam.subject,
      examTitle: currentExam.title,
      userId: storedUser?._id || "",
      studentName: storedUser?.name || "Unknown student",
      studentEmail: storedUser?.email || "",
    };

    try {
      const sent = await submitResult(payload);
      await recordMembershipUsage();
      persistLocalResult(payload);
      if (!sent) setQueueMessage("Result saved locally; will sync when online.");
      setLoading(false);
      navigate("/result");
    } catch {
      setLoading(false);
      setError("Submit failed");
    }
  };

  if (loading || !currentExam) return <Loader />;

  const questionList = Array.isArray(currentExam.questions) ? currentExam.questions : [];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const answeredCount = questionList.filter((q, idx) => {
    const value = answers[`q${q.id ?? idx}`];
    return typeof value === "string" ? value.trim() !== "" : Boolean(value);
  }).length;
  const progress = questionList.length ? Math.round((answeredCount / questionList.length) * 100) : 0;
  const remainingWarnings = Math.max(0, 4 - warningCount);

  return (
    <div className="exam-page">
      <div className="container py-4 py-lg-5">
        <div className="exam-shell">
          <aside className="exam-sidebar">
            <div className="exam-panel exam-panel-hero">
              <p className="exam-kicker mb-2">{currentExam.subject || "Live exam"}</p>
              <h2 className="mb-2">{currentExam.title}</h2>
              <p className="exam-subtle mb-0">Stay focused, keep your face visible, and submit before the timer ends.</p>
            </div>

            <div className="exam-panel">
              <div className="exam-video-wrap">
                <video ref={videoRef} autoPlay muted playsInline className="exam-video" />
                <div className="exam-video-overlay">AI Proctoring Active</div>
              </div>

              <div className="exam-status-grid">
                <span className={`exam-chip exam-chip-${status.camera}`}>
                  <i className="bi bi-camera-video me-2" />
                  Camera {status.camera === "pending" ? "starting" : status.camera === "ok" ? "on" : "issue"}
                </span>
                <span className={`exam-chip exam-chip-${status.face}`}>
                  <i className="bi bi-person-bounding-box me-2" />
                  Face {status.face === "pending" ? "checking" : status.face === "ok" ? "detected" : "not found"}
                </span>
                <span className={`exam-chip exam-chip-${status.tab}`}>
                  <i className="bi bi-window me-2" />
                  Tab {status.tab === "ok" ? "focused" : "changed"}
                </span>
                <span className={`exam-chip exam-chip-${status.fullscreen}`}>
                  <i className="bi bi-arrows-fullscreen me-2" />
                  Screen {status.fullscreen === "pending" ? "locking" : status.fullscreen === "ok" ? "locked" : "unlocked"}
                </span>
              </div>

              <div className={`exam-monitor ${warning ? "is-warning" : ""}`}>
                <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
                  <strong>Monitor status</strong>
                  <span>{remainingWarnings} warnings left</span>
                </div>
                <p className="mb-1 mt-2">{warning || proctorMessage}</p>
                <p className="exam-engine mb-0">Detector: {detectorEngine}</p>
              </div>

              {cameraError && <div className="alert alert-danger mt-3 mb-0">{cameraError}</div>}
              {!detectorReady && !cameraError && <p className="text-muted small mt-3 mb-0">Initializing face detection...</p>}
              {queueMessage && <p className="text-warning small mt-3 mb-0">{queueMessage}</p>}
            </div>

            <div className="exam-panel">
              <div className="exam-stat-row">
                <span>Time left</span>
                <strong>{minutes}:{String(seconds).padStart(2, "0")}</strong>
              </div>
              <div className="exam-stat-row">
                <span>Answered</span>
                <strong>{answeredCount}/{questionList.length}</strong>
              </div>
              <div className="exam-progress">
                <div className="exam-progress-bar" style={{ width: `${progress}%` }} />
              </div>
              <p className="exam-subtle mb-0 mt-2">{progress}% complete</p>
            </div>
          </aside>

          <main className="exam-main">
            {blocked && (
              <div className="alert alert-danger text-center">
                Exam blocked due to cheating
              </div>
            )}

            {questionList.map((q, i) => {
              const hasOptions = Array.isArray(q.options) && q.options.length > 0;
              const key = `q${q.id ?? i}`;

              return (
                <section key={q.id ?? i} className="exam-question card mb-3">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-3">
                      <div>
                        <p className="exam-question-label mb-2">Question {i + 1}</p>
                        <div className="mb-0 exam-question-text" dangerouslySetInnerHTML={getQuestionMarkup(q)} />
                      </div>
                      <span className="exam-question-badge">
                        {answers[key] ? "Answered" : "Pending"}
                      </span>
                    </div>

                    {hasOptions ? (
                      <div className="exam-options">
                        {q.options.map((opt, idx) => (
                          <label key={idx} className={`exam-option ${answers[key] === opt ? "is-selected" : ""}`}>
                            <input
                              type="radio"
                              name={key}
                              value={opt}
                              onChange={handleChange}
                              checked={answers[key] === opt}
                              disabled={blocked}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        className="form-control exam-textarea"
                        name={key}
                        placeholder="Type your answer"
                        onChange={handleChange}
                        value={answers[key] || ""}
                        disabled={blocked}
                      />
                    )}
                  </div>
                </section>
              );
            })}

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="exam-submit-bar">
              <div>
                <strong>Ready to finish?</strong>
                <p className="exam-subtle mb-0">Make sure every answer is reviewed before you submit.</p>
              </div>
              <button className="btn btn-success btn-lg px-4" onClick={handleSubmit} disabled={blocked}>
                Submit exam
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default Exam;
