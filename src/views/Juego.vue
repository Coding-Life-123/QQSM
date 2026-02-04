<template>
  <div class="juego-container">
    <!-- Animated Background -->
    <div class="background-effects">
      <div class="spotlight spotlight-1"></div>
      <div class="spotlight spotlight-2"></div>
      <div class="spotlight spotlight-3"></div>
      <div class="money-rain">
        <div
          v-for="n in 50"
          :key="n"
          class="money-bill"
          :style="getMoneyStyle(n)"
        >
          <span class="bill-front">💵</span>
        </div>
      </div>
    </div>

    <!-- Confetti Container -->
    <div v-if="showConfetti" class="confetti-container">
      <div
        v-for="n in 100"
        :key="n"
        class="confetti"
        :style="getConfettiStyle(n)"
      ></div>
    </div>

    <!-- Header -->
    <div class="header">
      <div class="player-info">
        <span class="player-icon">{{ playerIcon }}</span>
        <span class="player-name">{{ playerName }}</span>
      </div>

      <!-- Money Progress Bar -->
      <div class="money-progress">
        <div class="current-prize">
          <span class="prize-label">Premio Actual:</span>
          <span class="prize-amount">{{
            moneyLevels[currentLevel] || "$0"
          }}</span>
        </div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
        <div class="progress-info">
          <span
            >Pregunta {{ currentLevel + 1 }} de {{ moneyLevels.length }}</span
          >
          <span>Meta: $1,000,000</span>
        </div>
      </div>

      <button @click="logout" class="btn-logout">
        <span class="logout-icon">🚪</span>
        Cerrar Sesión
      </button>
    </div>

    <!-- Lifelines Bar -->
    <div v-if="!gameOver" class="lifelines-bar">
      <div class="lifelines-container">
        <h3 class="lifelines-title">Comodines Disponibles</h3>
        <div class="lifelines-grid">
          <button
            @click="useLifeline('phone')"
            class="lifeline-btn"
            :class="{ used: usedLifelines.phone }"
            :disabled="usedLifelines.phone || showResult"
            :title="usedLifelines.phone ? 'Ya usado' : 'Llamada telefónica'"
          >
            <span class="lifeline-icon">📞</span>
            <span class="lifeline-text">Llamada</span>
          </button>

          <button
            @click="useLifeline('fifty')"
            class="lifeline-btn"
            :class="{ used: usedLifelines.fifty }"
            :disabled="usedLifelines.fifty || showResult"
            :title="usedLifelines.fifty ? 'Ya usado' : '50/50'"
          >
            <span class="lifeline-icon">⚖️</span>
            <span class="lifeline-text">50/50</span>
          </button>

          <button
            @click="useLifeline('audience')"
            class="lifeline-btn"
            :class="{ used: usedLifelines.audience }"
            :disabled="usedLifelines.audience || showResult"
            :title="usedLifelines.audience ? 'Ya usado' : 'Pregunta al público'"
          >
            <span class="lifeline-icon">👥</span>
            <span class="lifeline-text">Público</span>
          </button>

          <button
            @click="useLifeline('hint')"
            class="lifeline-btn"
            :class="{ used: usedLifelines.hint }"
            :disabled="usedLifelines.hint || showResult"
            :title="usedLifelines.hint ? 'Ya usado' : 'Pista'"
          >
            <span class="lifeline-icon">💡</span>
            <span class="lifeline-text">Pista</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Lifeline Message -->
    <div v-if="lifelineMessage" class="lifeline-message-container">
      <div class="lifeline-message">
        {{ lifelineMessage }}
      </div>
    </div>

    <!-- Main Game Area -->
    <div class="game-content">
      <div class="question-area">
        <!-- Timer -->
        <div v-if="!gameOver && !showResult" class="timer-container">
          <div class="timer-circle" :class="{ warning: timeLeft <= 10 }">
            <svg class="timer-svg" viewBox="0 0 100 100">
              <circle class="timer-bg" cx="50" cy="50" r="45"></circle>
              <circle
                class="timer-progress"
                cx="50"
                cy="50"
                r="45"
                :style="{ strokeDashoffset: timerOffset }"
              ></circle>
            </svg>
            <div class="timer-text">
              <span class="timer-icon">⏱️</span>
              <span class="timer-number">{{ timeLeft }}</span>
            </div>
          </div>
        </div>

        <div v-if="!gameOver" class="question-box">
          <div class="question-number">Pregunta {{ currentLevel + 1 }}</div>
          <h2 class="question-text">{{ currentQuestion.question }}</h2>
          <button
            @click="readQuestion"
            class="btn-read-question"
            title="Leer pregunta"
          >
            <span>🔊</span>
          </button>
        </div>

        <div v-if="!gameOver" class="answers-grid">
          <button
            v-for="(answer, index) in currentQuestion.answers"
            :key="index"
            @click="selectAnswer(index)"
            class="answer-btn"
            :class="{
              selected: selectedAnswer === index,
              correct: showResult && index === currentQuestion.correct,
              incorrect:
                showResult &&
                selectedAnswer === index &&
                index !== currentQuestion.correct,
              disabled: usedFiftyFifty && fiftyFiftyRemoved.includes(index),
            }"
            :disabled="
              showResult ||
              (usedFiftyFifty && fiftyFiftyRemoved.includes(index))
            "
          >
            <span class="answer-letter">{{ ["A", "B", "C", "D"][index] }}</span>
            <span class="answer-text">{{ answer }}</span>
          </button>
        </div>

        <div v-if="gameOver" class="game-over">
          <h2 v-if="won">🎉 ¡FELICIDADES! 🎉</h2>
          <h2 v-else>😢 JUEGO TERMINADO</h2>
          <p v-if="won" class="final-prize">¡Has ganado $1,000,000!</p>
          <p v-else class="final-prize">
            Has ganado: {{ moneyLevels[currentLevel] || "$0" }}
          </p>
          <button @click="logout" class="btn-restart">
            <span>🏠</span>
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>

    <!-- Confirm Button -->
    <div
      v-if="!gameOver && selectedAnswer !== null && !showResult"
      class="confirm-area"
    >
      <button @click="confirmAnswer" class="btn-confirm">
        <span class="confirm-icon">✓</span>
        CONFIRMAR RESPUESTA FINAL
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const playerName = ref("");
const playerIcon = ref("👤");
const currentLevel = ref(0);
const selectedAnswer = ref(null);
const showResult = ref(false);
const gameOver = ref(false);
const won = ref(false);
const lifelineMessage = ref("");
const currentQuestionIndex = ref(0);

const usedLifelines = ref({
  phone: false,
  fifty: false,
  audience: false,
  hint: false,
});

const usedFiftyFifty = ref(false);
const fiftyFiftyRemoved = ref([]);

// Timer and effects
const timeLeft = ref(30);
const timerInterval = ref(null);
const showConfetti = ref(false);
const speechSynthesis = window.speechSynthesis;

const moneyLevels = [
  "$100",
  "$200",
  "$300",
  "$500",
  "$1,000",
  "$2,000",
  "$4,000",
  "$8,000",
  "$16,000",
  "$32,000",
  "$64,000",
  "$125,000",
  "$250,000",
  "$500,000",
  "$1,000,000",
];

const questions = [
  {
    question: "¿Cuál es la capital de Francia?",
    answers: ["Londres", "Berlín", "París", "Madrid"],
    correct: 2,
    hint: "Es conocida como la ciudad de la luz",
  },
  {
    question: "¿En qué año llegó el hombre a la Luna?",
    answers: ["1965", "1969", "1972", "1975"],
    correct: 1,
    hint: "Fue en la década de los 60",
  },
  {
    question: "¿Cuál es el planeta más grande del sistema solar?",
    answers: ["Saturno", "Júpiter", "Neptuno", "Urano"],
    correct: 1,
    hint: "Tiene una gran mancha roja",
  },
  {
    question: "¿Quién pintó la Mona Lisa?",
    answers: ["Miguel Ángel", "Leonardo da Vinci", "Rafael", "Donatello"],
    correct: 1,
    hint: "También fue inventor y científico",
  },
  {
    question: "¿Cuál es el océano más grande?",
    answers: ["Atlántico", "Índico", "Ártico", "Pacífico"],
    correct: 3,
    hint: "Cubre más de un tercio de la superficie terrestre",
  },
  {
    question: "¿Cuántos continentes hay en la Tierra?",
    answers: ["5", "6", "7", "8"],
    correct: 2,
    hint: "Incluye la Antártida",
  },
  {
    question: "¿Cuál es el metal más abundante en la corteza terrestre?",
    answers: ["Hierro", "Aluminio", "Cobre", "Oro"],
    correct: 1,
    hint: "Se usa mucho en latas de bebidas",
  },
  {
    question: "¿En qué país se encuentra la Torre Eiffel?",
    answers: ["Italia", "España", "Francia", "Alemania"],
    correct: 2,
    hint: "Es el mismo país de la primera pregunta",
  },
  {
    question: "¿Cuál es el animal terrestre más rápido?",
    answers: ["León", "Guepardo", "Tigre", "Leopardo"],
    correct: 1,
    hint: "Puede alcanzar más de 100 km/h",
  },
  {
    question: "¿Cuántos huesos tiene el cuerpo humano adulto?",
    answers: ["186", "206", "226", "246"],
    correct: 1,
    hint: "Es un número par que empieza con 2",
  },
  {
    question: '¿Quién escribió "Don Quijote de la Mancha"?',
    answers: [
      "Lope de Vega",
      "Miguel de Cervantes",
      "Garcilaso de la Vega",
      "Calderón de la Barca",
    ],
    correct: 1,
    hint: "Es considerado el padre de la novela moderna",
  },
  {
    question: "¿Cuál es el río más largo del mundo?",
    answers: ["Nilo", "Amazonas", "Yangtsé", "Misisipi"],
    correct: 0,
    hint: "Está en África",
  },
  {
    question: "¿En qué año cayó el Muro de Berlín?",
    answers: ["1987", "1988", "1989", "1990"],
    correct: 2,
    hint: "Fue al final de los años 80",
  },
  {
    question: "¿Cuál es el elemento químico con símbolo Au?",
    answers: ["Plata", "Oro", "Aluminio", "Argón"],
    correct: 1,
    hint: "Es un metal precioso muy valioso",
  },
  {
    question: "¿Cuál es la montaña más alta del mundo?",
    answers: ["K2", "Kilimanjaro", "Monte Everest", "Aconcagua"],
    correct: 2,
    hint: "Está en el Himalaya",
  },
];

const currentQuestion = computed(() => questions[currentQuestionIndex.value]);

const progressPercentage = computed(() => {
  return (currentLevel.value / moneyLevels.length) * 100;
});

const timerOffset = computed(() => {
  const circumference = 2 * Math.PI * 45;
  const progress = timeLeft.value / 30;
  return circumference * (1 - progress);
});

// Helper functions for animations
const getMoneyStyle = (n) => {
  return {
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${8 + Math.random() * 7}s`,
    opacity: 0.3 + Math.random() * 0.4,
  };
};

const getConfettiStyle = (n) => {
  const colors = [
    "#ffd700",
    "#ff6b6b",
    "#4ecdc4",
    "#45b7d1",
    "#f7b731",
    "#5f27cd",
  ];
  return {
    left: `${Math.random() * 100}%`,
    backgroundColor: colors[Math.floor(Math.random() * colors.length)],
    animationDelay: `${Math.random() * 0.5}s`,
    animationDuration: `${2 + Math.random() * 2}s`,
  };
};

onMounted(() => {
  const name = localStorage.getItem("playerName");
  const icon = localStorage.getItem("playerIcon");
  if (!name) {
    router.push("/");
  } else {
    playerName.value = name;
    playerIcon.value = icon || "👤";
    startTimer();
  }
});

// Timer functions
const startTimer = () => {
  timeLeft.value = 30;
  if (timerInterval.value) clearInterval(timerInterval.value);

  timerInterval.value = setInterval(() => {
    timeLeft.value--;

    if (timeLeft.value <= 0) {
      clearInterval(timerInterval.value);
      handleTimeOut();
    }
  }, 1000);
};

const handleTimeOut = () => {
  // El jugador pierde cuando se agota el tiempo
  showResult.value = true;
  setTimeout(() => {
    gameOver.value = true;
    won.value = false;
  }, 1500);
};

const stopTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
};

// Voice synthesis
const readQuestion = () => {
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }

  const text = `${currentQuestion.value.question}. Opción A: ${currentQuestion.value.answers[0]}. Opción B: ${currentQuestion.value.answers[1]}. Opción C: ${currentQuestion.value.answers[2]}. Opción D: ${currentQuestion.value.answers[3]}`;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "es-ES";
  utterance.rate = 0.9;
  speechSynthesis.speak(utterance);
};

const selectAnswer = (index) => {
  if (!showResult.value) {
    selectedAnswer.value = index;
  }
};

const confirmAnswer = () => {
  stopTimer();
  showResult.value = true;

  if (selectedAnswer.value === currentQuestion.value.correct) {
    // Respuesta correcta - mostrar confetti
    showConfetti.value = true;
    setTimeout(() => {
      showConfetti.value = false;
    }, 3000);

    setTimeout(() => {
      currentLevel.value++;

      if (currentLevel.value >= moneyLevels.length) {
        // ¡Ganó el millón!
        won.value = true;
        gameOver.value = true;
      } else {
        // Siguiente pregunta
        nextQuestion();
      }
    }, 2000);
  } else {
    // Respuesta incorrecta
    setTimeout(() => {
      // Verificar si tiene comodines disponibles
      const hasLifelines =
        !usedLifelines.value.phone ||
        !usedLifelines.value.fifty ||
        !usedLifelines.value.audience ||
        !usedLifelines.value.hint;

      if (!hasLifelines) {
        // No tiene comodines, pierde
        gameOver.value = true;
        won.value = false;
      } else {
        // Tiene comodines, puede continuar pero pierde dinero
        alert(
          "Respuesta incorrecta. Aún tienes comodines disponibles. ¡Úsalos sabiamente!"
        );
        nextQuestion();
      }
    }, 2000);
  }
};

const nextQuestion = () => {
  currentQuestionIndex.value++;
  if (currentQuestionIndex.value >= questions.length) {
    currentQuestionIndex.value = 0; // Reiniciar preguntas si se acaban
  }
  selectedAnswer.value = null;
  showResult.value = false;
  lifelineMessage.value = "";
  usedFiftyFifty.value = false;
  fiftyFiftyRemoved.value = [];

  // Reiniciar temporizador para la siguiente pregunta
  startTimer();
};

const useLifeline = (type) => {
  if (usedLifelines.value[type]) return;

  usedLifelines.value[type] = true;

  switch (type) {
    case "phone":
      const phoneAnswer = ["A", "B", "C", "D"][currentQuestion.value.correct];
      lifelineMessage.value = `📞 Tu amigo cree que la respuesta es la ${phoneAnswer}`;
      setTimeout(() => (lifelineMessage.value = ""), 5000);
      break;

    case "fifty":
      usedFiftyFifty.value = true;
      const correctIndex = currentQuestion.value.correct;
      const wrongIndices = [0, 1, 2, 3].filter((i) => i !== correctIndex);
      // Eliminar 2 respuestas incorrectas al azar
      fiftyFiftyRemoved.value = wrongIndices
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);
      lifelineMessage.value =
        "50/50 activado: Se eliminaron 2 respuestas incorrectas";
      setTimeout(() => (lifelineMessage.value = ""), 3000);
      break;

    case "audience":
      const audienceAnswer = ["A", "B", "C", "D"][
        currentQuestion.value.correct
      ];
      const percentage = 60 + Math.floor(Math.random() * 30);
      lifelineMessage.value = `👥 El ${percentage}% del público votó por la opción ${audienceAnswer}`;
      setTimeout(() => (lifelineMessage.value = ""), 5000);
      break;

    case "hint":
      lifelineMessage.value = `💡 Pista: ${currentQuestion.value.hint}`;
      setTimeout(() => (lifelineMessage.value = ""), 7000);
      break;
  }
};

const logout = () => {
  localStorage.removeItem("playerName");
  router.push("/");
};
</script>

<style scoped>
.juego-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #16213e 100%);
  color: white;
  padding: 0;
  position: relative;
  overflow: hidden;
}

/* Background Effects */
.background-effects {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.spotlight {
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 215, 0, 0.15) 0%,
    transparent 70%
  );
  animation: spotlightMove 10s ease-in-out infinite;
}

.spotlight-1 {
  top: -200px;
  left: -200px;
}

.spotlight-2 {
  top: -200px;
  right: -200px;
  animation-delay: 3s;
}

.spotlight-3 {
  bottom: -200px;
  left: 50%;
  animation-delay: 6s;
}

@keyframes spotlightMove {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(50px, 50px);
  }
}

.money-rain {
  position: absolute;
  width: 100%;
  height: 100%;
}

.money-bill {
  position: absolute;
  top: -50px;
  font-size: 30px;
  animation: moneyFall linear infinite;
}

@keyframes moneyFall {
  to {
    transform: translateY(calc(100vh + 100px)) rotateX(360deg) rotateY(360deg);
  }
}

/* Confetti */
.confetti-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
}

.confetti {
  position: absolute;
  bottom: -10px;
  width: 10px;
  height: 10px;
  animation: confettiFall linear forwards;
}

@keyframes confettiFall {
  to {
    transform: translateY(-100vh) rotate(720deg);
    opacity: 0;
  }
}

/* Header Styles */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 3rem;
  background: linear-gradient(
    180deg,
    rgba(10, 14, 39, 0.95) 0%,
    rgba(26, 26, 62, 0.9) 100%
  );
  border-bottom: 3px solid #ffd700;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.player-info {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: rgba(255, 215, 0, 0.1);
  padding: 0.8rem 1.5rem;
  border-radius: 50px;
  border: 2px solid rgba(255, 215, 0, 0.3);
}

.player-icon {
  font-size: 1.8rem;
}

.player-name {
  font-size: 1.2rem;
  font-weight: bold;
  color: #ffd700;
}

/* Money Progress Styles */
.money-progress {
  flex: 1;
  max-width: 500px;
  margin: 0 2rem;
}

.current-prize {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.prize-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.prize-amount {
  font-size: 1.8rem;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 0.5rem;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%);
  transition: width 0.5s ease;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
}

.btn-logout {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  background: linear-gradient(135deg, #ff4757 0%, #ff6348 100%);
  color: white;
  border: none;
  border-radius: 50px;
  font-weight: bold;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 10px rgba(255, 71, 87, 0.3);
}

.btn-logout:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(255, 71, 87, 0.5);
}

.logout-icon {
  font-size: 1.2rem;
}

/* Lifelines Bar */
.lifelines-bar {
  padding: 1.5rem 3rem;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 215, 0, 0.2);
}

.lifelines-container {
  max-width: 1200px;
  margin: 0 auto;
}

.lifelines-title {
  text-align: center;
  color: #ffd700;
  font-size: 1.1rem;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.lifelines-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.lifeline-btn {
  padding: 1rem;
  background: linear-gradient(
    135deg,
    rgba(255, 215, 0, 0.15) 0%,
    rgba(255, 215, 0, 0.05) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.lifeline-btn:hover:not(:disabled) {
  background: linear-gradient(
    135deg,
    rgba(255, 215, 0, 0.3) 0%,
    rgba(255, 215, 0, 0.15) 100%
  );
  border-color: #ffd700;
  transform: translateY(-3px);
  box-shadow: 0 5px 20px rgba(255, 215, 0, 0.4);
}

.lifeline-btn.used {
  opacity: 0.3;
  cursor: not-allowed;
  background: rgba(100, 100, 100, 0.1);
  border-color: rgba(100, 100, 100, 0.3);
}

.lifeline-btn:disabled {
  cursor: not-allowed;
}

.lifeline-icon {
  font-size: 2.5rem;
}

.lifeline-text {
  font-weight: bold;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.lifeline-message-container {
  padding: 1rem 3rem;
  animation: slideDown 0.3s ease-out;
}

.lifeline-message {
  max-width: 800px;
  margin: 0 auto;
  padding: 1.2rem 2rem;
  background: linear-gradient(
    135deg,
    rgba(255, 215, 0, 0.25) 0%,
    rgba(255, 215, 0, 0.15) 100%
  );
  border: 2px solid #ffd700;
  border-radius: 12px;
  text-align: center;
  font-weight: bold;
  font-size: 1.1rem;
  color: #ffd700;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Game Content */
.game-content {
  padding: 2rem 3rem;
  max-width: 1200px;
  margin: 0 auto;
}

.question-area {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.question-box {
  background: linear-gradient(
    135deg,
    rgba(255, 215, 0, 0.15) 0%,
    rgba(255, 215, 0, 0.05) 100%
  );
  border: 3px solid #ffd700;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
  position: relative;
  overflow: hidden;
}

/* Timer Styles */
.timer-container {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.timer-circle {
  position: relative;
  width: 120px;
  height: 120px;
}

.timer-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.timer-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.1);
  stroke-width: 8;
}

.timer-progress {
  fill: none;
  stroke: #ffd700;
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 283;
  transition: stroke-dashoffset 1s linear, stroke 0.3s;
}

.timer-circle.warning .timer-progress {
  stroke: #ff4757;
  animation: warningPulse 0.5s ease-in-out infinite;
}

@keyframes warningPulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.timer-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.timer-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.3rem;
}

.timer-number {
  font-size: 2rem;
  font-weight: bold;
  color: #ffd700;
}

.timer-circle.warning .timer-number {
  color: #ff4757;
  animation: warningShake 0.5s ease-in-out infinite;
}

@keyframes warningShake {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* Read Question Button */
.btn-read-question {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4ecdc4 0%, #45b7d1 100%);
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 10px rgba(78, 205, 196, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-read-question:hover {
  transform: scale(1.1) rotate(10deg);
  box-shadow: 0 6px 15px rgba(78, 205, 196, 0.6);
}

.question-box::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, transparent, #ffd700, transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.question-number {
  text-align: center;
  color: rgba(255, 215, 0, 0.7);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 1rem;
  font-weight: bold;
}

.question-text {
  font-size: 1.6rem;
  text-align: center;
  margin: 0;
  color: #fff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  line-height: 1.4;
}

.answers-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.answer-btn {
  padding: 1.8rem 1.5rem;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.08) 0%,
    rgba(255, 255, 255, 0.03) 100%
  );
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  color: white;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 1.2rem;
  text-align: left;
  position: relative;
  overflow: hidden;
}

.answer-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(255, 215, 0, 0.1) 0%,
    transparent 100%
  );
  opacity: 0;
  transition: opacity 0.3s;
}

.answer-btn:hover:not(:disabled)::before {
  opacity: 1;
}

.answer-btn:hover:not(:disabled) {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.15) 0%,
    rgba(255, 255, 255, 0.08) 100%
  );
  border-color: #ffd700;
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
}

.answer-btn.selected {
  background: linear-gradient(
    135deg,
    rgba(255, 215, 0, 0.3) 0%,
    rgba(255, 215, 0, 0.2) 100%
  );
  border-color: #ffd700;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
  transform: scale(1.02);
}

.answer-btn.correct {
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  border-color: #4caf50;
  animation: correctPulse 0.5s ease-in-out;
}

.answer-btn.incorrect {
  background: linear-gradient(135deg, #f44336 0%, #e57373 100%);
  border-color: #f44336;
  animation: shake 0.5s ease-in-out;
}

.answer-btn.disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.answer-letter {
  min-width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #1a1a2e;
  background: #ffd700;
  border-radius: 50%;
  font-size: 1.2rem;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
}

.answer-text {
  flex: 1;
  font-size: 1.05rem;
}

@keyframes correctPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}

.game-over {
  text-align: center;
  padding: 4rem 3rem;
  background: linear-gradient(
    135deg,
    rgba(255, 215, 0, 0.15) 0%,
    rgba(255, 215, 0, 0.05) 100%
  );
  border-radius: 25px;
  border: 3px solid #ffd700;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.7);
}

.game-over h2 {
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  color: #ffd700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
  animation: pulse 2s ease-in-out infinite;
}

.final-prize {
  font-size: 2rem;
  margin-bottom: 2.5rem;
  color: #fff;
  font-weight: bold;
}

.btn-restart {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1.2rem 2.5rem;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #1a1a2e;
  border: none;
  border-radius: 50px;
  font-size: 1.3rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-restart:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 10px 30px rgba(255, 215, 0, 0.7);
}

/* Confirm Button */
.confirm-area {
  text-align: center;
  padding: 2rem 3rem;
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.btn-confirm {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 3.5rem;
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 1.4rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 8px 25px rgba(76, 175, 80, 0.5);
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;
}

.btn-confirm::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn-confirm:hover::before {
  width: 300px;
  height: 300px;
}

.btn-confirm:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 12px 35px rgba(76, 175, 80, 0.7);
}

.btn-confirm:active {
  transform: translateY(-1px) scale(1.02);
}

.confirm-icon {
  font-size: 1.8rem;
  font-weight: bold;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .header {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem 1.5rem;
  }

  .money-progress {
    max-width: 100%;
    margin: 0;
  }

  .lifelines-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .game-content {
    padding: 1.5rem 1.5rem;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 1rem;
  }

  .player-info {
    padding: 0.6rem 1rem;
  }

  .prize-amount {
    font-size: 1.4rem;
  }

  .lifelines-bar {
    padding: 1rem 1.5rem;
  }

  .lifelines-grid {
    gap: 0.8rem;
  }

  .lifeline-icon {
    font-size: 2rem;
  }

  .lifeline-text {
    font-size: 0.8rem;
  }

  .game-content {
    padding: 1.5rem 1rem;
  }

  .question-box {
    padding: 1.5rem;
  }

  .question-text {
    font-size: 1.3rem;
  }

  .answers-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .answer-btn {
    padding: 1.3rem 1rem;
  }

  .btn-confirm {
    padding: 1.2rem 2.5rem;
    font-size: 1.1rem;
  }

  .game-over h2 {
    font-size: 2.5rem;
  }

  .final-prize {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .prize-amount {
    font-size: 1.2rem;
  }

  .question-text {
    font-size: 1.1rem;
  }

  .answer-letter {
    min-width: 35px;
    height: 35px;
    font-size: 1rem;
  }

  .answer-text {
    font-size: 0.95rem;
  }

  .btn-confirm {
    padding: 1rem 2rem;
    font-size: 1.1rem;
  }
}
</style>
