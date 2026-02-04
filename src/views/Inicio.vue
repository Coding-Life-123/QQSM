<template>
  <div class="inicio-container">
    <!-- Fondo con dinero cayendo -->
    <div class="money-rain">
      <div
        v-for="n in 30"
        :key="n"
        class="money-bill"
        :style="getMoneyStyle(n)"
      >
        💵
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="content">
      <h1 class="title">
        <span class="title-line">¿QUIÉN QUIERE</span>
        <span class="title-line">SER MILLONARIO?</span>
      </h1>

      <div class="register-box">
        <h2>Registro de Jugador</h2>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="username">Nombre del Jugador:</label>
            <input
              type="text"
              id="username"
              v-model="username"
              placeholder="Ingresa tu nombre"
              required
              maxlength="20"
            />
          </div>

          <div class="form-group">
            <label>Selecciona tu Ícono:</label>
            <div class="icons-grid">
              <button
                v-for="icon in availableIcons"
                :key="icon"
                type="button"
                @click="selectedIcon = icon"
                class="icon-btn"
                :class="{ selected: selectedIcon === icon }"
              >
                {{ icon }}
              </button>
            </div>
          </div>

          <button type="submit" class="btn-start">COMENZAR JUEGO</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const username = ref("");
const selectedIcon = ref("👤");

const availableIcons = [
  "👤",
  "😎",
  "🤓",
  "👨‍💼",
  "👩‍💼",
  "🧑‍🎓",
  "👑",
  "🎩",
  "🤠",
  "🧙‍♂️",
  "🦸‍♂️",
  "🦸‍♀️",
];

const getMoneyStyle = (n) => {
  return {
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${5 + Math.random() * 5}s`,
    fontSize: `${20 + Math.random() * 20}px`,
  };
};

const handleSubmit = () => {
  if (username.value.trim()) {
    localStorage.setItem("playerName", username.value.trim());
    localStorage.setItem("playerIcon", selectedIcon.value);
    router.push("/juego");
  }
};
</script>

<style scoped>
.inicio-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.money-rain {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.money-bill {
  position: absolute;
  top: -50px;
  animation: fall linear infinite;
  opacity: 0.7;
}

@keyframes fall {
  to {
    transform: translateY(100vh) rotate(360deg);
  }
}

.content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 20px;
}

.title {
  font-size: 4rem;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.6),
    0 0 30px rgba(255, 215, 0, 0.4), 3px 3px 6px rgba(0, 0, 0, 0.8);
  margin-bottom: 3rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  animation: pulse 2s ease-in-out infinite;
}

.title-line {
  display: block;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.register-box {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 3rem 2.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.3);
  max-width: 500px;
  margin: 0 auto;
  border: 3px solid #ffd700;
}

.register-box h2 {
  color: #1a1a2e;
  margin-bottom: 2rem;
  font-size: 1.8rem;
}

.form-group {
  margin-bottom: 2rem;
}

.form-group label {
  display: block;
  color: #1a1a2e;
  font-weight: bold;
  margin-bottom: 0.8rem;
  font-size: 1.1rem;
  text-align: left;
}

.form-group input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #ddd;
  border-radius: 10px;
  font-size: 1.1rem;
  transition: all 0.3s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #ffd700;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

/* Icon Selector */
.icons-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.8rem;
  margin-top: 0.8rem;
}

.icon-btn {
  width: 100%;
  aspect-ratio: 1;
  font-size: 2rem;
  background: rgba(255, 215, 0, 0.1);
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background: rgba(255, 215, 0, 0.2);
  border-color: #ffd700;
  transform: scale(1.1);
}

.icon-btn.selected {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  border-color: #ffd700;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.5);
  transform: scale(1.15);
}

.btn-start {
  width: 100%;
  padding: 1.2rem;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #1a1a2e;
  border: none;
  border-radius: 10px;
  font-size: 1.3rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 5px 15px rgba(255, 215, 0, 0.4);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 1rem;
}

.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 215, 0, 0.6);
}

.btn-start:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .title {
    font-size: 2.5rem;
  }

  .register-box {
    padding: 2rem 1.5rem;
    max-width: 90%;
  }
}
</style>
