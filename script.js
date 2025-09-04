document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const startButton = document.getElementById('start-btn');
    const pauseButton = document.getElementById('pause-btn');
    const difficultySelect = document.getElementById('difficulty');
    const speedSlider = document.getElementById('speed-slider');
    const speedValue = document.getElementById('speed-value');

    // 游戏配置
    const gridSize = 20; // 网格大小
    const initialSnakeLength = 3; // 初始蛇的长度
    let snake = []; // 蛇的身体部分
    let food = {}; // 食物位置
    let direction = 'right'; // 初始方向
    let nextDirection = 'right'; // 下一个方向
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    let gameInterval;
    let gameSpeed;
    let gameRunning = false;
    let gamePaused = false;

    // 设置高分
    highScoreElement.textContent = highScore;

    // 难度设置
    const speeds = {
        easy: 150,
        medium: 100,
        hard: 70
    };
    
    // 速度倍率（默认为1，表示100%）
    let speedMultiplier = 1;

    // 初始化游戏
    function initGame() {
        clearInterval(gameInterval);
        snake = [];
        score = 0;
        scoreElement.textContent = score;
        direction = 'right';
        nextDirection = 'right';
        
        // 创建初始蛇
        for (let i = initialSnakeLength - 1; i >= 0; i--) {
            snake.push({ x: i, y: 0 });
        }
        
        // 生成第一个食物
        generateFood();
        
        // 设置游戏速度
        gameSpeed = Math.round(speeds[difficultySelect.value] / speedMultiplier);
        
        // 绘制初始状态
        draw();
    }

    // 开始游戏
    function startGame() {
        if (!gameRunning) {
            initGame();
            gameRunning = true;
            gamePaused = false;
            startButton.textContent = '重新开始';
            pauseButton.disabled = false;
            gameInterval = setInterval(gameLoop, gameSpeed);
        } else {
            initGame();
            gamePaused = false;
            pauseButton.textContent = '暂停';
            gameInterval = setInterval(gameLoop, gameSpeed);
        }
    }

    // 暂停游戏
    function togglePause() {
        if (gameRunning) {
            if (gamePaused) {
                gamePaused = false;
                pauseButton.textContent = '暂停';
                gameInterval = setInterval(gameLoop, gameSpeed);
            } else {
                gamePaused = true;
                pauseButton.textContent = '继续';
                clearInterval(gameInterval);
            }
        }
    }

    // 游戏主循环
    function gameLoop() {
        moveSnake();
        if (checkCollision()) {
            gameOver();
            return;
        }
        checkFood();
        draw();
    }

    // 移动蛇
    function moveSnake() {
        direction = nextDirection;
        
        // 根据当前方向计算蛇头的新位置
        const head = { ...snake[0] };
        switch (direction) {
            case 'up':
                head.y -= 1;
                break;
            case 'down':
                head.y += 1;
                break;
            case 'left':
                head.x -= 1;
                break;
            case 'right':
                head.x += 1;
                break;
        }
        
        // 将新头部添加到蛇的开始
        snake.unshift(head);
        
        // 如果没有吃到食物，移除尾部；否则保留尾部，蛇会变长
        if (head.x !== food.x && head.y !== food.y) {
            snake.pop();
        }
    }

    // 检查碰撞
    function checkCollision() {
        const head = snake[0];
        
        // 检查是否撞墙
        if (
            head.x < 0 ||
            head.y < 0 ||
            head.x >= canvas.width / gridSize ||
            head.y >= canvas.height / gridSize
        ) {
            return true;
        }
        
        // 检查是否撞到自己的身体
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                return true;
            }
        }
        
        return false;
    }

    // 检查是否吃到食物
    function checkFood() {
        const head = snake[0];
        
        if (head.x === food.x && head.y === food.y) {
            // 增加分数
            score += 10;
            scoreElement.textContent = score;
            
            // 更新最高分
            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('snakeHighScore', highScore);
            }
            
            // 生成新食物
            generateFood();
        }
    }

    // 生成食物
    function generateFood() {
        const maxX = canvas.width / gridSize - 1;
        const maxY = canvas.height / gridSize - 1;
        
        // 生成随机位置
        let newFood;
        let foodOnSnake;
        
        do {
            foodOnSnake = false;
            newFood = {
                x: Math.floor(Math.random() * maxX) + 1,
                y: Math.floor(Math.random() * maxY) + 1
            };
            
            // 检查食物是否生成在蛇身上
            for (let segment of snake) {
                if (segment.x === newFood.x && segment.y === newFood.y) {
                    foodOnSnake = true;
                    break;
                }
            }
        } while (foodOnSnake);
        
        food = newFood;
    }

    // 绘制游戏
    function draw() {
        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制蛇
        snake.forEach((segment, index) => {
            // 蛇头用深绿色，身体用绿色
            ctx.fillStyle = index === 0 ? '#388E3C' : '#4CAF50';
            ctx.fillRect(
                segment.x * gridSize,
                segment.y * gridSize,
                gridSize - 1,
                gridSize - 1
            );
        });
        
        // 绘制食物
        ctx.fillStyle = '#F44336';
        ctx.fillRect(
            food.x * gridSize,
            food.y * gridSize,
            gridSize - 1,
            gridSize - 1
        );
        
        // 绘制网格（可选）
        drawGrid();
    }

    // 绘制网格
    function drawGrid() {
        ctx.strokeStyle = '#E0E0E0';
        ctx.lineWidth = 0.5;
        
        // 绘制垂直线
        for (let x = 0; x <= canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        // 绘制水平线
        for (let y = 0; y <= canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }

    // 游戏结束
    function gameOver() {
        clearInterval(gameInterval);
        gameRunning = false;
        startButton.textContent = '开始游戏';
        pauseButton.disabled = true;
        
        // 绘制游戏结束信息
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = '30px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('游戏结束!', canvas.width / 2, canvas.height / 2 - 30);
        
        ctx.font = '20px Arial';
        ctx.fillText(`得分: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
        ctx.fillText('按开始游戏重新开始', canvas.width / 2, canvas.height / 2 + 40);
    }

    // 键盘控制
    document.addEventListener('keydown', (event) => {
        if (!gameRunning || gamePaused) return;
        
        switch (event.key) {
            case 'ArrowUp':
                if (direction !== 'down') nextDirection = 'up';
                break;
            case 'ArrowDown':
                if (direction !== 'up') nextDirection = 'down';
                break;
            case 'ArrowLeft':
                if (direction !== 'right') nextDirection = 'left';
                break;
            case 'ArrowRight':
                if (direction !== 'left') nextDirection = 'right';
                break;
        }
    });

    // 按钮事件监听
    startButton.addEventListener('click', startGame);
    pauseButton.addEventListener('click', togglePause);
    pauseButton.disabled = true;
    
    // 难度选择事件监听
    difficultySelect.addEventListener('change', () => {
        if (gameRunning && !gamePaused) {
            clearInterval(gameInterval);
            gameSpeed = Math.round(speeds[difficultySelect.value] / speedMultiplier);
            gameInterval = setInterval(gameLoop, gameSpeed);
        } else {
            gameSpeed = Math.round(speeds[difficultySelect.value] / speedMultiplier);
        }
    });
    
    // 速度滑块事件监听
    speedSlider.addEventListener('input', () => {
        // 更新显示的速度值
        speedValue.textContent = speedSlider.value;
        
        // 计算速度倍率（值越大，速度越快）
        speedMultiplier = speedSlider.value / 100;
        
        // 如果游戏正在运行且未暂停，则更新游戏速度
        if (gameRunning && !gamePaused) {
            clearInterval(gameInterval);
            gameSpeed = Math.round(speeds[difficultySelect.value] / speedMultiplier);
            gameInterval = setInterval(gameLoop, gameSpeed);
        } else {
            gameSpeed = Math.round(speeds[difficultySelect.value] / speedMultiplier);
        }
    });

    // 初始绘制空白游戏区域
    drawGrid();
});