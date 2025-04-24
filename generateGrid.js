const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

// 이미지 크기 설정
const width = 1600;
const height = 1600;
const gridSize = 9;
const cellSize = width / gridSize;

// 캔버스 생성
const canvas = createCanvas(width, height);
const ctx = canvas.getContext("2d");

// 색상 정의 (이미지에서 보이는 색상)
const colors = [
    "#8a9a5b", // 어두운 녹색
    "#f0efd0", // 연한 베이지색
];

// 그리드 그리기
for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
        // 체스판 패턴으로 색상 번갈아가며 적용
        const colorIndex = (row + col) % 2;
        ctx.fillStyle = colors[colorIndex];

        // 셀 그리기
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
    }
}

// 이미지 저장
const buffer = canvas.toBuffer("image/png");
fs.writeFileSync(path.join(__dirname, "grid-9x9.png"), buffer);

console.log("9x9 그리드 이미지가 생성되었습니다: grid-9x9.png");
