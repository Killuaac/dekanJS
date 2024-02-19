let playerName = "";
let startTime = 0;
let gameInterval;
let monsters = [];
let traps = [];
let lives = 5;
let gameTime = 0;
let canvas;
let ctx;
let playerX = 150;
let playerY = 150;
let playerSpeed = 3;
let monsterSpeed = 1;
let monsterCount = 10;

let timerInterval;
let timerSeconds = 30;

const keysPressed = {};
document.addEventListener("keydown", function(event) {
keysPressed[event.key] = true;
});
document.addEventListener("keyup", function(event) {
delete keysPressed[event.key];
});

const loginScreen = document.getElementById("login-screen");
const gameScreen = document.getElementById("game-screen");
const resultsScreen = document.getElementById("results-screen");

function startGame() {
playerName = document.getElementById("username").value;
document.getElementById("player-name").textContent = playerName; // Обновляем имя игрока на экране
loginScreen.style.display = "none";
gameScreen.style.display = "block";
startTime = Date.now();
gameTime = 0;
lives = 5;

canvas = document.getElementById("game-canvas");
ctx = canvas.getContext("2d");

gameInterval = setInterval(updateGame, 20); // Уменьшаем интервал до 20 мс для плавного перемещения

generateMonsters();
generateTraps();

startTimer();
}

// Функция запуска таймера
function startTimer() {
// Отображаем начальное значение таймера
document.getElementById("timer").textContent = timerSeconds;

// Устанавливаем интервал для обновления таймера каждую секунду
timerInterval = setInterval(function() {
  timerSeconds--; // Уменьшаем счетчик каждую секунду
  document.getElementById("timer").textContent = timerSeconds;

  // Если таймер достиг нуля, обновляем количество монстров и сбрасываем таймер
  if (timerSeconds === 0) {
    generateMonsters();
    timerSeconds = 30; // Сбрасываем таймер обратно на 30 секунд
  }
}, 1000); // Интервал в миллисекундах (1000 мс = 1 секунда)
}

// Функция остановки таймера
function stopTimer() {
clearInterval(timerInterval);
}

// Функция обновления игры
function updateGame() {
clearCanvas();
updateTime();
updatePlayer(); // Добавлен вызов функции обновления позиции игрока
updateMonsters();
updateTraps();
drawPlayer(); // Добавлен вызов функции отрисовки игрока
checkCollisions();
if (lives <= 0) {
  endGame();
}
}

// Функция очистки холста
function clearCanvas() {
ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Функция обновления времени
function updateTime() {
let currentTime = new Date();
document.getElementById("current-time").textContent = currentTime.toLocaleTimeString();
gameTime = Math.floor((currentTime.getTime() - startTime) / 1000);
document.getElementById("game-time").textContent = formatTime(gameTime);
}

// Форматирование времени в формат "мм:сс"
function formatTime(seconds) {
let minutes = Math.floor(seconds / 60);
let remainingSeconds = seconds % 60;
return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// Функция обновления позиции игрока
function updatePlayer() {
if (keysPressed["ArrowUp"]) playerY -= playerSpeed;
if (keysPressed["ArrowDown"]) playerY += playerSpeed;
if (keysPressed["ArrowLeft"]) playerX -= playerSpeed;
if (keysPressed["ArrowRight"]) playerX += playerSpeed;
// Проверка, чтобы игрок не выходил за пределы поля
if (playerX < 0) playerX = 0;
if (playerY < 0) playerY = 0;
if (playerX > canvas.width - 20) playerX = canvas.width - 20;
if (playerY > canvas.height - 20) playerY = canvas.height - 20;
}

// Функция обновления монстров
function updateMonsters() {
for (let i = 0; i < monsters.length; i++) {
  let monster = monsters[i];
  let dx = playerX - monster.x;
  let dy = playerY - monster.y;
  let angle = Math.atan2(dy, dx);
  monster.x += monsterSpeed * Math.cos(angle);
  monster.y += monsterSpeed * Math.sin(angle);

  // Проверка, чтобы монстр не вышел за пределы поля
  if (monster.x < 0) monster.x = 0;
  if (monster.y < 0) monster.y = 0;
  if (monster.x > canvas.width - 20) monster.x = canvas.width - 20;
  if (monster.y > canvas.height - 20) monster.y = canvas.height - 20;

  ctx.fillStyle = "green"; // Цвет монстра (зеленый)
  ctx.beginPath(); // Начало рисования круга
  ctx.arc(monster.x + 10, monster.y + 10, 20, 0, Math.PI * 2); // Рисование круга
  ctx.fill(); // Заполнение круга
}
}

// Функция обновления ловушек
function updateTraps() {
for (let i = 0; i < traps.length; i++) {
  let trap = traps[i];
  ctx.fillStyle = "black"; // Цвет ловушки (черный)
  // Отрисовка звезды
  ctx.beginPath();
  ctx.moveTo(trap.x + 20, trap.y);
  ctx.lineTo(trap.x + 28, trap.y + 36);
  ctx.lineTo(trap.x, trap.y + 14);
  ctx.lineTo(trap.x + 40, trap.y + 14);
  ctx.lineTo(trap.x + 12, trap.y + 36);
  ctx.closePath();
  ctx.fill();
}
}

// Функция отрисовки игрока
function drawPlayer() {
ctx.fillStyle = "red"; // Цвет игрока (красный)
ctx.fillRect(playerX, playerY, 40, 40); // Пример размеров игрока (40x40 пикселей)
}

// Функция проверки столкновений
function checkCollisions() {
// Проверка столкновений игрока с монстрами
for (let i = 0; i < monsters.length; i++) {
  let monster = monsters[i];
  if (playerCollision(monster)) {
    // Уменьшаем количество жизней
    lives--;
    // Обновляем счетчик жизней на экране
    document.getElementById("lives").textContent = lives;
    // Удаляем монстра с карты или меняем его состояние
    monsters.splice(i, 1);
  }
}
// Проверка столкновений игрока с ловушками
for (let i = 0; i < traps.length; i++) {
  let trap = traps[i];
  if (playerCollision(trap)) {
    // Уменьшаем количество жизней
    lives--;
    // Обновляем счетчик жизней на экране
    document.getElementById("lives").textContent = lives;
    // Удаляем ловушку с карты или меняем её состояние
    traps.splice(i, 1);
  }
}
}

// Функция паузы игры
function togglePause() {
if (gameInterval) {
  clearInterval(gameInterval);
  gameInterval = null; // Убираем интервал, чтобы игра не запускалась повторно
} else {
  gameInterval = setInterval(updateGame, 20); // Возобновляем игру с тем же интервалом
}
}

// Функция завершения игры
function endGame() {
clearInterval(gameInterval);
stopTimer(); // Останавливаем таймер
gameScreen.style.display = "none";
resultsScreen.style.display = "block";
document.getElementById("result-time").textContent = formatTime(gameTime);
let monsterCount = monsters.length;
let trapCount = traps.length;
document.getElementById("result-monsters").textContent = monsterCount;
document.getElementById("result-traps").textContent = trapCount;
document.getElementById("result-lives").textContent = lives;
}

// Функция перезапуска игры
function restartGame() {
clearInterval(gameInterval);
gameScreen.style.display = "none";
resultsScreen.style.display = "none";
loginScreen.style.display = "block";
document.getElementById("username").value = "";
monsters = [];
traps = [];
lives = 5;
gameTime = 0;
clearCanvas();
}

// Функция генерации монстров
function generateMonsters() {
for (let i = 0; i < monsterCount; i++) { // Изменили количество монстров на monsterCount
  let monsterX = Math.floor(Math.random() * canvas.width);
  let monsterY = Math.floor(Math.random() * canvas.height);
  monsters.push({ x: monsterX, y: monsterY });
}
}

// Функция генерации ловушек
function generateTraps() {
for (let i = 0; i < 15; i++) { // Изменили количество ловушек на 15
  let trapX = Math.floor(Math.random() * canvas.width);
  let trapY = Math.floor(Math.random() * canvas.height);
  traps.push({ x: trapX, y: trapY });
}
}

// Функция определения столкновений игрока с объектами
function playerCollision(object) {
return (playerX < object.x + 40 &&
        playerX + 40 > object.x &&
        playerY < object.y + 40 &&
        playerY + 40 > object.y);
}